const passport = require('passport-light')
const OSMStrategy = require('passport-openstreetmap').Strategy

const { OSM_CONSUMER_KEY, OSM_CONSUMER_SECRET, API_URL } = process.env

const strategy = new OSMStrategy({
  requestTokenURL: 'https://www.openstreetmap.org/oauth/request_token',
  accessTokenURL: 'https://www.openstreetmap.org/oauth/access_token',
  userAuthorizationURL: 'https://www.openstreetmap.org/oauth/authorize',
  consumerKey: OSM_CONSUMER_KEY,
  consumerSecret: OSM_CONSUMER_SECRET,
  callbackURL: `${API_URL}/openstreetmap/callback`
}, async (token, tokenSecret, profile, done) => {
  // Store token profile somewhere
  done(null, profile)
})

function openstreetmap (req, res) {
  passport.authenticate(strategy, {
    req: req,
    redirect: function (url, status) { res.redirect(url, status) },
    success: function (user, info) { res.send(user) },
    pass: function () { res.sendStatus(401) },
    fail: function (challenge, status) { res.status(status).send(challenge) },
    error: function (err) { res.status(500).send(err) }
  })
}

module.exports = {
  openstreetmap
}
