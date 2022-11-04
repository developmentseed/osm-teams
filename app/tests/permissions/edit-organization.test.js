const test = require('ava')
const db = require('../../db')
const path = require('path')
const { initializeContext, createOrg, destroyOrg } = require('./initialization')

const { migrationsDirectory } = require('../utils')

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
 * An org owner can update the org
 * We create an org with the user100 and then
 * see if they can edit the organization
 *
 */
test('org owner can update an org', async (t) => {
  const orgName2 = 'org owner can update an org - org 2'
  const res2 = await t.context.agent
    .put(`/api/organizations/${t.context.org.id}`)
    .set('Authorization', `Bearer user100`)
    .send({ name: orgName2 })

  t.is(res2.status, 200)
})

/**
 * An org manager cannot update the org
 * We now add a manager and see if they can edit the organization
 *
 */
test('org manager cannot update an org', async (t) => {
  const orgName2 = 'org manager cannot update an org - org 2'

  // We create a manager role for user 101
  await t.context.agent
    .post(`/api/organizations/${t.context.org.id}/addManager/101`)
    .set('Authorization', `Bearer user100`)
    .expect(200)

  const res3 = await t.context.agent
    .put(`/api/organizations/${t.context.org.id}`)
    .set('Authorization', `Bearer user101`)
    .send({ name: orgName2 })

  t.is(res3.status, 401)
})

/**
 * regular user cannot update the org
 * We create an org and see if a user without a role can update it
 *
 */
test('no-role user cannot update an org', async (t) => {
  const orgName2 = 'no-role user cannot update an org - org 2'

  const res2 = await t.context.agent
    .put(`/api/organizations/${t.context.org.id}`)
    .set('Authorization', `Bearer user101`)
    .send({ name: orgName2 })

  t.is(res2.status, 401)
})
