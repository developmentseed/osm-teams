
const passport = require('passport-light')
const OSMStrategy = require('passport-openstreetmap').Strategy

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
  ensureLogin
}
