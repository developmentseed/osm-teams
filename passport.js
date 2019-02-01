const boom = require('boom')
const passport = require('passport-light')
const OSMStrategy = require('passport-openstreetmap').Strategy
const team = require('./lib/team')

const { serverRuntimeConfig, publicRuntimeConfig } = require('./next.config')

const strategy = new OSMStrategy({
  requestTokenURL: 'https://www.openstreetmap.org/oauth/request_token',
  accessTokenURL: 'https://www.openstreetmap.org/oauth/access_token',
  userAuthorizationURL: 'https://www.openstreetmap.org/oauth/authorize',
  consumerKey: serverRuntimeConfig.OSM_CONSUMER_KEY,
  consumerSecret: serverRuntimeConfig.OSM_CONSUMER_SECRET,
  callbackURL: `${publicRuntimeConfig.apiUrl}/openstreetmap/callback`
}, async (token, tokenSecret, profile, done) => {
  // Store token / tokenSecret somewhere
  done(null, profile)
})

// ensure a user is logged in (middleware)
function ensureLogin () {
  return function (req, res, next) {
    if (req.session && !req.session.user) {
      req.session.returnTo = req.raw.originalURL || req.raw.url
      return res.redirect('/login')
    }
    next()
  }
}

// proceed if user is a moderator
function authorizeModerator () {
  return async function (req, res, next) {
    if (!req.session || (req.session && !req.session.user)) {
      return boom.notAllowed()
    }

    const user = req.session.user
    const teamId = req.params.id
    const isModerator = await team.isModerator(teamId, user.id)

    if (!isModerator) {
      return boom.notAllowed()
    }

    next()
  }
}

// get an authentication token pair from openstreetmap
function openstreetmap (req, res) {
  passport.authenticate(strategy, {
    req: req,
    redirect: function (url, status) { res.redirect(url, status) },
    success: function (user) {
      req.session.user = user

      if (req.session.returnTo) {
        const returnTo = req.session.returnTo
        delete req.session.returnTo
        return res.redirect(returnTo)
      } else {
        return res.redirect('/')
      }
    },
    pass: function () { res.sendStatus(401) },
    fail: function (challenge, status) { res.status(status).send(challenge) },
    error: function (err) { res.status(500).send(err) }
  })
}

module.exports = {
  openstreetmap,
  ensureLogin,
  authorizeModerator
}
