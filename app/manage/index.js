const { can } = require('./permissions')
const {
  addMember,
  assignModerator,
  createTeam,
  destroyTeam,
  getTeam,
  getTeamMembers,
  joinTeam,
  listTeams,
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
    can('organization:view-team-keys'),
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
}

module.exports = manageRouter
