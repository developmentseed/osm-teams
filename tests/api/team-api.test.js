const test = require('ava')
const { any } = require('ramda')
const { resetDb, disconnectDb } = require('../utils/db-helpers')
const createAgent = require('../utils/create-agent')

let user1Agent
let user1HttpAgent
test.before(async () => {
  await resetDb()
  user1Agent = await createAgent({ id: 1 })
  user1HttpAgent = await createAgent({ id: 1, http: true })
})

test.after.always(disconnectDb)

test('create a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'road team 1' })
    .expect(200)

  t.is(res.body.name, 'road team 1')
})

test('team requires name column', async (t) => {
  let res = await user1Agent.post('/api/teams').send({}).expect(400)
  t.is(res.body.message, 'data.name property is required')
})

test('update a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'map team 1' })
    .expect(200)

  t.is(res.body.name, 'map team 1')

  let updated = await user1Agent
    .put(`/api/teams/${res.body.id}`)
    .send({ name: 'poi team 1' })
    .expect(200)

  t.is(updated.body.name, 'poi team 1')
})

test('destroy a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'map team 2' })
    .expect(200)

  t.is(res.body.name, 'map team 2')

  await user1Agent.delete(`/api/teams/${res.body.id}`).expect(200)
})

test('team.editing_policy must be a valid url', async (t) => {
  let validUrlRes = await user1Agent.post('/api/teams').send({
    name: 'road team 200',
    editing_policy: 'https://roadteam.com/policy',
  })
  t.is(validUrlRes.status, 200)

  let errorRes = await user1Agent
    .post('/api/teams')
    .send({ name: 'road team 400', editing_policy: 'nope' })
  t.is(errorRes.body.message, 'editing_policy must be a valid url')
  t.is(errorRes.status, 400)
})

test('get a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'map team 3' })
    .expect(200)

  t.is(res.body.name, 'map team 3')

  let team = await user1Agent.get(`/api/teams/${res.body.id}`).expect(200)

  t.is(team.body.id, res.body.id)
  t.is(team.body.name, res.body.name)
})

test('get team list', async (t) => {
  await user1Agent.post('/api/teams').send({ name: 'map team 5' }).expect(200)

  let teams = await user1Agent.get(`/api/teams`).expect(200)

  t.true(teams.body.length > 0)
  teams.body.forEach((item) => {
    t.truthy(item.name)
    t.truthy(item.id)
    t.truthy(item.members.length)
    t.truthy(item.moderators.length)
  })
})

test('add member to team', async (t) => {
  let team = await user1Agent
    .post('/api/teams')
    .send({ name: 'map team 6' })
    .expect(200)

  await user1Agent.put(`/api/teams/add/${team.body.id}/1`).expect(200)

  let updatedTeam = await user1Agent
    .get(`/api/teams/${team.body.id}/members`)
    .expect(200)

  t.is(updatedTeam.body.teamId, team.body.id)
  t.is(updatedTeam.body.members.length, 1)
  t.is(updatedTeam.body.members[0].id, 1)
})

test('remove member from team', async (t) => {
  let team = await user1Agent
    .post('/api/teams')
    .send({ name: 'map team 7' })
    .expect(200)
  const { id: teamId } = team.body
  await user1Agent.put(`/api/teams/add/${teamId}/1`).expect(200)
  // add a second member, because osm_id 1 is the moderator by default
  const osmIdToCheck = 2
  await user1Agent.put(`/api/teams/add/${teamId}/${osmIdToCheck}`).expect(200)
  await user1Agent
    .put(`/api/teams/remove/${teamId}/${osmIdToCheck}`)
    .expect(200)
  let updated = await user1Agent.get(`/api/teams/${teamId}/members`).expect(200)
  t.is(updated.body.teamId, teamId)
  const { members } = updated.body
  t.is(members.length, 1)
  t.false(members[0].osm_id === osmIdToCheck)
})

