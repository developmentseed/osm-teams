const db = require('../lib/db')
const team = require('./team')
const { map, prop, includes, has, isNil } = require('ramda')
const { unpack, PropertyRequiredError } = require('../../app/lib/utils')
const { serverRuntimeConfig } = require('../../next.config')
const { DEFAULT_PAGE_SIZE } = serverRuntimeConfig

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
  return unpack(db('organization').select(orgAttributes).where('id', id))
}

/**
 * List organization of a user
 *
 * @param {integer} osmId
 */
async function listMyOrganizations(osmId) {
  const memberOrgs = await db('organization')
    .select(db.raw('distinct(organization.id), organization.name'))
    .join(
      'organization_team',
      'organization_team.organization_id',
      'organization.id'
    )
    .join('member', 'organization_team.team_id', 'member.team_id')
    .where('osm_id', osmId)

  const managerOrgs = await db('organization_manager')
    .join('organization', 'organization_id', 'organization.id')
    .select()
    .where('osm_id', osmId)
  const ownerOrgs = await db('organization_owner')
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
  return db('organization_owner').where('organization_id', id)
}

/**
 * Get an organization's managers
 * @param {int} id - organization id
 * @return {promise}
 */
async function getManagers(id) {
  return db('organization_manager').where('organization_id', id)
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

  // Cache username
  await team.resolveMemberNames([osmId])

  return db.transaction(async (trx) => {
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
  return db('organization').where('id', id).del()
}

/**
 * Update an organization
 *
 * @param {int} id - organization id
 * @param {object} data - params for an organization
 * @return {promise}
 */
async function update(id, data) {
  if (has('name', data) && isNil(prop('name', data))) {
    throw new Error('data.name property is required')
  }
  return unpack(
    db('organization').where('id', id).update(data).returning(orgAttributes)
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
  const isAlreadyOwner = await isOwner(id, osmId)

  // Only ids that are not already in owner list should be added. Duplicate requests should fail silently
  if (!isAlreadyOwner) {
    return unpack(
      db('organization_owner').insert({ organization_id: id, osm_id: osmId })
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
  const owners = map(prop('osm_id'), await getOwners(id))

  if (owners.length === 1) {
    throw new Error(
      'cannot remove owner because there must be at least one owner'
    )
  }

  // Only ids that are already in owner list can be removed. Requests for nonexistant ids should fail silently
  if (includes(osmId, owners)) {
    return unpack(
      db('organization_owner')
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
  // Cache username
  await team.resolveMemberNames([osmId])

  const isAlreadyManager = await isManager(id, osmId)

  // Only ids that are not already in manager list should be added. Duplicate requests should fail silently
  if (!isAlreadyManager) {
    return unpack(
      db('organization_manager').insert({
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
  const managers = map(prop('osm_id'), await getManagers(id))

  // Only ids that are already in manager list can be removed. Requests for nonexistant ids should fail silently
  if (includes(osmId, managers)) {
    return unpack(
      db('organization_manager')
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
  return db.transaction(async (trx) => {
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

  const subquery = db('organization_team')
    .select('team_id')
    .where('organization_id', organizationId)
  let query = db('member')
    .select(db.raw('array_agg(team_id) as teams, osm_id'))
    .where('team_id', 'in', subquery)
    .groupBy('osm_id')

  if (page) {
    query = query.limit(50).offset(page * 20)
  }
  return query
}

/**
 * Get all members and associated teams of an organization
 * We get all members of all associated teams with this organization
 * @param {int} organizationId - organization id
 * @param {object} options - pagination params
 *
 */
async function getMembersPaginated(organizationId, options) {
  const currentPage = options?.page || 1
  const sort = options?.sort || 'name'
  const order = options?.order || 'asc'
  const perPage = options?.perPage || DEFAULT_PAGE_SIZE

  // Sub-query for all org teams
  const allOrgTeamsQuery = db('organization_team')
    .select('team_id')
    .where('organization_id', organizationId)

  // Base query for org members
  let query = db('member')
    .join('osm_users', 'member.osm_id', 'osm_users.id')
    .select('member.osm_id as id', 'osm_users.name')
    .where('member.team_id', 'in', allOrgTeamsQuery)
    .groupBy('member.osm_id', 'osm_users.name')

  // Apply search
  if (options.search) {
    query = query.whereILike('osm_users.name', `%${options.search}%`)
  }

  // Apply sort
  query = query.orderBy(sort, order)

  // Add pagination
  query = query.paginate({
    isLengthAware: true,
    currentPage,
    perPage,
  })

  // Execute query
  const membersPage = await query

  // Query badges assigned to the users in the list
  const userBadges = await db('user_badges')
    .select(
      'user_badges.user_id',
      'user_badges.badge_id',
      'organization_badge.name'
    )
    .join('organization_badge', 'user_badges.badge_id', 'organization_badge.id')
    .whereIn(
      'user_badges.user_id',
      membersPage.data.map((u) => u.id)
    )
    .whereRaw(
      `user_badges.valid_until IS NULL OR user_badges.valid_until > NOW()`
    )

  return {
    ...membersPage,
    data: membersPage.data.map((m) => ({
      ...m,
      badges: userBadges.filter((b) => b.user_id === m.id),
    })),
  }
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
  const subquery = db('organization_team')
    .select('team_id')
    .where('organization_id', organizationId)
  const memberQuery = db('member')
    .select('osm_id')
    .where('team_id', 'in', subquery)
    .andWhere('osm_id', osmId)
  const ownerQuery = db('organization_owner')
    .select('osm_id')
    .where({ organization_id: organizationId, osm_id: osmId })
  const managerQuery = db('organization_manager')
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
async function isOrgTeamModerator(organizationId, osmId) {
  if (!organizationId) throw new PropertyRequiredError('organization id')
  if (!osmId) throw new PropertyRequiredError('osm id')
  const subquery = db('organization_team')
    .select('team_id')
    .where('organization_id', organizationId)
  const isModeratorOfAny = await db('moderator')
    .whereIn('team_id', subquery)
    .debug()
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
  const result = await db('organization_owner').where({
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
  const result = await db('organization_manager').where({
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
  let ownerQuery = db('organization_owner')
    .select(
      db.raw("organization_id, osm_id, 'owner' as type, organization.name")
    )
    .join(
      'organization',
      'organization.id',
      'organization_owner.organization_id'
    )

  let managerQuery = db('organization_manager')
    .select(
      db.raw("organization_id, osm_id, 'manager' as type, organization.name")
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
 * Get organization staff
 * @param {Object} options - parameters
 * @param {Object} options.organizationId - filter by organization
 * @param {Object} options.osmId - filter by osm id
 */
async function getOrgStaffPaginated(organizationId, options = {}) {
  const currentPage = options?.page || 1
  const sort = options?.sort || 'name'
  const order = options?.order || 'asc'
  const perPage = options?.perPage || DEFAULT_PAGE_SIZE

  // Get owners
  let ownerQuery = db('organization_owner')
    .join('osm_users', 'organization_owner.osm_id', 'osm_users.id')
    .select(
      'organization_owner.organization_id',
      'organization_owner.osm_id as id',
      db.raw("'owner' as type"),
      'osm_users.name'
    )
    .where('organization_owner.organization_id', organizationId)

  // Apply search to owners sub-query
  if (options.search) {
    ownerQuery = ownerQuery.whereILike('osm_users.name', `%${options.search}%`)
  }

  // Get managers that are not owners
  let managerQuery = db('organization_manager')
    .join('osm_users', 'organization_manager.osm_id', 'osm_users.id')
    .select(
      'organization_manager.organization_id',
      'organization_manager.osm_id as id',
      db.raw("'manager' as type"),
      'osm_users.name'
    )
    .where('organization_manager.organization_id', organizationId)
    .whereNotIn(
      'organization_manager.osm_id',
      db('organization_owner')
        .select('organization_owner.osm_id')
        .where('organization_id', organizationId)
    )

  // Apply search managers sub-query
  if (options.search) {
    managerQuery = managerQuery.whereILike(
      'osm_users.name',
      `%${options.search}%`
    )
  }

  // Unite owner and manager queries
  let staffQuery = ownerQuery.unionAll(managerQuery)

  // Apply sort
  staffQuery = staffQuery.orderBy(sort, order)

  // Execute staff query with pagination
  return await staffQuery.paginate({
    isLengthAware: true,
    currentPage,
    perPage,
  })
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
  const { privacy } = await unpack(db('organization').where({ id: orgId }))
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
  getMembersPaginated,
  isMemberOrStaff,
  isOwner,
  isManager,
  isMember,
  isOrgTeamModerator,
  createOrgTeam,
  listMyOrganizations,
  getOrgStaff,
  getOrgStaffPaginated,
  isPublic,
}
