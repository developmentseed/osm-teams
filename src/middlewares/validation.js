/**
 * Validation middleware
 * @param {function} config.schema Yup validation schema
 * @param {function} config.handler Handler to execute if validation pass
 *
 * @returns {function} Route middleware function
 */
export function validate(schema) {
  return async (req, res, next) => {
    if (schema.query) {
      req.query = await schema.query.validate(req.query)
    }
    if (schema.body) {
      req.body = await schema.body.validate(req.body)
    }
    next()
  }
}
