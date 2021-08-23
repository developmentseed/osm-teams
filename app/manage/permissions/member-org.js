const { isMember, isOwner, isManager } = require('../../lib/organization')

/**
 * org:member
 *
 * Scope if member of org
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function memberOrg (uid, { id }) {
  try {
    const [member, owner, manager] = await Promise.all([
      isMember(id, uid),
      isOwner(id, uid),
      isManager(id, uid)
    ])
    return member || owner || manager
  } catch (e) {
    return false
  }
}

module.exports = memberOrg
