const db = require('../../db')
const hydra = require('../../lib/hydra')
const { mergeAll } = require('ramda')

const metaPermissions = {
  'public:authenticated': () => true
}

const teamPermissions = {
  'team:create': require('./create-team'),
  'team:update': require('./update-team'),
  'team:view': require('./view-team'),
  'team:delete': require('./delete-team'),
  'team:join': require('./join-team')
}

const clientPermissions = {
  'clients': require('./clients'),
  'client:delete': require('./delete-client')
}

const permissions = mergeAll([
  metaPermissions,
  teamPermissions,
  clientPermissions
])

/**
 * Check if a user has a specific permission
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} ability String representing a specific permission, for example: `team:create`
 */
async function checkPermission (req, res, ability) {
  const locals = res.locals || {}
  return permissions[ability](locals.user_id, req.params)
}

/**
 * Get token from authorization header or session
 * depending on the request
 *
 * @param {Object} req Request object
 * @return {String} token
 */
async function getToken (req) {
  let token
  if (req.session && req.session.user_id) {
    token = await getSessionToken(req)
  } else if (req.headers.authorization) {
    token = getAuthHeaderToken(req)
  }
  return token
}

/**
 * Get token from the session
 *
 * @param {Object} req Request object
 * @return {String} token
 */
async function getSessionToken (req) {
  try {
    let conn = await db()
    let [userTokens] = await conn('users').where('id', req.session.user_id)
    return userTokens.manageToken.access_token
  } catch (err) {
    throw err
  }
}

/**
 * Get token from the authorization header
 *
 * @param {Object} req Request object
 * @return {String} token
 */
function getAuthHeaderToken (req) {
  const [type, token] = req.headers.authorization.split(' ')
  if (type !== 'Bearer') throw new Error('Authorization scheme not supported. Only Bearer scheme is supported')
  return token
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
    return res.boom.unauthorized('Expired token')
  }
}

/**
 * Routes with `authenticate` middleware first check the session for the user,
 * Get the associated accessToken from the database, and check for
 * the accessToken validity with hydra. If there isn't a session,
 * it checks for an Authorization header with a valid access token
 */
async function authenticate (req, res, next) {
  try {
    const token = await getToken(req)

    // if token exists, move to next middleware to check permissions
    if (token) return acceptToken(token, res, next)

    // if no token, check ability in next middleware to see if user has access anyway in the case of public resources
    return next()
  } catch (e) {
    console.log('error getting token', e)
    return res.boom.unauthorized('Forbidden')
  }
}

/**
 * Given a permission, check if the user is allowed to perform the action
 * @param {string} ability the permission
 */
function check (ability) {
  return async function (req, res, next) {
    /**
     * Permissions decision function
     * @param {string} uid user id
     * @param {Object} params request parameters
     * @returns {boolean} can the request go through?
     */
    try {
      let allowed = await checkPermission(req, res, ability)

      if (allowed) {
        next()
      } else {
        res.boom.unauthorized('Forbidden')
      }
    } catch (e) {
      console.error('error checking permission', e)
      // An error occurred checking the permissions
      // if user id is missing it's an authentication problem
      if (e.message.includes('osm id is required')) {
        return res.boom.unauthorized('Forbidden')
      }

      // otherwise it could be the resource not existing, we send 404
      res.boom.notFound('Could not find resource')
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
