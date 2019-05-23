const { serverRuntimeConfig, publicRuntimeConfig } = require('../../next.config')
const jwt = require('jsonwebtoken')
const db = require('../db')

const credentials = {
  client: {
    id: serverRuntimeConfig.OSM_HYDRA_ID,
    secret: serverRuntimeConfig.OSM_HYDRA_SECRET,
  },
  auth: {
    tokenHost: serverRuntimeConfig.HYDRA_TOKEN_URL,
    tokenPath: '/oauth2/token',
    authorizeHost: serverRuntimeConfig.HYDRA_AUTHZ_URL || serverRuntimeConfig.HYDRA_TOKEN_URL,
    authorizePath: '/oauth2/auth'
  }
}

const oauth2 = require('simple-oauth2').create(credentials)

var generateState = function(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function login (req, res) {
  let state = generateState(24)
  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: `${publicRuntimeConfig.APP_URL}/login/accept`,
    scope: 'openid clients',
    state
  })
  req.session.login_csrf = state

  res.redirect(authorizationUri)
}

async function loginAccept (req, res) {
  const { code, state } = req.query
  /**
   * Token exchange with CSRF handling
   */
  if (state !== req.session.login_csrf) {
    req.session.destroy(function (err) {
      if (err) console.error(err)
      return res.status(500).json('State does not match')
    })
  } else {
    // Flush csrf
    req.session.login_csrf = null

    // Create options for token exchange
    const options = {
      code,
      redirect_uri: `${publicRuntimeConfig.APP_URL}/login/accept`
    }

    try {
      const result = await oauth2.authorizationCode.getToken(options)
      const { sub } = jwt.decode(result.id_token)

      // Store access token and refresh token
      let conn = await db()
      await conn('users').where('id', sub).update({
        manageToken: JSON.stringify(result)
      })
      
      // Store id token in session
      req.session.idToken = result.id_token
      return res.redirect('/')

    } catch (error) {
      console.error(error)
      return res.status(500).json('Authentication failed')
    }
  }
}

/**
 * Logout deletes the session from the manage app
 * @param {*} req 
 * @param {*} res 
 */
function logout (req, res) {
  req.session.destroy(function (err) {
    if (err) console.error(err)
    res.redirect('/')
  })
}

module.exports = {
  login,
  loginAccept,
  logout
}