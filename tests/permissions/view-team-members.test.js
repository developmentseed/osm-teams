const test = require('ava')
const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')
const Team = require('../../src/models/team')

// Seed data
const user1 = { id: 1 }

// Helper variables
let publicAgent
let user1Agent
let publicTeam
let privateTeam

// Prepare test environment
test.before(async () => {
  await resetDb()

  // Create agents
  publicAgent = await createAgent()
  user1Agent = await createAgent(user1)

  // Create teams
  publicTeam = await Team.create({ name: 'public team' }, user1.id)
  privateTeam = await Team.create(
    { name: 'private team', privacy: 'private' },
    user1.id
  )
})

// Close db connection
test.after.always(disconnectDb)

test('public team members are visible to unauthenticated users', async (t) => {
  let res = await publicAgent.get(`/api/teams/${publicTeam.id}/members`)
  t.is(res.status, 200)
})

test('private team members are not visible to unauthenticated users', async (t) => {
  let res = await publicAgent.get(`/api/teams/${privateTeam.id}/members`)
  t.is(res.status, 401)
})

test('private team members are visible to team moderators', async (t) => {
  let res = await user1Agent.get(`/api/teams/${privateTeam.id}/members`)
  t.is(res.status, 200)
})
