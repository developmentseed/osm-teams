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
  router.post('/api/teams', can('public:authenticated'), createTeam)
  router.get('/api/teams/:id', can('team:view'), getTeam)
  router.put('/api/teams/:id', can('team:edit'), updateTeam)
  router.delete('/api/teams/:id', can('team:edit'), destroyTeam)
  router.put('/api/teams/add/:id/:osmId', can('team:edit'), addMember)
  router.put('/api/teams/remove/:id/:osmId', can('team:edit'), removeMember)
  router.patch('/api/teams/:id/members', can('team:edit'), updateMembers)
  router.put('/api/teams/:id/join', can('team:join'), joinTeam)
  router.put('/api/teams/:id/assignModerator/:osmId', can('team:edit'), assignModerator)
  router.put('/api/teams/:id/removeModerator/:osmId', can('team:edit'), removeModerator)

  /**
   * List, Create, Read, Update, Delete operations on orgs
   */
  router.post('/api/organizations', can('public:authenticated'), createOrg)
  router.get('/api/organizations/:id', can('public:authenticated'), getOrg) // TODO handle private organizations
  router.put('/api/organizations/:id', can('organization:edit'), updateOrg)
  router.delete('/api/organizations/:id', can('organization:edit'), destroyOrg)

  router.put('/api/organizations/:id/addOwner/:osmId', can('organization:edit'), addOwner)
  router.put('/api/organizations/:id/removeOwner/:osmId', can('organization:edit'), removeOwner)

  router.put('/api/organizations/:id/addManager/:osmId', can('organization:edit'), addManager)
  router.put('/api/organizations/:id/removeManager/:osmId', can('organization:edit'), removeManager)

  router.post('/api/organizations/:id/teams', can('organization:create-team'), createOrgTeam)
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

  router.get('/teams/create', can('public:authenticated'), (req, res) => {
    return nextApp.render(req, res, '/team-create', { id: req.params.id })
  })

  router.get('/teams/:id', can('team:view'), (req, res) => {
    return nextApp.render(req, res, '/team', { id: req.params.id })
  })

  router.get('/teams/:id/edit', can('team:edit'), (req, res) => {
    return nextApp.render(req, res, '/team-edit', { id: req.params.id })
  })

  return router
}

module.exports = manageRouter
