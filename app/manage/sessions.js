const jwt = require('jsonwebtoken')
const session = require('express-session')

const { serverRuntimeConfig } = require('../../next.config')

/**
 * Configure the session
 */
const SESSION_SECRET = serverRuntimeConfig.SESSION_SECRET || 'super-secret-sessions'
let sessionConfig = {
  name: 'osm-hydra-sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  expires: new Date(Date.now() + (30 * 86400 * 1000))
}

/**
 * Returns true if a jwt is still valid
 *
 * @param {jwt} decoded the decoded jwt token
 */
function assertAlive (decoded) {
  const now = Date.now().valueOf() / 1000
  if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
    return false
  }
  if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
    return false
  }
  return true
}

/**
 * After we've logged in, we should have a jwt token in the session
 * We attach the information from the jwt token to the session
 */
function attachUser () {
  return function (req, res, next) {
    if (req.session) {
      if (req.session.idToken) {
        // We have an id_token, let's check if it's still valid
        const decoded = jwt.decode(req.session.idToken)
        if (assertAlive(decoded)) {
          req.session.user_id = decoded.sub
          req.session.user = decoded.preferred_username
          req.session.user_picture = decoded.picture
          return next()
        } else {
          // no longer alive, let's flush the session
          req.session.destroy(function (err) {
            if (err) next(err)
            return next()
          })
        }
      }
    }
    next()
  }
}

const sessionMiddleware = [session(sessionConfig), attachUser()]
export default sessionMiddleware
