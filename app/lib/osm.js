/**
 * OSM SDK
 *
 * Route middleware to interact with OSM OAuth
 */
const passport = require('passport-light')
const R = require('ramda')
const hydra = require('./hydra')
const url = require('url')
const db = require('../../src/lib/db')
const xml2js = require('xml2js')
const InternalOAuthError = require('passport-oauth').InternalOAuthError
const OSMStrategy = require('passport-openstreetmap').Strategy

const logger = require('../../src/lib/logger')

const OSM_DOMAIN = process.env.OSM_DOMAIN
const OSM_CONSUMER_KEY = process.env.OSM_CONSUMER_KEY
const OSM_CONSUMER_SECRET = process.env.OSM_CONSUMER_SECRET
const OSM_API = process.env.OSM_API

// get an authentication token pair from openstreetmap
function openstreetmap(req, res) {
  const query = url.parse(req.url, true).query
  const challenge = query.login_challenge

  /**
   * override the userProfile method of OSMStrategy to allow for custom osm endpoints
   */
  OSMStrategy.prototype.userProfile = function (
    token,
    tokenSecret,
    params,
    done
  ) {
    this._oauth.get(
      `${OSM_API}/api/0.6/user/details`,
      token,
      tokenSecret,
      function (err, body) {
        if (err) {
          return done(
            new InternalOAuthError('failed to fetch user profile', err)
          )
        }

        var parser = new xml2js.Parser()
        parser.parseString(body, function (err, xml) {
          if (err) {
            return done(err)
          }

          var profile = { provider: 'openstreetmap' }
          const user = xml.osm.user[0]
          profile.id = user['$'].id
          profile.displayName = user['$'].display_name

          profile._raw = body
          profile._xml2json = profile._xml2js = xml

          done(null, profile)
        })
      }
    )
  }

  const strategy = new OSMStrategy(
    {
      requestTokenURL: `${OSM_API}/oauth/request_token`,
      accessTokenURL: `${OSM_API}/oauth/access_token`,
      userAuthorizationURL: `${OSM_DOMAIN}/oauth/authorize`,
      consumerKey: OSM_CONSUMER_KEY,
      consumerSecret: OSM_CONSUMER_SECRET,
      callbackURL: `${
        process.env.APP_URL
      }/oauth/openstreetmap/callback?login_challenge=${encodeURIComponent(
        challenge
      )}`,
    },
    async (token, tokenSecret, profile, done) => {
      let [user] = await db('users').where('id', profile.id)
      if (user) {
        const newProfile = R.mergeDeepRight(user.profile, profile)
        await db('users')
          .where('id', profile.id)
          .update({
            osmToken: token,
            osmTokenSecret: tokenSecret,
            profile: JSON.stringify(newProfile),
          })
      } else {
        await db('users').insert({
          id: profile.id,
          osmToken: token,
          osmTokenSecret: tokenSecret,
          profile: JSON.stringify(profile),
        })
      }
      done(null, profile)
    }
  )

  passport.authenticate(strategy, {
    req: req,
    redirect: function (url) {
      res.redirect(url)
    },
    success: function (user) {
      if (challenge) {
        hydra
          .acceptLoginRequest(challenge, {
            subject: user.id,
            remember: true,
            remember_for: 0,
          })
          .then((response) => {
            if (response.redirect_to) {
              return res.redirect(response.redirect_to)
            } else {
              return res.redirect('/')
            }
          })
          .catch((e) => {
            logger.error(e)
            return res.redirect('/')
          })
      } else {
        return res.redirect('/')
      }
    },
    pass: function () {
      return res.status(401)
    },
    fail: function (challenge, status) {
      res.status(status).send(challenge)
    },
    error: function (err) {
      res.status(500).send(err)
    },
  })
}

module.exports = {
  openstreetmap,
}
