const { defineConfig } = require('cypress')
const db = require('./src/lib/db')
const Team = require('./src/models/team')
const Organization = require('./src/models/organization')
const TeamInvitation = require('./src/models/team-invitation')
const { pick } = require('ramda')

const user1 = {
  id: 1,
}

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
          return null
        },
        'db:seed': async () => {
          // Add teams in series
          await Team.create(
            {
              name: 'Team 1',
            },
            user1.id
          )
          await Team.create(
            {
              name: 'Team 2',
              privacy: 'private',
            },
            user1.id
          )
          return null
        },
        'db:seed:teams': async ({ teams, moderatorId }) => {
          let createdTeams = []
          for (let i = 0; i < teams.length; i++) {
            const team = teams[i]
            createdTeams.push(await Team.create(team, moderatorId))
          }
          return createdTeams
        },
        'db:seed:add-team-member': async ({ teams, memberId }) => {
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
        'db:seed:team-invitations': async (teamInvitations) => {
          return Promise.all(teamInvitations.map(TeamInvitation.create))
        },
        'db:seed:add-organizations': async (orgs) => {
          for (let i = 0; i < orgs.length; i++) {
            const org = orgs[i]
            await Organization.create(
              pick(['name', 'privacy'], org),
              org.ownerId
            )
          }
          return null
        },
        'db:seed:add-organization-teams': async ({
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
      })
    },
  },
  screenshotOnRunFailure: false,
  env: {
    NEXTAUTH_SECRET: 'next-auth-cypress-secret',
  },
})
