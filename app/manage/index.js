const router = require('express-promise-router')()
const { path } = require('ramda')

const { getClients, createClient, deleteClient } = require('./client')
const { login, loginAccept, logout } = require('./login')
const { can } = require('./permissions')
const sessionMiddleware = require('./sessions')
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
  updateTeam,
  getJoinInvitations,
  createJoinInvitation,
  deleteJoinInvitation,
  acceptJoinInvitation,
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
  getOrgStaff,
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
  removeUserBadge,
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
  getTeamProfile,
} = require('./profiles')

const { getUserManageToken } = require('../lib/profile')
const orgModel = require('../lib/organization')
const teamModel = require('../lib/team')

/**
 * Add routes to next-connect handler.
 *
 * @param {Object} handle next-connect handler
 */
function manageRouter(handler) {
  /**
   * List, Create, Read, Update, Delete operations on teams.
   */
  handler.get('api/teams', listTeams)
  handler.get('/api/my/teams', can('public:authenticated'), listMyTeams)
  handler.post('/api/teams', can('public:authenticated'), createTeam)
  handler.get('/api/teams/:id', can('team:view'), getTeam)
  handler.get(
    '/api/teams/:id/members',
    can('team:view-members'),
    getTeamMembers
  )
  handler.put('/api/teams/:id', can('team:edit'), updateTeam)
  handler.delete('/api/teams/:id', can('team:edit'), destroyTeam)
  handler.put('/api/teams/add/:id/:osmId', can('team:edit'), addMember)
  handler.put('/api/teams/remove/:id/:osmId', can('team:edit'), removeMember)
  handler.patch('/api/teams/:id/members', can('team:edit'), updateMembers)
  handler.put('/api/teams/:id/join', can('team:join'), joinTeam)
  handler.put(
    '/api/teams/:id/assignModerator/:osmId',
    can('team:edit'),
    assignModerator
  )
  handler.put(
    '/api/teams/:id/removeModerator/:osmId',
    can('team:edit'),
    removeModerator
  )

  /**
   * Manage invitations to teams
   */
  handler.get(
    '/api/teams/:id/invitations',
    can('team:edit'),
    getJoinInvitations
  )
  handler.post(
    '/api/teams/:id/invitations',
    can('team:edit'),
    createJoinInvitation
  )
  handler.delete(
    '/api/teams/:id/invitations/:uuid',
    can('team:edit'),
    deleteJoinInvitation
  )
  handler.post(
    '/api/teams/:id/invitations/:uuid/accept',
    can('public:authenticated'),
    acceptJoinInvitation
  )

  /**
   * List, Create, Read, Update, Delete operations on orgs
   */
  handler.get('/api/my/organizations', can('public:authenticated'), listMyOrgs)
  handler.post('/api/organizations', can('public:authenticated'), createOrg)
  handler.get('/api/organizations/:id', can('public:authenticated'), getOrg)
  handler.put('/api/organizations/:id', can('organization:edit'), updateOrg)
  handler.delete('/api/organizations/:id', can('organization:edit'), destroyOrg)
  handler.get(
    '/api/organizations/:id/staff',
    can('organization:view-members'),
    getOrgStaff
  )
  handler.get(
    '/api/organizations/:id/members',
    can('organization:view-members'),
    getOrgMembers
  )

  handler.put(
    '/api/organizations/:id/addOwner/:osmId',
    can('organization:edit'),
    addOwner
  )
  handler.put(
    '/api/organizations/:id/removeOwner/:osmId',
    can('organization:edit'),
    removeOwner
  )

  handler.put(
    '/api/organizations/:id/addManager/:osmId',
    can('organization:edit'),
    addManager
  )
  handler.put(
    '/api/organizations/:id/removeManager/:osmId',
    can('organization:edit'),
    removeManager
  )

  handler.post(
    '/api/organizations/:id/teams',
    can('organization:create-team'),
    createOrgTeam
  )
  handler.get(
    '/api/organizations/:id/teams',
    can('organization:view-members'),
    getOrgTeams
  )

  /**
   * Manage organization badges
   */
  handler.get(
    '/api/organizations/:id/badges',
    can('organization:edit'),
    listBadges
  )
  handler.post(
    '/api/organizations/:id/badges',
    can('organization:edit'),
    createBadge
  )
  handler.get(
    '/api/organizations/:id/badges/:badgeId',
    can('organization:edit'),
    getBadge
  )
  handler.patch(
    '/api/organizations/:id/badges/:badgeId',
    can('organization:edit'),
    patchBadge
  )
  handler.delete(
    '/api/organizations/:id/badges/:badgeId',
    can('organization:edit'),
    deleteBadge
  )

  /**
   * Manage user badges
   */
  handler.post(
    '/api/organizations/:id/badges/:badgeId/assign/:userId',
    can('organization:edit'),
    assignUserBadge
  )
  handler.get(
    '/api/user/:userId/badges',
    can('public:authenticated'),
    listUserBadges
  )
  handler.patch(
    `/api/organizations/:id/member/:userId/badge/:badgeId`,
    can('organization:edit'),
    updateUserBadge
  )

  handler.delete(
    `/api/organizations/:id/member/:userId/badge/:badgeId`,
    can('organization:edit'),
    removeUserBadge
  )

  /**
   * List, Create, Read, Update, Delete operations on profiles
   */
  handler.get(
    '/api/profiles/teams/:id/:osmId',
    can('public:authenticated'),
    getUserTeamProfile
  )
  handler.get(
    '/api/profiles/organizations/:id/:osmId',
    can('public:authenticated'),
    getUserOrgProfile
  )
  handler.get('/api/my/profiles', can('public:authenticated'), getMyProfile)
  handler.post('/api/my/profiles', can('public:authenticated'), setMyProfile)

  handler.put('/api/profiles/keys/:id', can('key:edit'), modifyProfileKey)
  handler.delete('/api/profiles/keys/:id', can('key:edit'), deleteProfileKey)

  handler.get(
    '/api/profiles/keys/organizations/:id',
    can('organization:edit'),
    getProfileKeys('org', 'org')
  )
  handler.post(
    '/api/profiles/keys/organizations/:id',
    can('organization:edit'),
    createProfileKeys('org', 'org')
  )

  handler.get(
    '/api/profiles/keys/organizations/:id/teams',
    can('organization:edit'),
    getProfileKeys('org', 'team')
  )
  handler.post(
    '/api/profiles/keys/organizations/:id/teams',
    can('organization:edit'),
    createProfileKeys('org', 'team')
  )

  handler.get(
    '/api/profiles/keys/organizations/:id/users',
    can('organization:member'),
    getProfileKeys('org', 'user')
  )
  handler.post(
    '/api/profiles/keys/organizations/:id/users',
    can('organization:edit'),
    createProfileKeys('org', 'user')
  )

  handler.get(
    '/api/profiles/keys/teams/:id',
    can('team:edit'),
    getProfileKeys('team', 'team')
  )
  handler.get(
    '/api/profiles/keys/teams/:id/users',
    can('team:member'),
    getProfileKeys('team', 'user')
  )
  handler.post(
    '/api/profiles/keys/teams/:id',
    can('team:edit'),
    createProfileKeys('team', 'team')
  )
  handler.post(
    '/api/profiles/keys/teams/:id/users',
    can('team:edit'),
    createProfileKeys('team', 'user')
  )

  handler.get(
    '/api/profiles/teams/:id',
    can('public:authenticated'),
    getTeamProfile
  )
  handler.post('/api/profiles/teams/:id', can('team:edit'), setProfile('team'))
  handler.post(
    '/api/profiles/organizations/:id',
    can('organization:edit'),
    setProfile('org')
  )

  // /**
  //  * Page renders
  //  */
  // handler.get('/clients', can('clients'), async (req, res) => {
  //   const { manageToken } = await getUserManageToken(res.locals.user_id)
  //   const access_token = manageToken.access_token
  //   return nextApp.render(req, res, '/clients', { access_token })
  // })

  // handler.get('/profile', can('clients'), (req, res) => {
  //   return nextApp.render(req, res, '/profile')
  // })

  // handler.get(
  //   '/teams/create',
  //   can('public:authenticated'),
  //   async (req, res) => {
  //     const staff = await orgModel.getOrgStaff({
  //       osmId: Number(res.locals.user_id),
  //     })
  //     return nextApp.render(req, res, '/team-create', { staff })
  //   }
  // )

  // handler.get('/teams/:id', can('team:view'), async (req, res) => {
  //   return nextApp.render(req, res, '/team', { id: req.params.id })
  // })

  // handler.get('/teams/:id/edit', can('team:edit'), (req, res) => {
  //   return nextApp.render(req, res, '/team-edit', { id: req.params.id })
  // })

  // handler.get('/teams/:id/edit-profiles', can('team:edit'), (req, res) => {
  //   return nextApp.render(req, res, '/team-edit-profile', { id: req.params.id })
  // })

  // handler.get('/teams/:id/profile', can('team:member'), (req, res) => {
  //   return nextApp.render(req, res, '/profile-form', {
  //     id: req.params.id,
  //     formType: 'team',
  //   })
  // })

  // handler.get('/teams/:id/invitations/:uuid', async (req, res) => {
  //   const teamId = req.params.id
  //   const invitationId = req.params.uuid
  //   const isInvitationValid = await teamModel.isInvitationValid(
  //     teamId,
  //     invitationId
  //   )

  //   if (!isInvitationValid) {
  //     return res.sendStatus(404)
  //   }

  //   const teamData = await teamModel.get(req.params.id)
  //   return nextApp.render(req, res, '/invitation', {
  //     team_id: req.params.id,
  //     invitation_id: req.params.uuid,
  //     team: teamData,
  //   })
  // })

  // handler.get(
  //   '/organizations/create',
  //   can('public:authenticated'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/org-create')
  //   }
  // )

  // handler.get(
  //   '/organizations/:id',
  //   can('public:authenticated'),
  //   async (req, res) => {
  //     return nextApp.render(req, res, '/organization', { id: req.params.id })
  //   }
  // )

  // handler.get(
  //   '/organizations/:id/edit',
  //   can('organization:edit'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/org-edit', { id: req.params.id })
  //   }
  // )

  // handler.get(
  //   '/organizations/:id/edit-profiles',
  //   can('organization:edit'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/org-edit-profile', {
  //       id: req.params.id,
  //     })
  //   }
  // )

  // handler.get(
  //   '/organizations/:id/edit-privacy-policy',
  //   can('organization:edit'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/org-edit-privacy-policy', {
  //       id: req.params.id,
  //     })
  //   }
  // )

  // handler.get(
  //   '/organizations/:id/profile',
  //   can('organization:member'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/profile-form', {
  //       id: req.params.id,
  //       formType: 'org',
  //     })
  //   }
  // )

  // handler.get(
  //   '/organizations/:id/edit-team-profiles',
  //   can('organization:edit'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/org-edit-team-profile', {
  //       id: req.params.id,
  //     })
  //   }
  // )

  // /**
  //  * Badge pages
  //  * */
  // handler.get(
  //   '/organizations/:id/badges/add',
  //   can('organization:edit'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/badges/add', { id: req.params.id })
  //   }
  // )
  // handler.get(
  //   '/organizations/:id/badges/:badgeId',
  //   can('organization:edit'),
  //   (req, res) => {
  //     return nextApp.render(req, res, '/badges/edit', {
  //       id: req.params.id,
  //       badgeId: req.params.badgeId,
  //     })
  //   }
  // )

  // // New badge assignment
  // handler.get(
  //   '/organizations/:id/badges/assign/:userId',
  //   can('organization:edit'),
  //   (req, res) => nextApp.render(req, res, '/badges-assignment/new', req.params)
  // )

  // // Edit badge assignment
  // handler.get(
  //   '/organizations/:id/badges/:badgeId/assign/:userId',
  //   can('organization:edit'),
  //   (req, res) =>
  //     nextApp.render(req, res, '/badges-assignment/edit', req.params)
  // )
}

module.exports = manageRouter
