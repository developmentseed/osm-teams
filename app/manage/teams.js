const team = require('../lib/team')
const db = require('../../src/lib/db')
const yup = require('yup')
const crypto = require('crypto')
const { routeWrapper } = require('./utils')
const { prop, map, dissoc } = require('ramda')
const urlRegex = require('url-regex')
const { teamsMembersModeratorsHelper } = require('./utils')
const profile = require('../lib/profile')

const isUrl = urlRegex({ exact: true })
const getOsmId = prop('osm_id')

async function listTeams(req, reply) {
  const { osmId, bbox } = req.query
  let bounds = bbox
  if (bbox) {
    bounds = bbox.split(',').map((num) => parseFloat(num))
    if (bounds.length !== 4) {
      reply.boom.badRequest('error in bbox param')
    }
  }

  try {
    const data = await team.list({ osmId, bbox: bounds })
    const enhancedData = await teamsMembersModeratorsHelper(data)
    reply.send(enhancedData)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function listMyTeams(req, reply) {
  const { user_id: osmId } = reply.locals
  try {
    const memberOfTeams = await team.list({ osmId })
    const moderatorOfTeams = await team.listModeratedBy(osmId)
    const result = {
      osmId,
      member: memberOfTeams,
      moderator: moderatorOfTeams,
    }
    reply.send(result)
  } catch (err) {
    return reply.boom.badRequest(err.message)
  }
}

async function getTeam(req, reply) {
  const { id } = req.params

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  try {
    const teamData = await team.get(id)
    const associatedOrg = await team.associatedOrg(id)

    if (!teamData) {
      return reply.boom.notFound()
    }

    return reply.send(Object.assign({}, teamData, { org: associatedOrg }))
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function getTeamMembers(req, reply) {
  const { id } = req.params

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  try {
    const memberIds = map(getOsmId, await team.getMembers(id))
    const members = await team.resolveMemberNames(memberIds)
    const moderators = await team.getModerators(id)

    return reply.send(
      Object.assign({}, { teamId: id }, { members, moderators })
    )
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function createTeam(req, reply) {
  const { body } = req
  const { user_id } = req.session
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

async function updateTeam(req, reply) {
  const { id } = req.params
  const { body } = req

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  if (body.editing_policy && !isUrl.test(body.editing_policy)) {
    return reply.boom.badRequest('editing_policy must be a valid url')
  }

  try {
    const tags = prop('tags', body)
    if (tags) {
      await profile.setProfile(tags, 'team', id)
    }
    const teamData = dissoc('tags', body)
    const data = await team.update(id, teamData)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function assignModerator(req, reply) {
  const { id: teamId, osmId } = req.params

  if (!teamId) {
    return reply.boom.badRequest('team id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest(
      'osm id of member to promote to moderator is required'
    )
  }

  try {
    const data = await team.assignModerator(teamId, osmId)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function removeModerator(req, reply) {
  const { id: teamId, osmId } = req.params

  if (!teamId) {
    return reply.boom.badRequest('team id is required')
  }

  if (!osmId) {
    return reply.boom.badRequest(
      'osm id of member to demote from moderator is required'
    )
  }

  try {
    const data = await team.removeModerator(teamId, osmId)
    reply.send(data)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function destroyTeam(req, reply) {
  const { id } = req.params

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  try {
    await team.destroy(id)
    reply.sendStatus(200)
  } catch (err) {
    console.log(err)
    return reply.boom.badRequest(err.message)
  }
}

async function addMember(req, reply) {
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
    return reply.boom.badRequest(err.message)
  }
}

async function updateMembers(req, reply) {
  const { id } = req.params
  const { add, remove } = req.body

  if (!id) {
    return reply.boom.badRequest('team id is required')
  }

  if (!add && !remove) {
    return reply.boom.badRequest('osm ids are required')
  }

  try {
    let members = []
    if (add) {
      members = members.concat(add)
    }
    if (remove) {
      members = members.concat(remove)
    }
    // Check if these are OSM users
    await team.resolveMemberNames(members)

    await team.updateMembers(id, add, remove)
    return reply.sendStatus(200)
  } catch (err) {
    console.error(err)
    return reply.boom.badRequest(err.message)
  }
}

async function removeMember(req, reply) {
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
    return reply.boom.badRequest(err.message)
  }
}

const getJoinInvitations = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      const invitations = await conn('invitations')
        .select()
        .where('team_id', req.params.id)
        .orderBy('created_at', 'desc') // Most recent first

      reply.send(invitations)
    } catch (e) {
      console.error(e)
      reply.boom.badRequest(e.message)
    }
  },
})

const createJoinInvitation = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      const uuid = crypto.randomUUID()
      const [invitation] = await conn('invitations')
        .insert({
          id: uuid,
          team_id: req.params.id,
        })
        .returning('*')
      reply.send(invitation)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

const deleteJoinInvitation = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
        uuid: yup.string().uuid().required(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      await conn('invitations')
        .where({
          team_id: req.params.id,
          id: req.params.uuid,
        })
        .del()
      reply.sendStatus(200)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

const acceptJoinInvitation = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
        uuid: yup.string().uuid().required(),
      })
      .required(),
  },
  handler: async (req, reply) => {
    const user = reply.locals.user_id
    try {
      const conn = await db()
      const [invitation] = await conn('invitations').where({
        team_id: req.params.id,
        id: req.params.uuid,
      })

      // If this invitation doesn't exist, then it's not valid
      if (!invitation) {
        return reply.sendStatus(404)
      } else {
        team.addMember(req.params.id, user)
        return reply.sendStatus(200)
      }
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

async function joinTeam(req, reply) {
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
    return reply.boom.badRequest(err.message)
  }
}

module.exports = {
  addMember,
  assignModerator,
  createTeam,
  destroyTeam,
  getTeam,
  getTeamMembers,
  joinTeam,
  listTeams,
  listMyTeams,
  removeMember,
  removeModerator,
  updateMembers,
  updateTeam,
  getJoinInvitations,
  createJoinInvitation,
  deleteJoinInvitation,
  acceptJoinInvitation,
}
