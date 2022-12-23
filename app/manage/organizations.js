const organization = require('../../src/models/organization')
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

  let [data, isMember, isManager, isOwner] = await Promise.all([
    organization.get(id),
    organization.isMember(id, user_id),
    organization.isManager(id, user_id),
    organization.isOwner(id, user_id),
  ])

  // User needs to be member or staff to access a private org
  if (data?.privacy === 'private' && !isMember && !isManager && !isOwner) {
    throw Boom.unauthorized()
  } else {
    reply.send({ ...data, isMember, isManager, isOwner })
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
    return reply.status(200).send()
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
    return reply.status(200).send()
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
    return reply.status(200).send()
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

  await organization.addManager(id, Number(osmId))
  return reply.status(200).send()
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
    return reply.status(200).send()
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
  listMyOrgs,
}
