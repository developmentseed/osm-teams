const db = require('../../db')

/**
 * clients
 *
 * To access the clients API, requests need to be authenticated
 * with a signed up user
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function clients (uid) {
  let conn = await db()
  const [user] = await conn('users').where('id', uid)
  if (user) {
    return true
  }
}

module.exports = clients
