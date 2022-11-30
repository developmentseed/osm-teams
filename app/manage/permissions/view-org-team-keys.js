const { isOwner, isOrgTeamModerator } = require('../../../src/models/organization')

/**
 * organization:view-team-keys
 *
 * To edit an organization or delete it, the authenticated user needs
 * to be an owner in the organization
 *
 * @param {int} uid - user id
 * @param {Object} params - request parameters
 * @param {int} params.id - organization id
 * @returns {Promise<boolean>}
 */
async function editOrg(uid, { id }) {
  const teamModerator = await isOrgTeamModerator(id, uid)
  return teamModerator || isOwner(id, uid)
}

module.exports = editOrg
