const db = require('../db')
const yup = require('yup')

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
  })
}
