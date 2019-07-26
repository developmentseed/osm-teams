const db = require('../../db')
const hydra = require('../../lib/hydra')
const { mergeAll } = require('ramda')

const metaPermissions = {
  'public': () => true
}

const teamPermissions = {
  'team:create': require('./create-team'),
  'team:update': require('./update-team'),
  'team:view': require('./view-team'),
  'team:delete': require('./delete-team')
}

const clientPermissions = {
  'clients:view': require('./view-clients')
}

/**
 * Takes an access token
 * If it's valid, set the user id in the response object res.locals and forward to the next
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
async function authenticate (req, res, next) {
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

/**
 * Given a permission, check if the user is allowed to perform the action
 * @param {string} ability the permission
 */
function check (ability) {
  return async function (req, res, next) {
    const isAllowed = mergeAll([
      metaPermissions,
      teamPermissions,
      clientPermissions
    ])

    /**
     * Permissions decision function
     * @param {string} uid user id
     * @param {Object} params request parameters
     * @returns {boolean} can the request go through?
     */
    let allowed = await isAllowed[ability](res.locals.user_id, req.params)

    if (allowed) {
      next()
    } else {
      res.status(403).send('Forbidden')
    }
  }
}

module.exports = {
  can: (ability) => {
    return [authenticate, check(ability)]
  },
  authenticate,
  check
}
