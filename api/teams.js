const boom = require('boom')
const team = require('../lib/team')

async function list (req, reply) {
  const { osmId } = req.query

  try {
    let data
    if (osmId) {
      data = await team.findByOsmId(osmId)
    } else {
      data = await team.list()
    }
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
  const { body, session: { user } } = req

  try {
    const [data] = await team.create(body)
    // user that creates a team should be both member and moderator
    // TODO: consider adding a createTeamAndModerator method or something like that
    await team.addMember(data.id, user.id)
    await team.addModerator(data.id, user.id)
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

async function updateMembers (req, reply) {
  const { id } = req.params
  const { add, remove } = req.body

  if (!id) {
    return boom.badRequest('team id is required')
  }

  if (!add && !remove) {
    return boom.badRequest('osm ids are required')
  }

  try {
    await team.updateMembers(id, add, remove)
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
  updateMembers,
  removeMember
}
