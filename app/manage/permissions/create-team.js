const db = require('../../db')

/**
 * team:create
 *
 * To access the clients API, requests need to be authenticated
 * with a signed up user
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function createTeam (uid) {
  if (!uid) return Promise.reject(new Error('osm id is required as first argument'))
  let conn = await db()
  const [user] = await conn('users').where('id', uid)
  if (user) {
    return true
  }
}

module.exports = createTeam
