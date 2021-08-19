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
  getOrgTeams,
  listMyOrgs
} = require('./organizations')

const {
  getUserTeamProfile,
  createProfileKeys,
  getProfileKeys,
  modifyProfileKey,
  getMyProfile,
  setMyProfile,
  setProfile,
  deleteProfileKey
} = require('./profiles')

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
  router.get('/api/my/organizations', can('public:authenticated'), listMyOrgs)
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
   * List, Create, Read, Update, Delete operations on profiles
   */
  router.get('/api/profiles/teams/:id/:osmId', can('public:authenticated'), getUserTeamProfile)
  router.get('/api/my/profiles', can('public:authenticated'), getMyProfile)
  router.post('/api/my/profiles', can('public:authenticated'), setMyProfile)

  router.put('/api/profiles/keys/:id', can('key:edit'), modifyProfileKey)
  router.delete('/api/profiles/keys/:id', can('key:edit'), deleteProfileKey)

  router.get('/api/profiles/keys/organizations/:id', can('organization:edit'), getProfileKeys('org', 'org'))
  router.post('/api/profiles/keys/organizations/:id', can('organization:edit'), createProfileKeys('org', 'org'))
  router.post('/api/profiles/keys/organizations/:id/teams', can('organization:edit'), createProfileKeys('org', 'team'))
  router.post('/api/profiles/keys/organizations/:id/users', can('organization:edit'), createProfileKeys('org', 'user'))

  router.get('/api/profiles/keys/teams/:id', can('team:edit'), getProfileKeys('team', 'team'))
  router.get('/api/profiles/keys/teams/:id/users', can('team:edit'), getProfileKeys('team', 'user'))
  router.post('/api/profiles/keys/teams/:id', can('team:edit'), createProfileKeys('team', 'team'))
  router.post('/api/profiles/keys/teams/:id/users', can('team:edit'), createProfileKeys('team', 'user'))

  router.post('/api/profiles/teams/:id', can('team:edit'), setProfile('team'))
  router.post('/api/profiles/organizations/:id', can('organization:edit'), setProfile('org'))

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
    return nextApp.render(req, res, '/team-create')
  })

  router.get('/teams/:id', can('team:view'), (req, res) => {
    return nextApp.render(req, res, '/team', { id: req.params.id })
  })

  router.get('/teams/:id/edit', can('team:edit'), (req, res) => {
    return nextApp.render(req, res, '/team-edit', { id: req.params.id })
  })

  router.get('/teams/:id/edit-profiles', can('team:edit'), (req, res) => {
    return nextApp.render(req, res, '/team-edit-profile', { id: req.params.id })
  })

  router.get('/teams/:id/profile', can('team:view'), (req, res) => {
    return nextApp.render(req, res, '/team-profile', { id: req.params.id })
  })

  router.get('/organizations/create', can('public:authenticated'), (req, res) => {
    return nextApp.render(req, res, '/org-create')
  })

  return router
}

module.exports = manageRouter
