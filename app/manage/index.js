const router = require('express-promise-router')()
const session = require('express-session')
const expressPino = require('express-pino-logger')

const { getClients, createClient, deleteClient } = require('./client')
const { getPlaces, createPlace, deletePlace } = require('./places')
const { login, loginAccept, logout } = require('./login')
const { listTeams, createTeam, getTeam, updateTeam, destroyTeam, addMember, removeMember, updateMembers} = require('./teams')
const { attachUser, protected } = require('./authz')
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
  router.get('/login/accept',loginAccept)
  router.get('/logout', logout)

  /**
   * List / Create / Delete clients
   */
  router.get('/api/clients', protected, getClients)
  router.post('/api/clients', protected, createClient)
  router.delete('/api/clients/:id', protected, deleteClient)

  /**
   * List / Create / Delete places
   */
  router.get('/api/places', protected, getPlaces)
  router.post('/api/places', protected, createPlace)
  router.delete('/api/places/:id', protected, deletePlace)

  /**
   * List / Create / Delete teams
   */
  router.get('/api/teams', listTeams)
  router.post('/api/teams', protected, createTeam)
  router.get('/api/teams/:id', getTeam)
  router.put('/api/teams/:id', protected, updateTeam)
  router.delete('/api/teams/:id', protected, destroyTeam)
  router.put('/api/teams/add/:id/:osmId', protected, addMember)
  router.put('/api/teams/remove/:id/:osmId', protected, removeMember)
  router.patch('/api/teams/:id/members', protected, updateMembers)

  /**
   * Page renders
   */
  router.get('/clients', protected, (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/clients', { user, user_picture })
  })

  router.get('/profile', protected, (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/profile', { user, user_picture })
  })

  return router
}

module.exports = manageRouter
