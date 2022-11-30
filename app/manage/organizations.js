const organization = require('../../src/models/organization')
const team = require('../../src/models/team')
const { teamsMembersModeratorsHelper } = require('./utils')
const { map, prop } = require('ramda')
const Boom = require('@hapi/boom')

/**
 * List organizations that a user is a member of
 */
async function listMyOrgs(req, reply) {
  const { user_id } = req.session
  try {
    const orgs = await organization.listMyOrganizations(user_id)
    reply.send(orgs)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Create an organization
 * Uses the user id in the request and the body to forward
 * to the organization model
 */
async function createOrg(req, reply) {
  const { body } = req
  const { user_id } = req.session

  try {
    const data = await organization.create(body, user_id)
    reply.send(data)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Get an organization's metadata
 * Requires id of organization
 */
async function getOrg(req, reply) {
  const { id } = req.params
  const { user_id } = req.session

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  let [data, isMemberOfOrg] = await Promise.all([
    organization.get(id),
    organization.isMember(id, user_id),
  ])
  reply.send({ ...data, isMemberOfOrg })
}

/**
 * Get an organization's staff
 * Requires id of organization
 */
async function getOrgStaff(req, reply) {
  const { id } = req.params

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  try {
    let [owners, managers] = await Promise.all([
      organization.getOwners(id),
      organization.getManagers(id),
    ])
    const ownerIds = map(prop('osm_id'), owners)
    const managerIds = map(prop('osm_id'), managers)
    if (ownerIds.length > 0) {
      owners = await team.resolveMemberNames(ownerIds)
    }
    if (managerIds.length > 0) {
      managers = await team.resolveMemberNames(managerIds)
    }

    reply.send({ owners, managers })
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

async function getOrgMembers(req, reply) {
  const { id } = req.params

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  let { page } = req.query

  try {
    let members = await organization.getMembers(id, page)
    const memberIds = map(prop('osm_id'), members)
    if (memberIds.length > 0) {
      members = await team.resolveMemberNames(memberIds)
    }

    reply.send({ members, page })
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Update an organization
 * Requires the id of the organization to modify
 */
async function updateOrg(req, reply) {
  const { id } = req.params
  const { body } = req

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  try {
    const data = await organization.update(id, body)
    reply.send(data)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Destroy an organization
 */
async function destroyOrg(req, reply) {
  const { id } = req.params

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  try {
    await organization.destroy(id)
    return reply.status(200)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Add owner
 */
async function addOwner(req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  if (!osmId) {
    throw Boom.badRequest('osmId to add is required')
  }

  try {
    await organization.addOwner(id, Number(osmId))
    return reply.status(200)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Remove owner
 */
async function removeOwner(req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  if (!osmId) {
    throw Boom.badRequest('osmId to add is required')
  }

  try {
    await organization.removeOwner(id, Number(osmId))
    return reply.status(200)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Add manager
 */
async function addManager(req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  if (!osmId) {
    throw Boom.badRequest('osmId to add is required')
  }

  try {
    await organization.addManager(id, Number(osmId))
    return reply.status(200)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Remove manager
 */
async function removeManager(req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    throw Boom.badRequest('organization id is required')
  }

  if (!osmId) {
    throw Boom.badRequest('osmId to add is required')
  }

  try {
    await organization.removeManager(id, Number(osmId))
    return reply.status(200)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * Create org team
 */
async function createOrgTeam(req, reply) {
  const { id } = req.params
  const { body } = req
  const { user_id } = req.session

  try {
    const data = await organization.createOrgTeam(id, body, user_id)
    reply.send(data)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

/**
 * List org teams
 */
async function getOrgTeams(req, reply) {
  const { id } = req.params
  try {
    const data = await team.list({ organizationId: id })
    const enhancedData = await teamsMembersModeratorsHelper(data)
    reply.send(enhancedData)
  } catch (err) {
    console.log(err)
    throw Boom.badRequest(err.message)
  }
}

module.exports = {
  createOrg,
  getOrg,
  updateOrg,
  destroyOrg,
  addOwner,
  removeOwner,
  addManager,
  removeManager,
  createOrgTeam,
  getOrgTeams,
  listMyOrgs,
  getOrgStaff,
  getOrgMembers,
}
