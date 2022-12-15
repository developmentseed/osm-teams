const db = require('../../../src/lib/db')

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
async function clients(uid) {
  try {
    const [user] = await db('users').where('id', uid)
    if (user) {
      return true
    }
  } catch (error) {
    throw Error('Forbidden')
  }
}

module.exports = clients
