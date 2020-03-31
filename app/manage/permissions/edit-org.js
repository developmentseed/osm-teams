const { isOwner } = require('../../lib/organization')

/**
 * organization:edit
 *
 * To edit an organization or delete it, the authenticated user needs
 * to be an owner in the organization
 *
 * @param {int} uid - user id
 * @param {Object} params - request parameters
 * @param {int} params.id - organization id
 * @returns {boolean}
 */
async function editOrg (uid, { id }) {
  return isOwner(id, uid)
}

module.exports = editOrg
