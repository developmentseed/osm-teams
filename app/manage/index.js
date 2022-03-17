const router = require('express-promise-router')()
const expressPino = require('express-pino-logger')
const { path } = require('ramda')

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
  getTeamMembers,
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
  getOrgMembers,
  listMyOrgs,
  getOrgStaff
} = require('./organizations')

const {
  createBadge,
  getBadge,
  patchBadge,
  deleteBadge,
  listBadges,
  assignUserBadge,
  listUserBadges,
  updateUserBadge,
  removeUserBadge
} = require('./badges')

const {
  getUserTeamProfile,
  createProfileKeys,
  getProfileKeys,
  modifyProfileKey,
  getMyProfile,
  setMyProfile,
  setProfile,
  deleteProfileKey,
  getUserOrgProfile,
  getTeamProfile
} = require('./profiles')

const { getUserManageToken } = require('../lib/profile')
const organization = require('../lib/organization')

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
   * List, Create, Read, Update, Delete operations on teams.
   */
  router.get('/api/teams', listTeams)
  router.get('/api/my/teams', can('public:authenticated'), listMyTeams)
  router.post('/api/teams', can('public:authenticated'), createTeam)
  router.get('/api/teams/:id', can('team:view'), getTeam)
  router.get('/api/teams/:id/members', can('team:view-members'), getTeamMembers)
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
  router.get('/api/organizations/:id', can('public:authenticated'), getOrg)
  router.put('/api/organizations/:id', can('organization:edit'), updateOrg)
  router.delete('/api/organizations/:id', can('organization:edit'), destroyOrg)
  router.get('/api/organizations/:id/staff', can('organization:view-members'), getOrgStaff)
  router.get('/api/organizations/:id/members', can('organization:view-members'), getOrgMembers)

  router.put('/api/organizations/:id/addOwner/:osmId', can('organization:edit'), addOwner)
  router.put('/api/organizations/:id/removeOwner/:osmId', can('organization:edit'), removeOwner)

  router.put('/api/organizations/:id/addManager/:osmId', can('organization:edit'), addManager)
  router.put('/api/organizations/:id/removeManager/:osmId', can('organization:edit'), removeManager)

  router.post('/api/organizations/:id/teams', can('organization:create-team'), createOrgTeam)
  router.get('/api/organizations/:id/teams', getOrgTeams)

  /**
   * Manage organization badges
   */
  router.get(
    '/api/organizations/:id/badges',
    can('organization:edit'),
    listBadges
  )
  router.post(
    '/api/organizations/:id/badges',
    can('organization:edit'),
    createBadge
  )
  router.get(
    '/api/organizations/:id/badges/:badgeId',
    can('organization:edit'),
    getBadge
  )
  router.patch(
    '/api/organizations/:id/badges/:badgeId',
    can('organization:edit'),
    patchBadge
  )
  router.delete(
    '/api/organizations/:id/badges/:badgeId',
    can('organization:edit'),
    deleteBadge
  )

  /**
   * Manage user badges
   */
  router.post(
    '/api/organizations/:id/badges/:badgeId/assign/:userId',
    can('organization:edit'),
    assignUserBadge
  )
  router.get(
    '/api/user/:userId/badges',
    can('public:authenticated'),
    listUserBadges
  )
  router.patch(
    `/api/organizations/:id/member/:userId/badge/:badgeId`,
    can('organization:edit'),
    updateUserBadge
  )

  router.delete(
    `/api/organizations/:id/member/:userId/badge/:badgeId`,
    can('organization:edit'),
    removeUserBadge
  )

  /**
   * List, Create, Read, Update, Delete operations on profiles
   */
  router.get('/api/profiles/teams/:id/:osmId', can('public:authenticated'), getUserTeamProfile)
  router.get('/api/profiles/organizations/:id/:osmId', can('public:authenticated'), getUserOrgProfile)
  router.get('/api/my/profiles', can('public:authenticated'), getMyProfile)
  router.post('/api/my/profiles', can('public:authenticated'), setMyProfile)

  router.put('/api/profiles/keys/:id', can('key:edit'), modifyProfileKey)
  router.delete('/api/profiles/keys/:id', can('key:edit'), deleteProfileKey)

  router.get('/api/profiles/keys/organizations/:id', can('organization:edit'), getProfileKeys('org', 'org'))
  router.post('/api/profiles/keys/organizations/:id', can('organization:edit'), createProfileKeys('org', 'org'))

  router.get('/api/profiles/keys/organizations/:id/teams', can('organization:edit'), getProfileKeys('org', 'team'))
  router.post('/api/profiles/keys/organizations/:id/teams', can('organization:edit'), createProfileKeys('org', 'team'))

  router.get('/api/profiles/keys/organizations/:id/users', can('organization:member'), getProfileKeys('org', 'user'))
  router.post('/api/profiles/keys/organizations/:id/users', can('organization:edit'), createProfileKeys('org', 'user'))

  router.get('/api/profiles/keys/teams/:id', can('team:edit'), getProfileKeys('team', 'team'))
  router.get('/api/profiles/keys/teams/:id/users', can('team:member'), getProfileKeys('team', 'user'))
  router.post('/api/profiles/keys/teams/:id', can('team:edit'), createProfileKeys('team', 'team'))
  router.post('/api/profiles/keys/teams/:id/users', can('team:edit'), createProfileKeys('team', 'user'))

  router.get('/api/profiles/teams/:id', can('public:authenticated'), getTeamProfile)
  router.post('/api/profiles/teams/:id', can('team:edit'), setProfile('team'))
  router.post('/api/profiles/organizations/:id', can('organization:edit'), setProfile('org'))

  /**
   * Page renders
   */
  router.get('/clients', can('clients'), async (req, res) => {
    const { manageToken } = await getUserManageToken(res.locals.user_id)
    const access_token = manageToken.access_token
    return nextApp.render(req, res, '/clients', { access_token })
  })

  router.get('/profile', can('clients'), (req, res) => {
    return nextApp.render(req, res, '/profile')
  })

  router.get('/teams/create', can('public:authenticated'), async (req, res) => {
    const staff = await organization.getOrgStaff({ osmId: Number(res.locals.user_id) })
    return nextApp.render(req, res, '/team-create', { staff })
  })

  router.get('/teams/:id', can('team:view'), async (req, res) => {
    return nextApp.render(req, res, '/team', { id: req.params.id })
  })

  router.get('/teams/:id/edit', can('team:edit'), (req, res) => {
    return nextApp.render(req, res, '/team-edit', { id: req.params.id })
  })

  router.get('/teams/:id/edit-profiles', can('team:edit'), (req, res) => {
    return nextApp.render(req, res, '/team-edit-profile', { id: req.params.id })
  })

  router.get('/teams/:id/profile', can('team:member'), (req, res) => {
    return nextApp.render(req, res, '/profile-form', { id: req.params.id, formType: 'team' })
  })

  router.get('/organizations/create', can('public:authenticated'), (req, res) => {
    return nextApp.render(req, res, '/org-create')
  })

  router.get('/organizations/:id', can('public:authenticated'), async (req, res) => {
    return nextApp.render(req, res, '/organization', { id: req.params.id })
  })

  router.get('/organizations/:id/edit', can('organization:edit'), (req, res) => {
    return nextApp.render(req, res, '/org-edit', { id: req.params.id })
  })

  router.get('/organizations/:id/edit-profiles', can('organization:edit'), (req, res) => {
    return nextApp.render(req, res, '/org-edit-profile', { id: req.params.id })
  })

  router.get('/organizations/:id/profile', can('organization:member'), (req, res) => {
    return nextApp.render(req, res, '/profile-form', { id: req.params.id, formType: 'org' })
  })

  router.get('/organizations/:id/edit-team-profiles', can('organization:member'), (req, res) => {
    return nextApp.render(req, res, '/org-edit-team-profile', { id: req.params.id })
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
