/**
 * Routes to create / read / delete OAuth clients
 */

const hydra = require('../lib/hydra')
const { serverRuntimeConfig } = require('../../next.config')
const manageId = serverRuntimeConfig.OSM_HYDRA_ID

/**
 * Get OAuth clients from Hydra
 * @param {*} req
 * @param {*} res
 */
async function getClients (req, res) {
  const { session: { user_id } } = req
  let clients = await hydra.getClients()

  // Remove first party client from list & exclude clients the user does not own
  let filteredClients = clients
    .filter(c => c.client_id !== manageId && c.owner === user_id)

  return res.send({ clients: filteredClients })
}

/**
 * Create OAuth client
 *
 * @param {*} req
 * @param {*} res
 */
async function createClient (req, res) {
  let toCreate = Object.assign({}, req.body)
  toCreate['scope'] = 'openid offline'
  toCreate['response_types'] = ['code', 'id_token']
  toCreate['grant_types'] = ['refresh_token', 'authorization_code']
  toCreate['owner'] = req.session.user_id
  let client = await hydra.createClient(toCreate)
  return res.send({ client })
}

/**
 * Delete OAuth client
 * @param {*} req
 * @param {*} res
 */
function deleteClient (req, res) {
  hydra.deleteClient(req.params.id).then(() => res.sendStatus(200))
}

module.exports = {
  getClients,
  createClient,
  deleteClient
}
