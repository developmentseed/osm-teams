const db = require('../db')
const yup = require('yup')
const organization = require('../lib/organization')
const profile = require('../lib/profile')
const { routeWrapper } = require('./utils')

/**
 * Get the list of badges of an organization
 */
const listBadges = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer()
      })
      .required()
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
  }
})

/**
 * Create organization badge
 */
const createBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer()
      })
      .required(),
    body: yup
      .object({
        name: yup.string().required(),
        color: yup.string().required()
      })
      .required()
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      const [badge] = await conn('organization_badge')
        .insert({
          organization_id: req.params.id,
          ...req.body
        })
        .returning('*')
      reply.send(badge)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  }
})

/**
 * Get organization badge
 */
const getBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
        badgeId: yup.number().required().positive().integer()
      })
      .required()
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      const [badge] = await conn('organization_badge')
        .select('*')
        .where('id', req.params.badgeId)
        .returning('*')
      reply.send(badge)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  }
})

/**
 * Edit organization badge
 */
const patchBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        id: yup.number().required().positive().integer(),
        badgeId: yup.number().required().positive().integer()
      })
      .required(),
    body: yup
      .object({
        name: yup.string().optional(),
        color: yup.string().optional()
      })
      .required()
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
  }
})

/**
 * Delete organization badge
 */
const deleteBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        badgeId: yup.number().required().positive().integer()
      })
      .required()
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()
      await conn('organization_badge')
        .delete()
        .where('id', req.params.badgeId)
      return reply.sendStatus(200)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  }
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
        userId: yup.number().required().positive().integer()
      })
      .required(),
    body: yup
      .object({
        assigned_at: yup.date().optional(),
        valid_until: yup.date().optional()
      })
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()

      // user is member
      await organization.isMember(req.params.id, req.params.userId)

      // assign badge
      const [badge] = await conn('user_badge')
        .insert({
          user_id: req.params.userId,
          badge_id: req.params.badgeId,
          assigned_at: req.body.assigned_at,
          valid_until: req.body.valid_until
        })
        .returning('*')

      reply.send(badge)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  }
})

/**
 * List badges of an user
 */
const listUserBadges = routeWrapper({
  validate: {
    params: yup
      .object({
        userId: yup.number().required().positive().integer()
      })
      .required()
  },
  handler: async function (req, reply) {
    try {
      const badges = await profile.getUserBadges(req.params.userId)
      reply.send({ badges })
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  }
})

/**
 * Update a badge assigned to an user
 */
const updateUserBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        badgeId: yup.number().required().positive().integer(),
        userId: yup.number().required().positive().integer()
      })
      .required(),
    body: yup
      .object({
        assigned_at: yup.date().optional(),
        valid_until: yup.date().optional()
      })
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()

      // assign badge
      const [badge] = await conn('user_badge')
        .update({
          assigned_at: req.body.assigned_at,
          valid_until: req.body.valid_until
        })
        .where({
          user_id: req.params.userId,
          badge_id: req.params.badgeId
        })
        .returning('*')

      reply.send(badge)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  }
})

/**
 * Remove badge assign to an user
 */
const removeUserBadge = routeWrapper({
  validate: {
    params: yup
      .object({
        badgeId: yup.number().required().positive().integer(),
        userId: yup.number().required().positive().integer()
      })
      .required()
  },
  handler: async function (req, reply) {
    try {
      const conn = await db()

      // delete user badge
      await conn('user_badge').delete().where({
        user_id: req.params.userId,
        badge_id: req.params.badgeId
      })

      reply.sendStatus(200)
    } catch (err) {
      console.log(err)
      return reply.boom.badRequest(err.message)
    }
  }
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
  removeUserBadge
}
