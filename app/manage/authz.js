const jwt = require('jsonwebtoken')
const db = require('../db')
const hydra = require('../lib/hydra')

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
 * Attaches the user from the jwt to the session
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

/**
 * Takes an access token 
 * If it's valid, set the user id in the response and forward to the next
 * middleware. If it's not valid, send a 401
 * 
 * @param {String} token Access Token
 * @param {Object} res Response object
 * @param {Function} next Express middleware next
 */
async function acceptToken (token, res, next) {
  let result = await hydra.introspect(token)
  if (result && result.active) {
    res.locals.user_id = result.sub
    return next()
  }
  else {
    // Delete this accessToken ? 
    return res.status(401).send('Access denied, expired token')
  }
}

/**
 * Protected routes first check the session for the user,
 * Get the associated accessToken from the database, and check for 
 * the accessToken validity with hydra. If there isn't a session,
 * it checks for an Authorization header with a valid access token
 */
async function protected (req, res, next) {
  if (req.session && req.session.user_id) {
    // We have a session, we can use the user id to get the access token
    try {
      let conn = await db()
      let [userTokens] = await conn('users').where('id', req.session.user_id)
      const token = userTokens.manageToken.access_token
      return acceptToken(token, res, next)
    } catch (err) {
      return res.status(500).send('Could not authorize user')
    }
  } else {
    // We don't have a session, probably an API route, check for an access token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      const token = req.headers.authorization.split(' ')[1]
      return acceptToken(token, res, next)
    } else {
      return res.status(401).send('Access denied')
    }
  }
}

module.exports = {
  attachUser,
  protected
}