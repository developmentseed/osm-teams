const path = require('path')
const test = require('ava')
const sinon = require('sinon')

const db = require('../../db')
const team = require('../../lib/team')
const org = require('../../lib/organization')
const permissions = require('../../manage/permissions')
const profile = require('../../lib/profile')

const { concat } = require('ramda')

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

  agent = require('supertest').agent(await require('../../index')())
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

/**
 * Get a team user profile with correct visibility
 */
test('get team user profile within an org', async t => {
  // Create org and team
  const org1 = await org.create({ name: 'org user profile test' }, 1)
  const team1 = await org.createOrgTeam(org1.id, {
    name: 'org1 team test1'
  }, 1)

  // Add user 2 to team 1
  await team.addMember(team1.id, 2)

  const team2 = await org.createOrgTeam(org1.id, {
    name: 'org1 team test2'
  }, 2)

  // Add some profile keys
  const org1Keys = await profile.addProfileKeys([
    { name: 'test org key 1', ownerType: 'org', ownerId: org1.id, visibility: 'org' },
    { name: 'test org key 2', ownerType: 'org', ownerId: org1.id, visibility: 'team' },
    { name: 'test org key 3', ownerType: 'org', ownerId: org1.id, visibility: 'public' }
  ])

  const team1Keys = await profile.addProfileKeys([
    { name: 'test same team key 1', ownerType: 'team', ownerId: team1.id, visibility: 'org' },
    { name: 'test same team key 2', ownerType: 'team', ownerId: team1.id, visibility: 'team' },
    { name: 'test same team key 3', ownerType: 'team', ownerId: team1.id, visibility: 'public' }
  ])
  const team2Keys = await profile.addProfileKeys([
    { name: 'test diff team key 1', ownerType: 'team', ownerId: team2.id, visibility: 'org' },
    { name: 'test diff team key 2', ownerType: 'team', ownerId: team2.id, visibility: 'team' },
    { name: 'test diff team key 3', ownerType: 'team', ownerId: team2.id, visibility: 'public' }
  ])

  const keys = concat(org1Keys, concat(team1Keys, team2Keys))
  const values = keys.map(key => ({
    key_id: key.id,
    value: key.name
  }))

  // Await profile values for user 2
  await profile.setProfileValues(values, 2)

  /* user 1 gets the profile of user 2 from team1 (they are on the same team)
   We should get:
   - the org key that has org visibility
   - the org key that has team visibility
   - the org key that has public visibility
   - the team key that has org visibility
   - the team key that has team visibility
   - the team key that has public visibility
  */
  const res1 = await agent.get(`/api/profiles/teams/${team1.id}/2`).expect(200)
  t.is(res1.body.length, team1Keys.length + org1Keys.length)

  /* user 1 gets the profile of user 2 from team2 (they are on different teams)
   we should only get 4 keys:
   - the org key that has org visibility
   - the org key that has public visibility
   - the team key that has org visibility
   - the team key that has public visibility
  */
  const res2 = await agent.get(`/api/profiles/teams/${team2.id}/2`).expect(200)
  t.is(res2.body.length, 2)
})
