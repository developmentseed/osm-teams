const team = require('../lib/team')
const { prop, map } = require('ramda')
const urlRegex = require('url-regex')

const isUrl = urlRegex({ exact: true })

async function listTeams (req, reply) {
  const { osmId, bbox } = req.query
  let bounds = bbox
  if (bbox) {
    bounds = bbox.split(',').map(num => parseFloat(num))
    if (bounds.length !== 4) {
      reply.boom.badRequest('error in bbox param')
    }
  }

  try {
    const data = await team.list({ osmId, bbox: bounds })
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

  if (body.editing_policy && !isUrl.test(body.editing_policy)) {
    return reply.boom.badRequest('editing_policy must be a valid url')
  }

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

  if (body.editing_policy && !isUrl.test(body.editing_policy)) {
    return reply.boom.badRequest('editing_policy must be a valid url')
  }

  try {
    const data = await team.update(id, body)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest()
  }
}

async function assignModerator (req, reply) {
  const { id: teamId, osmId } = req.params

  if (!teamId) {
    return reply.boom.badRequest('team id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osm id of member to promote to moderator is required')
  }

  try {
    const data = await team.assignModerator(teamId, osmId)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err)
  }
}

async function removeModerator (req, reply) {
  const { id: teamId, osmId } = req.params

  if (!teamId) {
    return reply.boom.badRequest('team id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest('osm id of member to demote from moderator is required')
  }

  try {
    const data = await team.removeModerator(teamId, osmId)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err)
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

async function joinTeam (req, reply) {
  const { id } = req.params
  const osmId = reply.locals.user_id

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

module.exports = {
  addMember,
  assignModerator,
  createTeam,
  destroyTeam,
  getTeam,
  joinTeam,
  listTeams,
  removeMember,
  removeModerator,
  updateMembers,
  updateTeam
}
