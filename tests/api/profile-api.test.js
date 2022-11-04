const test = require('ava')
const sinon = require('sinon')

const db = require('../../lib/db')
const team = require('../../app/lib/team')
const org = require('../../app/lib/organization')
const permissions = require('../../app/manage/permissions')
const profile = require('../../app/lib/profile')
const { resetDb } = require('../utils')

const { prop, concat, includes, propEq, find } = require('ramda')

let agent

test.before(async () => {
  const conn = await db()

  await resetDb(conn)

  // seed
  await conn('users').insert({ id: 1 })
  await conn('users').insert({ id: 2 })
  await conn('users').insert({ id: 3 })
  await conn('users').insert({ id: 4 })

  // Ensure authenticate middleware always goes through with user_id 1
  const middleware = function () {
    return function (req, res, next) {
      res.locals.user_id = 1
      return next()
    }
  }

  sinon.stub(permissions, 'can').callsFake(middleware)
  sinon.stub(permissions, 'authenticate').callsFake(middleware)
  sinon.stub(permissions, 'check').callsFake(middleware)

  agent = require('supertest').agent(await require('../../app/index')())
})

/**
 * Get a team user profile with correct visibility
 */
test('get team user profile within an org', async (t) => {
  // Create org and team
  const org1 = await org.create({ name: 'org user profile test' }, 1)
  const team1 = await org.createOrgTeam(
    org1.id,
    {
      name: 'org1 team test1',
    },
    1
  )

  // Add user 2 to team 1
  await team.addMember(team1.id, 2)

  const team2 = await org.createOrgTeam(
    org1.id,
    {
      name: 'org1 team test2',
    },
    2
  )

  // Add some profile keys
  const org1Keys = await profile.addProfileKeys(
    [
      { name: 'test org key 1', visibility: 'org', profileType: 'user' },
      { name: 'test org key 2', visibility: 'team', profileType: 'user' },
      { name: 'test org key 3', visibility: 'public', profileType: 'user' },
    ],
    'org',
    org1.id
  )

  const team1Keys = await profile.addProfileKeys(
    [
      { name: 'test same team key 1', visibility: 'org', profileType: 'user' },
      { name: 'test same team key 2', visibility: 'team', profileType: 'user' },
      {
        name: 'test same team key 3',
        visibility: 'public',
        profileType: 'user',
      },
    ],
    'team',
    team1.id
  )
  const team2Keys = await profile.addProfileKeys(
    [
      { name: 'test diff team key 1', visibility: 'org', profileType: 'user' },
      { name: 'test diff team key 2', visibility: 'team', profileType: 'user' },
      {
        name: 'test diff team key 3',
        visibility: 'public',
        profileType: 'user',
      },
    ],
    'team',
    team2.id
  )

  const keys = concat(org1Keys, concat(team1Keys, team2Keys))
  const values = keys.map((key) => ({
    key_id: key.id,
    value: key.name,
  }))

  // Await profile values for user 2
  await profile.setProfile(values, 'user', 2)

  /* user 1 gets the profile of user 2 from team1 (they are on the same team)
   We should get:
   - the team key that has org visibility
   - the team key that has team visibility
   - the team key that has public visibility
  */
  const res1 = await agent.get(`/api/profiles/teams/${team1.id}/2`).expect(200)
  t.is(Object.keys(res1.body).length, team1Keys.length)

  /* user 1 gets the profile of user 2 from team2 (they are on different teams)
   we should only get all 3 keys since user 1 is an owner of the org:
   - the team key that has org visibility
   - the team key that has team visibility
   - the team key that has public visibility
  */
  const res2 = await agent.get(`/api/profiles/teams/${team2.id}/2`).expect(200)
  t.is(Object.keys(res2.body).length, team2Keys.length)
})

test('create profile keys for org', async (t) => {
  const name = 'create profile keys for org'
  const org1 = await org.create({ name: 'create profile keys for org' }, 1)
  await agent
    .post(`/api/profiles/keys/organizations/${org1.id}`)
    .send([{ name, visibility: 'org' }])
    .expect(200)

  const keys = await profile.getProfileKeysForOwner('org', org1.id)
  const keyNames = keys.map(prop('name'))
  const keyProfileTypes = keys.map(prop('profile_type'))
  t.true(includes(name, keyNames))
  t.true(includes('org', keyProfileTypes))
})

test('create profile keys for org team', async (t) => {
  const name = 'create profile keys for org teams'
  const org1 = await org.create(
    { name: 'create profile keys for org teams' },
    1
  )
  await agent
    .post(`/api/profiles/keys/organizations/${org1.id}/teams`)
    .send([{ name, visibility: 'org' }])
    .expect(200)

  const keys = await profile.getProfileKeysForOwner('org', org1.id)
  const keyNames = keys.map(prop('name'))
  const keyProfileTypes = keys.map(prop('profile_type'))
  t.true(includes(name, keyNames))
  t.true(includes('team', keyProfileTypes))
})

test('create profile keys for org users', async (t) => {
  const name = 'create profile keys for org users'
  const org1 = await org.create(
    { name: 'create profile keys for org users' },
    1
  )
  await agent
    .post(`/api/profiles/keys/organizations/${org1.id}/users`)
    .send([{ name, visibility: 'org' }])
    .expect(200)

  const keys = await profile.getProfileKeysForOwner('org', org1.id)
  const keyNames = keys.map(prop('name'))
  const keyProfileTypes = keys.map(prop('profile_type'))
  t.true(includes(name, keyNames))
  t.true(includes('user', keyProfileTypes))
})

test('create profile keys for teams', async (t) => {
  const name = 'create profile keys for team'
  const team1 = await team.create({ name: 'create profile keys for team' }, 1)
  await agent
    .post(`/api/profiles/keys/teams/${team1.id}`)
    .send([{ name, visibility: 'team' }])
    .expect(200)

  const keys = await profile.getProfileKeysForOwner('team', team1.id)
  const keyNames = keys.map(prop('name'))
  const keyProfileTypes = keys.map(prop('profile_type'))
  t.true(includes(name, keyNames))
  t.true(includes('team', keyProfileTypes))
})

test('create profile keys for teams users', async (t) => {
  const name = 'create profile keys for team users'
  const team1 = await team.create(
    { name: 'create profile keys for team users' },
    1
  )
  await agent
    .post(`/api/profiles/keys/teams/${team1.id}/users`)
    .send([{ name, visibility: 'team' }])
    .expect(200)

  const keys = await profile.getProfileKeysForOwner('team', team1.id)
  const keyNames = keys.map(prop('name'))
  const keyProfileTypes = keys.map(prop('profile_type'))
  t.true(includes(name, keyNames))
  t.true(includes('user', keyProfileTypes))
})

test('set profile for user 1', async (t) => {
  const name = 'set profile for a user'
  const team1 = await team.create({ name: 'set profile for a user' }, 1)
  await agent
    .post(`/api/profiles/keys/teams/${team1.id}/users`)
    .send([{ name, visibility: 'team' }])
    .expect(200)

  const keys = await profile.getProfileKeysForOwner('team', team1.id, 'user')
  const keyId = find(propEq('name', name), keys).id

  await agent
    .post('/api/my/profiles')
    .send([{ key_id: keyId, value: 'success' }])
    .expect(200)

  const data = await profile.getProfile('user', 1)

  t.true(data.tags[keyId] === 'success')
})
