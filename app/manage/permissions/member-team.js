const { isMember } = require('../../lib/team')

/**
 * team:member
 *
 * Scope if member of team
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function memberTeam (uid, { id }) {
  try {
    return await isMember(id, uid)
  } catch (e) {
    return false
  }
}

module.exports = memberTeam
