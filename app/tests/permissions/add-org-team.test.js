const test = require('ava')
const db = require('../../db')
const path = require('path')
const { initializeContext, createOrg, destroyOrg } = require('./initialization')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

test.before(initializeContext)

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

// set up and tear down an org for each test
test.beforeEach(createOrg)
test.afterEach(destroyOrg)

/**
 * An org owner can create a team
 * We create an org with the user100 user
 * We check that user100 can create a team in the org
 *
 */
test('org owner can create a team', async t => {
  const teamName = 'org owner can create a team - team'

  let res2 = await t.context.agent.post(`/api/organizations/${t.context.org.id}/teams`)
    .set('Authorization', 'Bearer user100')
    .send({ name: teamName })

  t.is(res2.status, 200)
})

/**
 * An org manager can create a team
 * We create an org with the user100 user and assign user101
 * as a manager. We check that user101 can create a team in the org
 *
 */
test('org manager can create a team', async t => {
  const teamName = 'org manager can create a team - team'

  // We create a manager role for user 101
  await t.context.agent.put(`/api/organizations/${t.context.org.id}/addManager/101`)
    .set('Authorization', 'Bearer user100')
    .expect(200)

  let res2 = await t.context.agent.post(`/api/organizations/${t.context.org.id}/teams`)
    .set('Authorization', 'Bearer user101')
    .send({ name: teamName })

  t.is(res2.status, 200)
})

/**
 * An non-org manager cannot create a team
 * We create an org with the user100 user and check that a non
 *
 */
test('non-org manager cannot create a team', async t => {
  const teamName = 'non-org manager cannot create a team - team'

  let res2 = await t.context.agent.post(`/api/organizations/${t.context.org.id}/teams`)
    .set('Authorization', 'Bearer user101')
    .send({ name: teamName })

  t.is(res2.status, 401)
})
