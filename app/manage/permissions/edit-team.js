const { isModerator, associatedOrg } = require('../../lib/team')
const { isOwner } = require('../../lib/organization')

/**
 * team:update
 *
 * To update a team, the authenticated user needs to
 * be a moderator of the team or an owner of the organization
 * that the team is associated to
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {Promise<boolean>} can the request go through?
 */
async function updateTeam (uid, { id }) {
  // user has to be authenticated
  if (!uid) return false

  // check if user is an owner of this team through an organization
  const org = await associatedOrg(id)
  const ownerOfTeam = org && (await isOwner(org, uid))

  return ownerOfTeam || isModerator(id, uid)
}

module.exports = updateTeam
