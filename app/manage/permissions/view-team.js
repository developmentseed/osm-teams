const { isModerator } = require('../../lib/team')

/**
 * team:view
 *
 * To view a team, the authenticated user needs to
 * be a moderator of the team
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function viewTeam (uid, { id }) {
  return isModerator(id, uid)
}

module.exports = viewTeam
