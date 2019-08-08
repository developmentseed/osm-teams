const path = require('path')
const test = require('ava')
const sinon = require('sinon')

const db = require('../../db')
const team = require('../../lib/team')
const permissions = require('../../manage/permissions')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

let agent
test.before(async () => {
  const conn = await db()
  await conn.migrate.latest({ directory: migrationsDirectory })

  // seed
  await conn('users').insert({ id: 1 })
  await conn('users').insert({ id: 2 })
  await conn('users').insert({ id: 3 })
  await conn('users').insert({ id: 4 })

  // Ensure authenticate middleware always goes through
  sinon.stub(permissions, 'can').callsFake(
    function () {
      return function (req, res, next) {
        res.locals.user_id = 1
        return next()
      }
    }
  )

  // Ensure that resolveMemberNames never calls osm
  sinon.stub(team, 'resolveMemberNames').callsFake((ids) => {
    return ids.map(id => ({ id, name: 'fake name' }))
  })

  agent = require('supertest').agent(await require('../../index')())
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('create a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'road team 1' })
    .expect(200)

  t.is(res.body.name, 'road team 1')
})

test('update a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'map team 1' })
    .expect(200)

  t.is(res.body.name, 'map team 1')

  let updated = await agent.put(`/api/teams/${res.body.id}`)
    .send({ name: 'poi team 1' })
    .expect(200)

  t.is(updated.body.name, 'poi team 1')
})

test('destroy a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'map team 2' })
    .expect(200)

  t.is(res.body.name, 'map team 2')

  await agent.delete(`/api/teams/${res.body.id}`)
    .expect(200)
})

test('get a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'map team 3' })
    .expect(200)

  t.is(res.body.name, 'map team 3')

  let team = await agent.get(`/api/teams/${res.body.id}`)
    .expect(200)

  t.is(team.body.id, res.body.id)
  t.is(team.body.name, res.body.name)
  t.is(team.body.members.length, 1)
})

test('get team list', async t => {
  await agent.post('/api/teams')
    .send({ name: 'map team 5' })
    .expect(200)

  let teams = await agent.get(`/api/teams`)
    .expect(200)

  t.true(teams.body.length > 0)
  teams.body.forEach(item => {
    t.truthy(item.name)
    t.truthy(item.id)
  })
})

test('add member to team', async t => {
  let team = await agent.post('/api/teams')
    .send({ name: 'map team 6' })
    .expect(200)

  await agent.put(`/api/teams/add/${team.body.id}/1`)
    .expect(200)

  let updated = await agent.get(`/api/teams/${team.body.id}`)
    .expect(200)

  t.is(updated.body.id, team.body.id)
  t.is(updated.body.members.length, 1)
  t.is(updated.body.members[0].id, 1)
})

test('remove member from team', async t => {
  let team = await agent.post('/api/teams')
    .send({ name: 'map team 7' })
    .expect(200)

  await agent.put(`/api/teams/add/${team.body.id}/1`)
    .expect(200)

  await agent.put(`/api/teams/remove/${team.body.id}/1`)
    .expect(200)

  let updated = await agent.get(`/api/teams/${team.body.id}`)
    .expect(200)

  t.is(updated.body.id, team.body.id)
  t.is(updated.body.members.length, 0)
})

test('updated members in team', async t => {
  let team = await agent.post('/api/teams')
    .send({ name: 'map team 8' })
    .expect(200)

  await agent.patch(`/api/teams/${team.body.id}/members`)
    .send({ add: [1, 2, 3] })
    .expect(200)

  let updated = await agent.get(`/api/teams/${team.body.id}`)
    .expect(200)

  t.is(updated.body.id, team.body.id)
  t.is(updated.body.members.length, 3)
})

test('get list of teams by osm id', async t => {
  let teams = await agent.get(`/api/teams?osmId=1`)
    .expect(200)

  t.true(teams.body.length > 0)
})

test('get list of teams by bbox', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'team with location', location: `{
    "type": "Point",
    "coordinates": [0, 0]
  }` })
    .expect(200)

  let teams = await agent.get(`/api/teams?bbox=-1,-1,1,1`)
    .expect(200)

  t.true(teams.body.length > 0)
})
