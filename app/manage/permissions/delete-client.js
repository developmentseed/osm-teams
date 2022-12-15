const db = require('../../../src/lib/db')

/**
 * client:delete
 *
 * To delete a client, an authenticated user must own this client
 *
 *
 * @param uid
 * @returns {undefined}
 */
async function deleteClient(uid, { id }) {
  const [client] = await db('hydra_client').where('id', id)
  return client.owner === uid
}

module.exports = deleteClient
