const router = require('express-promise-router')()
const expressPino = require('express-pino-logger')

const { getClients, createClient, deleteClient } = require('./client')
const { login, loginAccept, logout } = require('./login')
const { can } = require('./permissions')
const sessionMiddleware = require('./sessions')
const logger = require('../lib/logger')
const {
  addMember,
  assignModerator,
  createTeam,
  destroyTeam,
  getTeam,
  joinTeam,
  listTeams,
  listMyTeams,
  removeMember,
  removeModerator,
  updateMembers,
  updateTeam
} = require('./teams')

const {
  createOrg,
  getOrg,
  updateOrg,
  destroyOrg,
  addOwner,
  removeOwner,
  addManager,
  removeManager,
  createOrgTeam,
  getOrgTeams
} = require('./organizations')

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
  router.get('/api/clients', can('clients'), getClients)
  router.post('/api/clients', can('clients'), createClient)
  router.delete('/api/clients/:id', can('client:delete'), deleteClient)

  /**
   * List, Create, Read, Update, Delete operations on teams.
   */
  router.get('/api/teams', listTeams)
  router.get('/api/my/teams', can('public:authenticated'), listMyTeams)
  router.post('/api/teams', can('team:create'), createTeam)
  router.get('/api/teams/:id', can('team:view'), getTeam)
  router.put('/api/teams/:id', can('team:update'), updateTeam)
  router.delete('/api/teams/:id', can('team:delete'), destroyTeam)
  router.put('/api/teams/add/:id/:osmId', can('team:update'), addMember)
  router.put('/api/teams/remove/:id/:osmId', can('team:update'), removeMember)
  router.patch('/api/teams/:id/members', can('team:update'), updateMembers)
  router.put('/api/teams/:id/join', can('team:join'), joinTeam)
  router.put('/api/teams/:id/assignModerator/:osmId', can('team:update'), assignModerator)
  router.put('/api/teams/:id/removeModerator/:osmId', can('team:update'), removeModerator)

  /**
   * List, Create, Read, Update, Delete operations on orgs
   */
  router.post('/api/organizations', can('public:authenticated'), createOrg)
  router.get('/api/organizations/:id', getOrg)
  router.put('/api/organizations/:id', updateOrg)
  router.delete('/api/organizations/:id', destroyOrg)

  router.put('/api/organizations/:id/addOwner/:osmId', addOwner)
  router.put('/api/organizations/:id/removeOwner/:osmId', removeOwner)

  router.put('/api/organizations/:id/addManager/:osmId', addManager)
  router.put('/api/organizations/:id/removeManager/:osmId', removeManager)

  router.post('/api/organizations/:id/teams', can('public:authenticated'), createOrgTeam)
  router.get('/api/organizations/:id/teams', getOrgTeams)

  /**
   * Page renders
   */
  router.get('/clients', can('clients'), (req, res) => {
    return nextApp.render(req, res, '/clients')
  })

  router.get('/profile', can('clients'), (req, res) => {
    return nextApp.render(req, res, '/profile')
  })

  router.get('/teams/create', can('team:create'), (req, res) => {
    return nextApp.render(req, res, '/team-create', { id: req.params.id })
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
