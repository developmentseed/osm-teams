const { isModerator } = require('../../lib/team')

/**
 * team:delete
 *
 * To delete a team, the authenticated user needs to
 * be a moderator of the team
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function deleteTeam (uid, { id }) {
  return isModerator(id, uid)
}

module.exports = deleteTeam
