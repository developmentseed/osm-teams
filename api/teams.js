const boom = require('boom')
const team = require('../lib/team')

async function list (req, reply) {
  reply.send({ teams: [] })
}

async function get (req, reply) {
  const { id } = req.params

  if (!id) {
    return boom.badRequest('team id is required')
  }

  const [data] = await team.get(id)

  if (!data) {
    return boom.notFound()
  }

  reply.send(data)
}

async function create (req, reply) {
  const { body } = req

  try {
    const [data] = await team.create(body)
    reply.send(data)
  } catch (err) {
    return boom.badRequest()
  }
}

async function update (req, reply) {
  const { id } = req.params
  const { body } = req

  if (!id) {
    return boom.badRequest('team id is required')
  }

  try {
    const [data] = await team.update(id, body)
    reply.send(data)
  } catch (err) {
    return boom.badRequest()
  }
}

async function destroy (req, reply) {
  const { id } = req.params

  if (!id) {
    return boom.badRequest('team id is required')
  }

  try {
    await team.destroy(id)
    reply.send(200)
  } catch (err) {
    return boom.badRequest()
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  destroy
}
