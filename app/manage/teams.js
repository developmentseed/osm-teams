const team = require('../lib/team')
const { prop, map } = require('ramda')

async function listTeams (req, reply) {
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
    return reply.boom.badRequest()
  }
}

async function getTeam (req, reply) {
  const { id } = req.params

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  try {
    const teamData = await team.get(id)
    const memberIds = map(prop('osm_id'), (await team.getMembers(id)))
    const members = await team.resolveMemberNames(memberIds)
    const moderators = await team.getModerators(id)

    if (!teamData && !members) {
      return reply.boom.notFound()
    }

    return reply.send(Object.assign({}, teamData, { members, moderators }))
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest()
  }
}

async function createTeam (req, reply) {
  const { body } = req
  const { user_id } = reply.locals

  try {
    const data = await team.create(body, user_id)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function updateTeam (req, reply) {
  const { id } = req.params
  const { body } = req

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  try {
    const data = await team.update(id, body)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest()
  }
}

async function destroyTeam (req, reply) {
  const { id } = req.params

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  try {
    await team.destroy(id)
    reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest()
  }
}

async function addMember (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osm id is required')
  }

  try {
    await team.addMember(id, osmId)
    return reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest()
  }
}

async function updateMembers (req, reply) {
  const { id } = req.params
  const { add, remove } = req.body

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  if (!add && !remove) {
    return reply.boom.badRequest('osm ids are required')
  }

  try {
    await team.updateMembers(id, add, remove)
    return reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest()
  }
}

async function removeMember (req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osm id is required')
  }

  try {
    await team.removeMember(id, osmId)
    return reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest()
  }
}

module.exports = {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  destroyTeam,
  addMember,
  updateMembers,
  removeMember
}
