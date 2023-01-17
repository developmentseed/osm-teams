const { defineConfig } = require('cypress')
const db = require('./src/lib/db')
const Team = require('./src/models/team')
const Organization = require('./src/models/organization')
const TeamInvitation = require('./src/models/team-invitation')
const Badge = require('./src/models/badge')
const { pick } = require('ramda')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000/',
    video: false,
    setupNodeEvents(on) {
      on('task', {
        'db:reset': async () => {
          await db.raw('TRUNCATE TABLE team RESTART IDENTITY CASCADE')
          await db.raw('TRUNCATE TABLE organization RESTART IDENTITY CASCADE')
          await db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE')
          await db.raw('TRUNCATE TABLE osm_users RESTART IDENTITY CASCADE')
          await db.raw(
            'TRUNCATE TABLE organization_badge RESTART IDENTITY CASCADE'
          )
          await db.raw('TRUNCATE TABLE user_badges RESTART IDENTITY CASCADE')
          return null
        },
        'db:seed:create-teams': async ({ teams, moderatorId }) => {
          let createdTeams = []
          for (let i = 0; i < teams.length; i++) {
            const team = teams[i]
            createdTeams.push(await Team.create(team, moderatorId))
          }
          return createdTeams
        },
        'db:seed:add-member-to-teams': async ({ memberId, teams }) => {
          for (let i = 0; i < teams.length; i++) {
            const team = teams[i]
            await Team.addMember(team.id, memberId)
          }
          return null
        },
        'db:seed:add-members-to-team': async ({ teamId, members }) => {
          for (let i = 0; i < members.length; i++) {
            const member = members[i]
            await Team.addMember(teamId, member.id)
          }
          return null
        },
        'db:seed:create-team-invitations': async (teamInvitations) => {
          return Promise.all(teamInvitations.map(TeamInvitation.create))
        },
        'db:seed:create-organizations': async (orgs) => {
          for (let i = 0; i < orgs.length; i++) {
            const org = orgs[i]
            await Organization.create(
              pick(['name', 'privacy'], org),
              org.ownerId
            )
          }
          return null
        },
        'db:seed:create-organization-teams': async ({
          orgId,
          teams,
          managerId,
        }) => {
          for (let i = 0; i < teams.length; i++) {
            const team = teams[i]
            await Organization.createOrgTeam(
              orgId,
              pick(['id', 'name', 'privacy'], team),
              managerId
            )
          }
          return null
        },
        'db:seed:add-organization-managers': async ({ orgId, managerIds }) => {
          for (let i = 0; i < managerIds.length; i++) {
            const managerId = managerIds[i]
            await Organization.addManager(orgId, managerId)
          }
          return null
        },
        'db:seed:create-organization-badges': async ({ orgId, badges }) => {
          for (let i = 0; i < badges.length; i++) {
            const badge = badges[i]
            await db('organization_badge').insert({
              organization_id: orgId,
              ...pick(['id', 'name', 'color'], badge),
            })
          }
          return null
        },
        'db:seed:assign-badge-to-users': async ({ badgeId, users }) => {
          for (let i = 0; i < users.length; i++) {
            const user = users[i]
            await Badge.assignUserBadge(badgeId, user.id, new Date())
          }
          return null
        },
      })
    },
  },
  screenshotOnRunFailure: false,
  env: {
    NEXTAUTH_SECRET: 'next-auth-cypress-secret',
  },
})
