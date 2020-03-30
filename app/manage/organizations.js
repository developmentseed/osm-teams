const organization = require('../lib/organization')

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
    const data = await organization.get(id)
    console.log(data)
    reply.send(data)
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

module.exports = {
  createOrg,
  getOrg,
  updateOrg,
  destroyOrg
}
