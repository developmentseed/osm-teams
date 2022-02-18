const { isPublic, isMember } = require('../../lib/team')

/**
 * team:view-members
 *
 * To view a team's members, the team needs to be either public
 * or the user should be a member of the team
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function viewTeamMembers (uid, { id }) {
  const publicTeam = await isPublic(id)
  if (publicTeam) return publicTeam

  try {
    return await isMember(id, uid)
  } catch (e) {
    return false
  }
}

module.exports = viewTeamMembers