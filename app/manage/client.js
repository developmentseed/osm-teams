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
  let clients = await hydra.getClients()
  
  // Remove first party app from list
  let filteredClients = clients.filter(c => c.client_id !== manageId)

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
