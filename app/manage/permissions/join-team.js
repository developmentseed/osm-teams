const { isPublic, isMember } = require('../../lib/team')

/**
 * team:join
 *
 * To join a team, the team must be public
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function joinTeam (uid, { id }) {
  const publicTeam = await isPublic(id)
  const member = await isMember(id, uid)
  return publicTeam && !member
}

module.exports = joinTeam
