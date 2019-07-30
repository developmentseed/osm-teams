const router = require('express-promise-router')()
const expressPino = require('express-pino-logger')

const { getClients, createClient, deleteClient } = require('./client')
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
    return nextApp.render(req, res, '/clients')
  })

  router.get('/profile', can('clients:view'), (req, res) => {
    return nextApp.render(req, res, '/profile')
  })

  router.get('/teams/:id', can('team:view'), (req, res) => {
    return nextApp.render(req, res, '/team', { id: req.params.id })
  })

  router.get('/teams/:id/edit', can('team:update'), (req, res) => {
    return nextApp.render(req, res, '/team-edit', { id: req.params.id })
  })

  return router
}

module.exports = manageRouter
