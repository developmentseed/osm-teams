const team = require('../../src/models/team')
const db = require('../../src/lib/db')
const yup = require('yup')
const crypto = require('crypto')
const { routeWrapper } = require('./utils')
const urlRegex = require('url-regex')
const Boom = require('@hapi/boom')
const logger = require('../../src/lib/logger')
const isUrl = urlRegex({ exact: true })

async function listTeams(req, res) {
  const { osmId, bbox } = req.query
  let bounds = bbox
  if (bbox) {
    bounds = bbox.split(',').map((num) => parseFloat(num))
    if (bounds.length !== 4) {
      throw Boom.badRequest('error in bbox param')
    }
  }

  const data = await team.list({
    osmId,
    bbox: bounds,
  })
  return res.send(data)
}

async function createTeam(req, reply) {
  const { body } = req
  const { user_id } = req.session
  if (body.editing_policy && !isUrl.test(body.editing_policy)) {
    throw Boom.badRequest('editing_policy must be a valid url')
  }

  try {
    const data = await team.create(body, user_id)
    reply.send(data)
  } catch (err) {
    logger.error(err)
    throw Boom.badRequest(err.message)
  }
}

async function assignModerator(req, reply) {
  const { id: teamId, osmId } = req.params

  if (!teamId) {
    throw Boom.badRequest('team id is required')
  }

  if (!osmId) {
    throw Boom.badRequest(
      'osm id of member to promote to moderator is required'
    )
  }

  try {
    const data = await team.assignModerator(teamId, osmId)
    reply.send(data)
  } catch (err) {
    logger.error(err)
    throw Boom.badRequest(err.message)
  }
}

async function removeModerator(req, reply) {
  const { id: teamId, osmId } = req.params

  if (!teamId) {
    throw Boom.badRequest('team id is required')
  }

  if (!osmId) {
    throw Boom.badRequest(
      'osm id of member to demote from moderator is required'
    )
  }

  try {
    const data = await team.removeModerator(teamId, osmId)
    reply.send(data)
  } catch (err) {
    logger.error(err)
    throw Boom.badRequest(err.message)
  }
}

async function addMember(req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    throw Boom.badRequest('team id is required')
  }

  if (!osmId) {
    throw Boom.badRequest('osm id is required')
  }

  try {
    await team.addMember(id, osmId)
    return reply.status(200).send()
  } catch (err) {
    logger.error(err)
    throw Boom.badRequest(err.message)
  }
}

async function removeMember(req, reply) {
  const { id, osmId } = req.params

  if (!id) {
    throw Boom.badRequest('team id is required')
  }

  if (!osmId) {
    throw Boom.badRequest('osm id is required')
  }

  try {
    await team.removeMember(id, osmId)
    return reply.status(200).send()
  } catch (err) {
    logger.error(err)
    throw Boom.badRequest(err.message)
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
      const invitations = await db('invitations')
        .select()
        .where('team_id', req.params.id)
        .orderBy('created_at', 'desc') // Most recent first

      reply.send(invitations)
    } catch (e) {
      logger.error(e)
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
      const uuid = crypto.randomUUID()
      const [invitation] = await db('invitations')
        .insert({
          id: uuid,
          team_id: req.params.id,
        })
        .returning('*')
      reply.send(invitation)
    } catch (err) {
      logger.error(err)
      throw Boom.badRequest(err.message)
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
      await db('invitations')
        .where({
          team_id: req.params.id,
          id: req.params.uuid,
        })
        .del()
      return reply.status(200).send()
    } catch (err) {
      logger.error(err)
      throw Boom.badRequest(err.message)
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
    const user = req.session.user_id
    try {
      const [invitation] = await db('invitations').where({
        team_id: req.params.id,
        id: req.params.uuid,
      })

      // If this invitation doesn't exist, then it's not valid
      if (!invitation) {
        return reply.status(404).send()
      } else {
        team.addMember(req.params.id, user)
        return reply.status(200).send()
      }
    } catch (err) {
      logger.error(err)
      throw Boom.badRequest(err.message)
    }
  },
})

async function joinTeam(req, reply) {
  const { id } = req.params
  const osmId = req.session.user_id

  if (!id) {
    throw Boom.badRequest('team id is required')
  }

  if (!osmId) {
    throw Boom.badRequest('osm id is required')
  }

  try {
    await team.addMember(id, osmId)
    return reply.status(200).send()
  } catch (err) {
    logger.error(err)
    throw Boom.badRequest(err.message)
  }
}

module.exports = {
  addMember,
  assignModerator,
  createTeam,
  joinTeam,
  listTeams,
  removeMember,
  removeModerator,
  getJoinInvitations,
  createJoinInvitation,
  deleteJoinInvitation,
  acceptJoinInvitation,
}
