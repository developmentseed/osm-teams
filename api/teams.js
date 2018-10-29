const boom = require('boom')
const team = require('../lib/team')

async function list (req, reply) {
  try {
    const data = await team.list()
    reply.send(data)
  } catch (err) {
    console.log(err)
    return boom.badRequest()
  }
}

async function get (req, reply) {
  const { id } = req.params

  if (!id) {
    return boom.badRequest('team id is required')
  }

  try {
    const [data] = await team.get(id)

    if (!data) {
      return boom.notFound()
    }

    reply.send(data)
  } catch (err) {
    console.log(err)
    return boom.badRequest()
  }
}

async function create (req, reply) {
  const { body } = req

  try {
    const [data] = await team.create(body)
    reply.send(data)
  } catch (err) {
    console.log(err)
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
    console.log(err)
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
    console.log(err)
    return boom.badRequest()
  }
}

async function addMember (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return boom.badRequest('team id is required')
  }

  if (!osmId) {
    return boom.badRequest('osm id is required')
  }

  try {
    team.addMember(id, osmId)
    return reply.send(200)
  } catch (err) {
    console.log(err)
    return boom.badRequest()
  }
}

async function removeMember (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return boom.badRequest('team id is required')
  }

  if (!osmId) {
    return boom.badRequest('osm id is required')
  }

  try {
    team.removeMember(id, osmId)
    return reply.send(200)
  } catch (err) {
    console.log(err)
    return boom.badRequest()
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  destroy,
  addMember,
  removeMember
}
