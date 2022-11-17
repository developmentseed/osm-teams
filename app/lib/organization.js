const db = require('../../src/lib/db')
const team = require('./team')
const { map, prop, includes, has, isNil } = require('ramda')
const { unpack, PropertyRequiredError } = require('./utils')

// Organization attributes (without profile)
const orgAttributes = [
  'id',
  'name',
  'description',
  'privacy',
  'teams_can_be_public',
  'privacy_policy',
  'created_at',
  'updated_at',
]

/**
 * Get an organization
 *
 * @param {int} id - organization id
 * @return {promise}
 */
async function get(id) {
  const conn = await db()
  return unpack(conn('organization').select(orgAttributes).where('id', id))
}

/**
 * List organization of a user
 *
 * @param {integer} osmId
 */
async function listMyOrganizations(osmId) {
  const conn = await db()
  const memberOrgs = await conn('organization')
    .select(conn.raw('distinct(organization.id), organization.name'))
    .join(
      'organization_team',
      'organization_team.organization_id',
      'organization.id'
    )
    .join('member', 'organization_team.id', 'member.team_id')
    .where('osm_id', osmId)

  const managerOrgs = await conn('organization_manager')
    .join('organization', 'organization_id', 'organization.id')
    .select()
    .where('osm_id', osmId)
  const ownerOrgs = await conn('organization_owner')
    .join('organization', 'organization_id', 'organization.id')
    .select()
    .where('osm_id', osmId)

  return {
    memberOrgs,
    managerOrgs,
    ownerOrgs,
  }
}

/**
 * Get an organization's owners
 * @param {int} id - organization id
 * @return {promise}
 */
async function getOwners(id) {
  const conn = await db()
  return conn('organization_owner').where('organization_id', id)
}

/**
 * Get an organization's managers
 * @param {int} id - organization id
 * @return {promise}
 */
