const db = require('../../db')

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
  let conn = await db()
  const [client] = await conn('hydra_client').where('id', id)
  return client.owner === uid
}

module.exports = deleteClient
