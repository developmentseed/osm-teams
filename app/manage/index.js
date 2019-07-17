const router = require('express-promise-router')()
const expressPino = require('express-pino-logger')

const { getClients, createClient, deleteClient } = require('./client')
const { getPlaces, createPlace, deletePlace } = require('./places')
const { login, loginAccept, logout } = require('./login')
const { listTeams, createTeam, getTeam, updateTeam, destroyTeam, addMember, removeMember, updateMembers } = require('./teams')
const { can } = require('./permissions')
const sessionMiddleware = require('./sessions')
const logger = require('../lib/logger')

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
    return nextApp.render(req, res, '/', { user: req.session.user })
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
  router.get('/api/clients', can('clients:view'), getClients)
  router.post('/api/clients', can('clients:create'), createClient)
  router.delete('/api/clients/:id', can('clients:delete'), deleteClient)

  /**
   * List / Create / Delete places
   */
  router.get('/api/places', getPlaces)
  router.post('/api/places', createPlace)
  router.delete('/api/places/:id', deletePlace)

  /**
   * List / Create / Delete teams
   */
  router.get('/api/teams', listTeams)
  router.post('/api/teams', can('team:create'), createTeam)
  router.get('/api/teams/:id', can('team:view'), getTeam)
  router.put('/api/teams/:id', can('team:update'), updateTeam)
  router.delete('/api/teams/:id', can('team:delete'), destroyTeam)
  router.put('/api/teams/add/:id/:osmId', can('team:update'), addMember)
  router.put('/api/teams/remove/:id/:osmId', can('team:update'), removeMember)
  router.patch('/api/teams/:id/members', can('team:update'), updateMembers)

  /**
   * Page renders
   */
  router.get('/clients', can('clients:view'), (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/clients', { user, user_picture })
  })

  router.get('/profile', can('clients:view'), (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/profile', { user, user_picture })
  })

  return router
}

module.exports = manageRouter
