/**
 * user:edit
 *
 * Only the same user id can update its profile
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {Promise<boolean>} can the request go through?
 */
async function updateUser (uid, { id }) {
  // user has to be authenticated
  if (!uid) return false

  return (uid === id)
}

module.exports = updateUser
