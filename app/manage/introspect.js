const hydra = require('../lib/hydra')

/**
 * Introspect token from POST
 * @param {*} req
 * @param {*} res
 */
async function introspect (req, res) {
  const { token } = req.body
  if (!token) {
    return res.boom.badRequest('token is required to introspect')
  }
  let result = await hydra.introspect(token)
  return res.send(result)
}

module.exports = { introspect }
