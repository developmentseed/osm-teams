/**
 * Login Provider
 */

const hydra = require('../lib/hydra')
const url = require('url')

function getLogin (app) {
  return async function login(req, res, next) {
    const query = url.parse(req.url, true).query
    const challenge = query.login_challenge
    if (!challenge) return next(e)

    try {
      let { subject, skip } = await hydra.getLoginRequest(challenge)

      // TODO check if the user has revoked their OSM token

      if (skip) {
        const { redirect_to } = await hydra.acceptLoginRequest(challenge, { subject })
        res.redirect(redirect_to)
      } else {
        app.render(req, res, '/login', {
          challenge: challenge
        })
      }
    } catch (e) {
      next(e)
    }
  }
}

module.exports = {
  getLogin
}