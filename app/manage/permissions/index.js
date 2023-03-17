const Boom = require('boom')
const { mergeAll, isNil } = require('ramda')

const metaPermissions = {
  'public:authenticated': (uid) => !isNil(uid), // User needs to be authenticated
}

const userPermissions = {
  'user:edit': require('./edit-user'),
}

const keyPermissions = {
  'key:edit': require('./edit-key'),
}

const teamPermissions = {
  'team:edit': require('./edit-team'),
  'team:join': require('./join-team'),
  'team:member': require('./member-team'),
}

const organizationPermissions = {
  'organization:edit': require('./edit-org'),
  'organization:member': require('./member-org'),
  'organization:view-team-keys': require('./view-org-team-keys'),
}

const clientPermissions = {
  clients: require('./clients'),
  'client:delete': require('./delete-client'),
}

const permissions = mergeAll([
  metaPermissions,
  userPermissions,
  keyPermissions,
  teamPermissions,
  clientPermissions,
  organizationPermissions,
])

/**
 * Check if a user has a specific permission
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} ability String representing a specific permission, for example: `team:create`
 */
async function checkPermission(req, res, ability) {
  return permissions[ability](req.session?.user_id, req.params)
}

/**
 * Given a permission, check if the user is allowed to perform the action
 * @param {string} ability the permission
 */
function check(ability) {
  return async function (req, res, next) {
    /**
     * Permissions decision function
     * @param {string} uid user id
     * @param {Object} params request parameters
     * @returns {boolean} can the request go through?
     */
    let allowed = await checkPermission(req, res, ability)

    if (allowed) {
      next()
    } else {
      throw Boom.unauthorized('Forbidden')
    }
  }
}

module.exports = {
  can: (ability) => {
    return [check(ability)]
  },
  check,
}
