const { isOwner } = require('../../../src/models/organization')

/**
 * organization:edit
 *
 * To edit an organization or delete it, the authenticated user needs
 * to be an owner in the organization
 *
 * @param {int} uid - user id
 * @param {Object} params - request parameters
 * @param {int} params.id - organization id
 * @returns {Promise<boolean>}
 */
async function editOrg(uid, { id }) {
  if (!uid) {
    return false
  }
  return isOwner(id, uid)
}

module.exports = editOrg
