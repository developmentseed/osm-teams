const organization = require('../lib/organization')
const team = require('../lib/team')
const { teamsMembersModeratorsHelper } = require('./utils')

/**
 * Create an organization
 * Uses the user id in the request and the body to forward
 * to the organization model
 */
async function createOrg (req, reply) {
  const { body } = req
  const { user_id } = reply.locals

  try {
    const data = await organization.create(body, user_id)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Get an organization
 * Requires id of organization
 */
async function getOrg (req, reply) {
  const { id } = req.params

  if (!id) {
    return reply.boom.badRequest('organization id is required')
  }

  try {
    const [data, owners, managers] = await Promise.all([
      organization.get(id),
      organization.getOwners(id),
      organization.getManagers(id)
    ])

    reply.send({ ...data, owners, managers })
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Update an organization
 * Requires the id of the organization to modify
 */
async function updateOrg (req, reply) {
  const { id } = req.params
  const { body } = req

  if (!id) {
    return reply.boom.badRequest('organization id is required')
  }

  try {
    const data = await organization.update(id, body)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Destroy an organization
 */
async function destroyOrg (req, reply) {
  const { id } = req.params

  if (!id) {
    return reply.boom.badRequest('organization id is required')
  }

  try {
    await organization.destroy(id)
    reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Add owner
 */
async function addOwner (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return reply.boom.badRequest('organization id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osmId to add is required')
  }

  try {
    await organization.addOwner(id, Number(osmId))
    reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Remove owner
 */
async function removeOwner (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return reply.boom.badRequest('organization id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osmId to add is required')
  }

  try {
    await organization.removeOwner(id, Number(osmId))
    reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Add manager
 */
async function addManager (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return reply.boom.badRequest('organization id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osmId to add is required')
  }

  try {
    await organization.addManager(id, Number(osmId))
    reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Remove manager
 */
async function removeManager (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return reply.boom.badRequest('organization id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osmId to add is required')
  }

  try {
    await organization.removeManager(id, Number(osmId))
    reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * Create org team
 */
async function createOrgTeam (req, reply) {
  const { id } = req.params
  const { body } = req
  const { user_id } = reply.locals

  try {
    const data = await organization.createOrgTeam(id, body, user_id)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

/**
 * List org teams
 */
async function getOrgTeams (req, reply) {
  const { id } = req.params
  try {
    const data = await team.list({ organizationId: id })
    const enhancedData = await teamsMembersModeratorsHelper(data)
    reply.send(enhancedData)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
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
  getOrgTeams
}
