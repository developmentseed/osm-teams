const db = require('../db')
const team = require('./team')
const { map, prop, contains, includes } = require('ramda')
const { unpack, PropertyRequiredError } = require('./utils')

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
 * Get an organization's owners
 * @param {int} id - organization id
 * @return {promise}
 */
async function getOwners (id) {
  const conn = await db()
  return conn('organization_owner').where('organization_id', id)
}

/**
 * Get an organization's managers
 * @param {int} id - organization id
 * @return {promise}
 */
async function getManagers (id) {
  const conn = await db()
  return conn('organization_manager').where('organization_id', id)
}

/**
 * Create an organization
 * Organizations have owners so we give an osm id as the second param
 *
 * @param {object} data - params for an organization
 * @param {string} data.name - name of the organization
 * @param {int} osmId - osm id of the owner
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
 * @param {object} data - params for an organization
 * @return {promise}
 */
async function update (id, data) {
  if (!data.name) throw new Error('data.name property is required')

  const conn = await db()
  return unpack(conn('organization').where('id', id).update(data).returning('*'))
}

/**
 * Add organization owner
 *
 * @param {int} id - organization id
 * @param {int} osmId - osm id of the owner
 * @return {promise}
 */
async function addOwner (id, osmId) {
  const conn = await db()
  const isAlreadyOwner = await isOwner(id, osmId)

  // Only ids that are not already in owner list should be added. Duplicate requests should fail silently
  if (!isAlreadyOwner) {
    return unpack(conn('organization_owner').insert({ organization_id: id, osm_id: osmId }))
  }
}

/**
 * Remove organization owner
 * There has to be at least one owner for an organization
 *
 * @param {int} id - organization id
 * @param {int} osmId - osm id of the owner
 * @return {promise}
 */
async function removeOwner (id, osmId) {
  const conn = await db()
  const owners = map(prop('osm_id'), await getOwners(id))

  if (owners.length === 1) {
    throw new Error('cannot remove owner because there must be at least one owner')
  }

  // Only ids that are already in owner list can be removed. Requests for nonexistant ids should fail silently
  if (contains(osmId, owners)) {
    return unpack(conn('organization_owner').where({ organization_id: id, osm_id: osmId }).del())
  }
}

/**
 * Add organization manager
 *
 * @param {int} id - organization id
 * @param {int} osmId - osm id of the manager
 * @return {promise}
 */
async function addManager (id, osmId) {
  const conn = await db()
  const isAlreadyManager = await isManager(id, osmId)

  // Only ids that are not already in manager list should be added. Duplicate requests should fail silently
  if (!isAlreadyManager) {
    return unpack(conn('organization_manager').insert({ organization_id: id, osm_id: osmId }))
  }
}

/**
 * Remove organization manager
 * There can be 0 managers in an organization
 *
 * @param {int} id - organization id
 * @param {int} osmId - osm id of the manager
 * @return {promise}
 */
async function removeManager (id, osmId) {
  const conn = await db()
  const managers = map(prop('osm_id'), await getManagers(id))

  // Only ids that are already in manager list can be removed. Requests for nonexistant ids should fail silently
  if (contains(osmId, managers)) {
    return unpack(conn('organization_manager').where({ organization_id: id, osm_id: osmId }).del())
  }
}

/**
 * Create organization team
 *
 * An organization team is a team that is assigned to the organization
 * at creation time. Only organization managers can create teams
 *
 * @param {int} organizationId - organization id
 * @param {object} data - params for team (see team.create function)
 * @param {int} osmId - id of the organization manager
 * @return {promise}
 */
async function createOrgTeam (organizationId, data, osmId) {
  const conn = await db()

  return conn.transaction(async trx => {
    const record = await team.create(data, osmId, trx)
    await trx('organization_team').insert({ team_id: record.id, organization_id: organizationId })
    return record
  })
}

/**
 * Get all members and associated teams of an organization
 * We get all members of all associated teams with this organization
 * @param {int} organizationId - organization id
 */
async function getMembers (organizationId) {
  if (!organizationId) throw new PropertyRequiredError('organization id')

  const conn = await db()

  const subquery = conn('organization_team').select('team_id').where('organization_id', organizationId)
  return conn('member').select(conn.raw('array_agg(team_id) as teams, osm_id')).where('team_id', 'in', subquery).groupBy('osm_id')
}

/**
 * Checks if an osmId is part of an organization
 * @param {int} organizationId - organization id
 * @param {int} osmId - id of member we are testing
 */
async function isMember (organizationId, osmId) {
  if (!osmId) throw new PropertyRequiredError('osm id')
  const members = (await getMembers(organizationId)).map(prop('osm_id'))
  return includes(osmId, members)
}

/**
 * Checks if the osm user is an owner of a team
 * @param {int} organizationId - organization id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isOwner (organizationId, osmId) {
  if (!organizationId) throw new PropertyRequiredError('organization id')
  if (!osmId) throw new PropertyRequiredError('osm id')
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
  if (!organizationId) throw new PropertyRequiredError('organization id')
  if (!osmId) throw new PropertyRequiredError('osm id')
  const conn = await db()
  const result = await conn('organization_manager').where({ organization_id: organizationId, osm_id: osmId })
  return result.length > 0
}

module.exports = {
  get,
  create,
  destroy,
  update,
  addOwner,
  removeOwner,
  addManager,
  removeManager,
  getOwners,
  getManagers,
  getMembers,
  isOwner,
  isManager,
  isMember,
  createOrgTeam
}
