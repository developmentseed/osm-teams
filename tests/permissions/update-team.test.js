const test = require('ava')
const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')

let user1Agent
let user2Agent
let user3Agent
test.before(async () => {
  await resetDb()
  user1Agent = await createAgent({ id: 1 })
  user2Agent = await createAgent({ id: 2 })
  user3Agent = await createAgent({ id: 3 })
})
test.after.always(disconnectDb)

test('a team moderator can update a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'road team 1' })
    .expect(200)

  let res2 = await user1Agent
    .put(`/api/teams/${res.body.id}`)
    .send({ name: 'building team 1' })

  t.is(res2.status, 200)
})

test('a non-team moderator cannot update a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'road team 2' })
    .expect(200)

  let res2 = await user2Agent
    .put(`/api/teams/${res.body.id}`)
    .send({ name: 'building team 2' })

  t.is(res2.status, 401)
})

test('an org team cannot be updated by non-org user', async (t) => {
  // Let's create an organization, user1 is the owner
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'org team cannot be updated by non-org user' })
    .expect(200)

  // Let's set user2 to be a manager of this organization and create a
  // team in the organization
  await user1Agent
    .put(`/api/organizations/${res.body.id}/addManager/2`)
    .expect(200)

  const res2 = await user2Agent
    .post(`/api/organizations/${res.body.id}/teams`)
    .send({ name: 'org team cannot be updated by non-org user - team' })
    .expect(200)

  // Use a different user from 1 or 2 to update the team
  const res3 = await user3Agent
    .put(`/api/teams/${res2.body.id}`)
    .send({ name: 'org team cannot be updated by non-org user - team2' })

  t.is(res3.status, 401)
})

test('an org team can be updated by the the org manager', async (t) => {
  // Let's create an organization, user1 is the owner
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'org manager can update team' })
    .expect(200)

  // Let's set user2 to be a manager of this organization and create a
  // team in the organization
  await user1Agent
    .put(`/api/organizations/${res.body.id}/addManager/2`)
    .expect(200)

  const res2 = await user2Agent
    .post(`/api/organizations/${res.body.id}/teams`)
    .send({ name: 'org team can be updated by manager - team' })
    .expect(200)

  // Use the manager to update the team
  const res3 = await user2Agent
    .put(`/api/teams/${res2.body.id}`)
    .send({ name: 'org team can be updated by manager - team2' })

  t.is(res3.status, 200)
})

test('an org team can be updated by the owner of the org', async (t) => {
  // Let's create an organization, user1 is the owner
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'org owner can update team' })
    .expect(200)

  // Let's set user2 to be a manager of this organization and create a
  // team in the organization
  await user1Agent
    .put(`/api/organizations/${res.body.id}/addManager/2`)
    .expect(200)

  const res2 = await user2Agent
    .post(`/api/organizations/${res.body.id}/teams`)
    .send({ name: 'org team can be updated by owner - team' })
    .expect(200)

  // user2 is the moderator and manager, but user1 should be able
  // to edit this team
  const res3 = await user1Agent
    .put(`/api/teams/${res2.body.id}`)
    .send({ name: 'org team can be updated by owner - team2' })

  t.is(res3.status, 200)
})
