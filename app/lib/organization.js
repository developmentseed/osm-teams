const db = require('../db')
const { unpack } = require('./utils')

/**
 * Get an organization
 *
 * @param {int} id - organization id
 * @return {promise}
 */
async function get (id) {
  const conn = await db()
  return unpack(conn('organization').where('id', id))
}

/**
 * Create an organization
 * Organizations have owners so we give an osm id as the second param
 *
 * @param {object} data - params for an organization
 * @param {string} data.name - name of the organization
 * @return {promise}
 */
async function create (data, osmId) {
  if (!osmId) throw new Error('owner osm id is required as second argument')

  if (!data.name) throw new Error('data.name property is required')
  const conn = await db()

  return conn.transaction(async trx => {
    const [row] = await trx('organization').insert(data).returning('*')
    await trx('organization_owner').insert({ organization_id: row.id, osm_id: osmId })
    await trx('organization_manager').insert({ organization_id: row.id, osm_id: osmId })
    return row
  })
}

/**
 * Destroy an organization
 *
 * @param {int} id - organization id
 * @return {promise}
 */
async function destroy (id) {
  const conn = await db()
  return conn('organization').where('id', id).del()
}

/**
 * Update an organization
 *
 * @param {int} id - organization id
 * @return {promise}
 */
async function update (id, data) {
  if (!data.name) throw new Error('data.name property is required')

  const conn = await db()
  return unpack(conn('organization').where('id', id).update(data).returning('*'))
}

/**
 * Checks if the osm user is an owner of a team
 * @param {int} organizationId - organization id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isOwner (organizationId, osmId) {
  if (!organizationId) throw new Error('organization id is required as first argument')
  if (!osmId) throw new Error('osm id is required as second argument')
  const conn = await db()
  const result = await conn('organization_owner').where({ organization_id: organizationId, osm_id: osmId })
  return result.length > 0
}

/**
 * Checks if the osm user is a manager of a team
 * @param {int} organizationId - organization id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isManager (organizationId, osmId) {
  if (!organizationId) throw new Error('organization id is required as first argument')
  if (!osmId) throw new Error('osm id is required as second argument')
  const conn = await db()
  const result = await conn('organization_manager').where({ organization_id: organizationId, osm_id: osmId })
  return result.length > 0
}

module.exports = {
  get,
  create,
  destroy,
  update,
  isOwner,
  isManager
}
