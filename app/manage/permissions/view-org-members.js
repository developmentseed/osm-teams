const { isPublic, isMemberOrStaff } = require('../../../src/models/organization')

/**
 * org:view-members
 *
 * To view an org's members, the org needs to be either public
 * or the user should be a member of the org
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function viewOrgMembers(uid, { id }) {
  try {
    const publicOrg = await isPublic(id)
    if (publicOrg) return publicOrg
    return await isMemberOrStaff(id, uid)
  } catch (e) {
    console.error(e)
    return false
  }
}

module.exports = viewOrgMembers
