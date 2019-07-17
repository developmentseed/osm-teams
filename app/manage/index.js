const router = require('express-promise-router')()
const session = require('express-session')
const expressPino = require('express-pino-logger')

const { getClients, createClient, deleteClient } = require('./client')
const { login, loginAccept, logout } = require('./login')
const { listTeams, createTeam, getTeam, updateTeam, destroyTeam, addMember, removeMember, updateMembers } = require('./teams')
const { attachUser, authenticate } = require('./authz')
const { serverRuntimeConfig } = require('../../next.config')
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

  /**
   * Attach a user session for these routes
   */
  const SESSION_SECRET = serverRuntimeConfig.SESSION_SECRET || 'super-secret-sessions'
  let sessionConfig = {
    name: 'osm-hydra-sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    expires: new Date(Date.now() + (30 * 86400 * 1000))
  }

  const sessionMiddleware = [session(sessionConfig), attachUser()]
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
    return nextApp.render(req, res, '/clients')
  })

  router.get('/profile', authenticate, (req, res) => {
    return nextApp.render(req, res, '/profile')
  })

  router.get('/team/:id', authenticate, (req, res) => {
    return nextApp.render(req, res, '/team', { id: req.params.id })
  })

  return router
}

module.exports = manageRouter
