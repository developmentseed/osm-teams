const logger = require('../../src/lib/logger')

/**
 * Route wrapper to perform validation before processing
 * the request.
 * @param {function} config.validate Yup validation schema
 * @param {function} config.handler Handler to execute if validation pass
 *
 * @returns {function} Route middleware function
 */
function routeWrapper(config) {
  const { validate, handler } = config
  return async (req, reply) => {
    try {
      if (validate.params) {
        req.params = await validate.params.validate(req.params)
      }

      if (validate.body) {
        req.body = await validate.body.validate(req.body)
      }
    } catch (error) {
      logger.error(error)
      reply.boom.badRequest(error)
    }
    await handler(req, reply)
  }
}

module.exports = {
  routeWrapper,
}