async function getManagers(id) {
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
async function create(data, osmId) {
  if (!osmId) throw new Error('owner osm id is required as second argument')

  if (!data.name) throw new Error('data.name property is required')
  const conn = await db()

  return conn.transaction(async (trx) => {
    const [row] = await trx('organization')
      .insert(data)
      .returning(orgAttributes)
    await trx('organization_owner').insert({
      organization_id: row.id,
      osm_id: osmId,
    })
    await trx('organization_manager').insert({
      organization_id: row.id,
      osm_id: osmId,
    })
    return row
  })
}

/**
 * Destroy an organization
 *
 * @param {int} id - organization id
 * @return {promise}
 */
async function destroy(id) {
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
async function update(id, data) {
  const conn = await db()
  if (has('name', data) && isNil(prop('name', data))) {
    throw new Error('data.name property is required')
  }
  return unpack(
    conn('organization').where('id', id).update(data).returning(orgAttributes)
  )
}

/**
 * Add organization owner
 *
 * @param {int} id - organization id
 * @param {int} osmId - osm id of the owner
 * @return {promise}
 */
async function addOwner(id, osmId) {
  const conn = await db()
  const isAlreadyOwner = await isOwner(id, osmId)

  // Only ids that are not already in owner list should be added. Duplicate requests should fail silently
  if (!isAlreadyOwner) {
    return unpack(
      conn('organization_owner').insert({ organization_id: id, osm_id: osmId })
    )
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
async function removeOwner(id, osmId) {
  const conn = await db()
  const owners = map(prop('osm_id'), await getOwners(id))

  if (owners.length === 1) {
    throw new Error(
      'cannot remove owner because there must be at least one owner'
    )
  }

  // Only ids that are already in owner list can be removed. Requests for nonexistant ids should fail silently
  if (includes(osmId, owners)) {
    return unpack(
      conn('organization_owner')
        .where({ organization_id: id, osm_id: osmId })
        .del()
    )
  }
}

/**
 * Add organization manager
 *
 * @param {int} id - organization id
 * @param {int} osmId - osm id of the manager
 * @return {promise}
 */
async function addManager(id, osmId) {
  const conn = await db()
  const isAlreadyManager = await isManager(id, osmId)

  // Only ids that are not already in manager list should be added. Duplicate requests should fail silently
  if (!isAlreadyManager) {
    return unpack(
      conn('organization_manager').insert({
        organization_id: id,
        osm_id: osmId,
      })
    )
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
async function removeManager(id, osmId) {
  const conn = await db()
  const managers = map(prop('osm_id'), await getManagers(id))

  // Only ids that are already in manager list can be removed. Requests for nonexistant ids should fail silently
  if (includes(osmId, managers)) {
    return unpack(
      conn('organization_manager')
        .where({ organization_id: id, osm_id: osmId })
        .del()
    )
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
async function createOrgTeam(organizationId, data, osmId) {
  const conn = await db()

  return conn.transaction(async (trx) => {
    const record = await team.create(data, osmId, trx)
    await trx('organization_team').insert({
      team_id: record.id,
      organization_id: organizationId,
    })
    return record
  })
}

/**
 * Get all members and associated teams of an organization
 * We get all members of all associated teams with this organization
 * @param {int} organizationId - organization id
 */
async function getMembers(organizationId, page) {
  if (!organizationId) throw new PropertyRequiredError('organization id')

  const conn = await db()

  const subquery = conn('organization_team')
    .select('team_id')
    .where('organization_id', organizationId)
  let query = conn('member')
    .select(conn.raw('array_agg(team_id) as teams, osm_id'))
    .where('team_id', 'in', subquery)
    .groupBy('osm_id')

  if (page) {
    query = query.limit(50).offset(page * 20)
  }
  return query
}

/**
 * Checks if an osmId is part of an organization members
 * @param {int} organizationId - organization id
 * @param {int} osmId - id of member we are testing
 */
async function isMember(organizationId, osmId) {
  if (!osmId) throw new PropertyRequiredError('osm id')
  const members = await getMembers(organizationId)
  const memberIds = members.map(prop('osm_id'))
  return includes(Number(osmId), map(Number, memberIds))
}

/**
 * Checks if an osmId is part of an organization members or staff
 * @param {int} organizationId - organization id
 * @param {int} osmId - id of member we are testing
 */
async function isMemberOrStaff(organizationId, osmId) {
  if (!organizationId) throw new PropertyRequiredError('organization id')
  if (!osmId) throw new PropertyRequiredError('osm id')
  const conn = await db()
  const subquery = conn('organization_team')
    .select('team_id')
    .where('organization_id', organizationId)
  const memberQuery = conn('member')
    .select('osm_id')
    .where('team_id', 'in', subquery)
    .andWhere('osm_id', osmId)
  const ownerQuery = conn('organization_owner')
    .select('osm_id')
    .where({ organization_id: organizationId, osm_id: osmId })
  const managerQuery = conn('organization_manager')
    .select('osm_id')
    .where({ organization_id: organizationId, osm_id: osmId })
  const result = await memberQuery.union(ownerQuery).union(managerQuery)
  return result.length > 0
}

/**
 * Checks if an osmId is a moderator of any team inside the org
 * @param {int} organizationId - organization id
 * @param {int} osmId - id of member we are testing
 */
async function isOrgTeamModerator (organizationId, osmId) {
  if (!organizationId) throw new PropertyRequiredError('organization id')
  if (!osmId) throw new PropertyRequiredError('osm id')
  const conn = await db()
  const subquery = conn('organization_team').select('team_id').where('organization_id', organizationId)
  const isModeratorOfAny = await conn('moderator').whereIn('team_id', subquery).debug()
  return isModeratorOfAny.length > 0
}

/**
 * Checks if the osm user is an owner of a team
 * @param {int} organizationId - organization id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isOwner(organizationId, osmId) {
  if (!organizationId) throw new PropertyRequiredError('organization id')
  if (!osmId) throw new PropertyRequiredError('osm id')
  const conn = await db()
  const result = await conn('organization_owner').where({
    organization_id: organizationId,
    osm_id: osmId,
  })
  return result.length > 0
}

/**
 * Checks if the osm user is a manager of a team
 * @param {int} organizationId - organization id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isManager(organizationId, osmId) {
  if (!organizationId) throw new PropertyRequiredError('organization id')
  if (!osmId) throw new PropertyRequiredError('osm id')
  const conn = await db()
  const result = await conn('organization_manager').where({
    organization_id: organizationId,
    osm_id: osmId,
  })
  return result.length > 0
}

/**
 * getOrgStaff
 * @param {Object} options - parameters
 * @param {Object} options.organizationId - filter by organization
 * @param {Object} options.osmId - filter by osm id
 */
async function getOrgStaff(options) {
  const conn = await db()
  let ownerQuery = conn('organization_owner')
    .select(
      conn.raw("organization_id, osm_id, 'owner' as type, organization.name")
    )
    .join(
      'organization',
      'organization.id',
      'organization_owner.organization_id'
    )

  let managerQuery = conn('organization_manager')
    .select(
      conn.raw("organization_id, osm_id, 'manager' as type, organization.name")
    )
    .join(
      'organization',
      'organization.id',
      'organization_manager.organization_id'
    )

  if (options.organizationId) {
    ownerQuery = ownerQuery.where('organization.id', options.organizationId)
    managerQuery = managerQuery.where('organization.id', options.organizationId)
  }
  if (options.osmId) {
    ownerQuery = ownerQuery.where('organization_owner.osm_id', options.osmId)
    managerQuery = managerQuery.where(
      'organization_manager.osm_id',
      options.osmId
    )
  }
  return ownerQuery.unionAll(managerQuery)
}

/**
 * isPublic
 * Checks if org privacy is public
 *
 * @param orgId - ord id
 * @returns {Boolean} is the org public?
 */
async function isPublic(orgId) {
  if (!orgId) throw new PropertyRequiredError('organization id')
  const conn = await db()
  const { privacy } = await unpack(conn('organization').where({ id: orgId }))
  return privacy === 'public'
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
  isMemberOrStaff,
  isOwner,
  isManager,
  isMember,
  isOrgTeamModerator,
  createOrgTeam,
  listMyOrganizations,
  getOrgStaff,
  isPublic,
}
