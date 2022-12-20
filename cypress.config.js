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
        'db:seed:team-invitations': async (teamInvitations) => {
          return Promise.all(teamInvitations.map(TeamInvitation.create))
        },
        'db:seed:organizations': async (orgs) => {
          return Promise.all(
            orgs.map((org) =>
              Organization.create(pick(['name', 'privacy'], org), org.ownerId)
            )
          )
        },
        'db:seed:organization-teams': async ({ orgId, teams, managerId }) => {
          return Promise.all(
            teams.map((team) =>
              Organization.createOrgTeam(orgId, pick(['name'], team), managerId)
            )
          )
        },
      })
    },
  },
  screenshotOnRunFailure: false,
  env: {
    NEXTAUTH_SECRET: 'next-auth-cypress-secret',
  },
})
