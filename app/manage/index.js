const router = require('express-promise-router')()
const expressPino = require('express-pino-logger')

const { getClients, createClient, deleteClient } = require('./client')
const { getPlaces, createPlace, deletePlace } = require('./places')
const { login, loginAccept, logout } = require('./login')
const { listTeams, createTeam, getTeam, updateTeam, destroyTeam, addMember, removeMember, updateMembers } = require('./teams')
const authenticate = require('./permissions')
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
  router.get('/api/clients', authenticate, getClients)
  router.post('/api/clients', authenticate, createClient)
  router.delete('/api/clients/:id', authenticate, deleteClient)

  /**
   * List / Create / Delete places
   */
  router.get('/api/places', authenticate, getPlaces)
  router.post('/api/places', authenticate, createPlace)
  router.delete('/api/places/:id', authenticate, deletePlace)

  /**
   * List / Create / Delete teams
   */
  router.get('/api/teams', listTeams)
  router.post('/api/teams', authenticate, createTeam)
  router.get('/api/teams/:id', getTeam)
  router.put('/api/teams/:id', authenticate, updateTeam)
  router.delete('/api/teams/:id', authenticate, destroyTeam)
  router.put('/api/teams/add/:id/:osmId', authenticate, addMember)
  router.put('/api/teams/remove/:id/:osmId', authenticate, removeMember)
  router.patch('/api/teams/:id/members', authenticate, updateMembers)

  /**
   * Page renders
   */
  router.get('/clients', authenticate, (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/clients', { user, user_picture })
  })

  router.get('/profile', authenticate, (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/profile', { user, user_picture })
  })

  return router
}

module.exports = manageRouter
