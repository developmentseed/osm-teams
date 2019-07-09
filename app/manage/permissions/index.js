const db = require('../../db')
const hydra = require('../../lib/hydra')

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
  } else {
    // Delete this accessToken ?
    return res.status(401).send('Access denied, expired token')
  }
}

/**
 * Routes with `authenticate` middleware first check the session for the user,
 * Get the associated accessToken from the database, and check for
 * the accessToken validity with hydra. If there isn't a session,
 * it checks for an Authorization header with a valid access token
 */
export default async function authenticate (req, res, next) {
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
