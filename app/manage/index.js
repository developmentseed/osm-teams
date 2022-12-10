const router = require('express-promise-router')()
const expressPino = require('express-pino-logger')
const { path } = require('ramda')

const { getClients, createClient, deleteClient } = require('./client')
const { login, loginAccept, logout } = require('./login')
const { can } = require('./permissions')
const sessionMiddleware = require('./sessions')
const logger = require('../lib/logger')

const { getUserManageToken } = require('../lib/profile')

/**
 * The manageRouter handles all routes related to the first party
 * management client
 *
 * @param {Object} nextApp the NextJS Server
 */
function manageRouter (nextApp) {
  if (process.env.NODE_ENV !== 'test') {
    router.use('/api', expressPino({
      logger: logger.child({ module: 'manage' })
    }))
  }

  router.use(sessionMiddleware)

  /**
   * Home page
   */
  router.get('/', (req, res) => {
    return nextApp.render(req, res, '/', { user: path(['session', 'user'], req) })
  })

  /**
   * Logging in to manage app
   */
  router.get('/login', login)
  router.get('/login/accept', loginAccept)
  router.get('/logout', logout)

  /**
   * List / Create / Delete clients
   */
  router.get('/api/clients', can('clients'), getClients)
  router.post('/api/clients', can('clients'), createClient)
  router.delete('/api/clients/:id', can('client:delete'), deleteClient)

  /**
   * Page renders
   */
  router.get('/clients', can('clients'), async (req, res) => {
    const { manageToken } = await getUserManageToken(res.locals.user_id)
    const access_token = manageToken.access_token
    return nextApp.render(req, res, '/clients', { access_token })
  })

  /**
   * Badge pages
   * */
  router.get(
    '/organizations/:id/badges/add',
    can('organization:edit'),
    (req, res) => {
      return nextApp.render(req, res, '/badges/add', { id: req.params.id })
    }
  )
  router.get(
    '/organizations/:id/badges/:badgeId',
    can('organization:edit'),
    (req, res) => {
      return nextApp.render(req, res, '/badges/edit', {
        id: req.params.id,
        badgeId: req.params.badgeId
      })
    }
  )

  return router
}

module.exports = manageRouter
