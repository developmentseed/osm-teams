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
    const [teamData] = await team.get(id)
    const members = await team.getMembers(id).map(obj => obj.osm_id)

    if (!teamData && !members) {
      return boom.notFound()
    }

    reply.send(Object.assign({}, teamData, { members }))
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
    await team.addMember(id, osmId)
    return reply.send(200)
  } catch (err) {
    console.log(err)
    return boom.badRequest()
  }
}

async function addMembers (req, reply) {
  const { id } = req.params
  const { osmIds } = req.body

  if (!id) {
    return boom.badRequest('team id is required')
  }

  if (!osmIds || osmIds.length < 1) {
    return boom.badRequest('osm ids are required')
  }

  try {
    await team.addMembers(id, osmIds)
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
    await team.removeMember(id, osmId)
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
  addMembers,
  removeMember
}
