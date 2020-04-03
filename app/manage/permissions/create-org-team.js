const { isOwner, isManager } = require('../../lib/organization')

/**
 * organization:create-team
 *
 * To create a team within an organization, you have to be
 * a manager of the organization
 *
 * @param {int} uid - user id
 * @param {Object} params - request parameters
 * @param {int} params.id - organization id
 * @returns {Promise<boolean>}
 */
async function createOrgTeam (uid, { id }) {
  return (await isOwner(id, uid)) || isManager(id, uid)
}

module.exports = createOrgTeam
