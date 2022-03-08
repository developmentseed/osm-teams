const db = require('../db')
const yup = require('yup')
const organization = require('../lib/organization')
const profile = require('../lib/profile')

function route ({ validate, handler }) {
  return async (req, reply) => {
    try {
      if (validate.params) {
        req.params = await validate.params.validate(req.params)
      }

      if (validate.body) {
        req.body = await validate.body.validate(req.body)
      }
    } catch (error) {
      console.log(error)
      reply.boom.badRequest(error)
    }
    await handler(req, reply)
  }
}

module.exports = {
  listBadges: route({
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
        reply.send(badges)
      } catch (err) {
        console.log(err)
        return reply.boom.badRequest(err.message)
      }
    }
  }),
  createBadge: route({
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
  }),
  patchBadge: route({
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
  }),
  deleteBadge: route({
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
  }),
  assignUserBadge: route({
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
  }),
  listUserBadges: route({
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
  }),
  updateUserBadge: route({
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
}
