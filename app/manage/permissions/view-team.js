const { isPublic, isMember } = require('../../lib/team')

/**
 * team:view
 *
 * To view a team, the team needs to be either public
 * or the user should be a member of the team
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function viewTeam (uid, { id }) {
  return isPublic(id) || isMember(id, uid)
}

module.exports = viewTeam
