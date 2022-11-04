const db = require('../db')
const yup = require('yup')
const organization = require('../lib/organization')
const profile = require('../lib/profile')
const { routeWrapper } = require('./utils')
const team = require('../lib/team')

/**
 * Get the list of badges of an organization
 */
const listBadges = routeWrapper({
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
      const badges = await conn('organization_badge')
        .select('*')
        .where('organization_id', req.params.id)
        .orderBy('id')
      reply.send(badges)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

/**
 * Create organization badge
 */
const createBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
      })
      .required(),
    body: yup
      .object({
        name: yup.string().required(),
        color: yup.string().required(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      const [badge] = await conn('organization_badge')
        .insert({
          organization_id: req.params.id,
          ...req.body,
        })
        .returning('*')
      reply.send(badge)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

/**
 * Get organization badge
 */
const getBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
        badgeId: yup.number().required().positive().integer(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      const [badge] = await conn('organization_badge')
        .select('*')
        .where('id', req.params.badgeId)
        .returning('*')

      let users = await conn('user_badges')
        .select({
          id: 'user_badges.user_id',
          assignedAt: 'user_badges.assigned_at',
          validUntil: 'user_badges.valid_until',
        })
        .leftJoin(
          'organization_badge',
          'user_badges.badge_id',
          'organization_badge.id'
        )
        .where('badge_id', req.params.badgeId)
        .returning('*')

      if (users.length > 0) {
        // Get user profiles
        const userProfiles = (
          await team.resolveMemberNames(users.map((u) => u.id))
        ).reduce((acc, u) => {
          acc[u.id] = u
          return acc
        }, {})

        users = users.map((u) => ({
          id: u.id,
          assignedAt: u.assignedAt,
          validUntil: u.validUntil,
          displayName: userProfiles[u.id] ? userProfiles[u.id].name : '',
        }))
      }

      reply.send({
        ...badge,
        users,
      })
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

/**
 * Edit organization badge
 */
const patchBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
        badgeId: yup.number().required().positive().integer(),
      })
      .required(),
    body: yup
      .object({
        name: yup.string().optional(),
        color: yup.string().optional(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      const [badge] = await conn('organization_badge')
        .update(req.body)
        .where('id', req.params.badgeId)
        .returning('*')
      reply.send(badge)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

/**
 * Delete organization badge
 */
const deleteBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        badgeId: yup.number().required().positive().integer(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      await conn('organization_badge').delete().where('id', req.params.badgeId)
      return reply.send({
        status: 200,
        message: `Badge ${req.params.badgeId} deleted successfully.`,
      })
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

/**
 * Assign organization badge to an user
 */
const assignUserBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
        badgeId: yup.number().required().positive().integer(),
        userId: yup.number().required().positive().integer(),
      })
      .required(),
    body: yup.object({
      assigned_at: yup.date().required(),
      valid_until: yup.date().nullable(),
    }),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()

      // user is related to org?
      const isMemberOrStaff = await organization.isMemberOrStaff(
        req.params.id,
        req.params.userId
      )

      if (!isMemberOrStaff) {
        return reply.boom.badRequest('User is not part of the organization.')
      }

      // assign badge
      const { assigned_at, valid_until } = req.body
      const [badge] = await conn('user_badges')
        .insert({
          user_id: req.params.userId,
          badge_id: req.params.badgeId,
          assigned_at: assigned_at.toISOString(),
          valid_until: valid_until ? valid_until.toISOString() : null,
        })
        .returning('*')

      reply.send(badge)
    } catch (err) {
      console.log(err)
      if (err.code === '23505') {
        return reply.boom.badRequest('User is already assigned to badge.')
      } else {
        return reply.boom.badRequest(
          'Unexpected error, please try again later.'
        )
      }
    }
  },
})

/**
 * List badges of an user
 */
const listUserBadges = routeWrapper({
  validate: {
    params: yup
      .object({
        userId: yup.number().required().positive().integer(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const badges = await profile.getUserBadges(req.params.userId)
      reply.send({ badges })
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

/**
 * Update a badge assigned to an user
 */
const updateUserBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        badgeId: yup.number().required().positive().integer(),
        userId: yup.number().required().positive().integer(),
      })
      .required(),
    body: yup.object({
      assigned_at: yup.date().required(),
      valid_until: yup.date().nullable(),
    }),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()

      const { assigned_at, valid_until } = req.body

      // Yup validation returns time-zoned dates, update query use UTC strings
      // to avoid that.
      const [badge] = await conn('user_badges')
        .update({
          assigned_at: assigned_at.toISOString(),
          valid_until: valid_until ? valid_until.toISOString() : null,
        })
        .where({
          user_id: req.params.userId,
          badge_id: req.params.badgeId,
        })
        .returning('*')

      reply.send(badge)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

/**
 * Remove badge assign to an user
 */
const removeUserBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        badgeId: yup.number().required().positive().integer(),
        userId: yup.number().required().positive().integer(),
      })
      .required(),
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()

      // delete user badge
      await conn('user_badges').delete().where({
        user_id: req.params.userId,
        badge_id: req.params.badgeId,
      })

      return reply.send({
        status: 200,
        message: `Badge ${req.params.badgeId} unassigned successfully.`,
      })
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  },
})

module.exports = {
  listBadges,
  createBadge,
  getBadge,
  patchBadge,
  deleteBadge,
  assignUserBadge,
  listUserBadges,
  updateUserBadge,
  removeUserBadge,
}