test('updated members in team', async (t) => {
  let team = await user1Agent
    .post('/api/teams')
    .send({ name: 'map team 8' })
    .expect(200)

  await user1Agent
    .patch(`/api/teams/${team.body.id}/members`)
    .send({ add: [1, 2, 3] })
    .expect(200)

  let updated = await user1Agent
    .get(`/api/teams/${team.body.id}/members`)
    .expect(200)

  t.is(updated.body.teamId, team.body.id)
  t.is(updated.body.members.length, 3)
})

test('get list of teams by osm id', async (t) => {
  await user1Agent
    .post('/api/teams')
    .send({ name: 'get list of teams by osm id' })
    .expect(200)

  let teams = await user1Agent.get(`/api/teams?osmId=1`).expect(200)

  t.true(teams.body.length > 0)
})

test('get list of teams by bbox', async (t) => {
  await user1Agent
    .post('/api/teams')
    .send({
      name: 'team with location',
      location: `{
    "type": "Point",
    "coordinates": [0, 0]
  }`,
    })
    .expect(200)

  let teams = await user1Agent.get(`/api/teams?bbox=-1,-1,1,1`).expect(200)

  t.true(teams.body.length > 0)
})

test('assign moderator to team', async (t) => {
  const teamName = 'map team ♾♾'
  let team = await user1Agent
    .post('/api/teams')
    .send({ name: teamName })
    .expect(200)
  const osmIdToAdd = 2
  await user1Agent
    .put(`/api/teams/add/${team.body.id}/${osmIdToAdd}`)
    .expect(200)
  const { id: teamId } = team.body
  await user1Agent
    .put(`/api/teams/${teamId}/assignModerator/${osmIdToAdd}`)
    .expect(200)
  team = await user1Agent.get(`/api/teams/${teamId}/members`).expect(200)
  const { moderators } = team.body
  t.is(team.body.teamId, teamId)
  const matchOsmIdAssigned = (data) => data.osm_id === osmIdToAdd
  t.true(any(matchOsmIdAssigned, moderators))
})

test('remove moderator from team', async (t) => {
  const teamName = 'map team ♾+1'
  const osmId = 2
  let team = await user1Agent
    .post('/api/teams')
    .send({ name: teamName })
    .expect(200)
  const { id: teamId } = team.body
  await user1Agent.put(`/api/teams/add/${teamId}/${osmId}`).expect(200)
  await user1Agent
    .put(`/api/teams/${teamId}/assignModerator/${osmId}`)
    .expect(200)
  await user1Agent
    .put(`/api/teams/${teamId}/removeModerator/${osmId}`)
    .expect(200)
  const { body } = await user1Agent
    .get(`/api/teams/${teamId}/members`)
    .expect(200)
  t.is(body.teamId, teamId)
  const matchOsmIdAssigned = (data) => data.osm_id === osmId
  t.false(any(matchOsmIdAssigned, body.moderators))
})

test('get my teams list', async (t) => {
  // Clear database
  await resetDb()

  // Create team1 with user1
  await user1Agent.post('/api/teams').send({ name: 'Team 1' }).expect(200)

  // Create team2 with user1
  const team2 = await user1Agent
    .post('/api/teams')
    .send({ name: 'Team 2' })
    .expect(200)

  // Get team2 id
  const { id: team2Id } = team2.body

  // Make user2 moderator of team2
  await user1Agent.put(`/api/teams/add/${team2Id}/2`).expect(200)
  await user1Agent.put(`/api/teams/${team2Id}/assignModerator/2`).expect(200)

  // Remove user1 as moderator from team 2
  await user1Agent.put(`/api/teams/${team2Id}/removeModerator/1`).expect(200)

  // user1 should be still be a member of both teams
  const {
    body: {
      pagination: { total },
      data: teams,
    },
  } = await user1Agent.get(`/api/my/teams`).expect(200)

  t.is(total, 2)
  t.is(teams[0].name, 'Team 1')
  t.is(teams[1].name, 'Team 2')

  const httpApiResponse = await user1HttpAgent.get(`/api/my/teams`).expect(200)

  // Has to be the same
  t.deepEqual(httpApiResponse.body.data, teams)
})
