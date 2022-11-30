const { isMemberOrStaff } = require('../../../src/models/organization')

/**
 * org:member
 *
 * Scope if member of org
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function memberOrg(uid, { id }) {
  try {
    return await isMemberOrStaff(id, uid)
  } catch (e) {
    return false
  }
}

module.exports = memberOrg
