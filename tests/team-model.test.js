const path = require('path')
const test = require('ava')
const db = require('../db')
const team = require('../lib/team')

const migrationsDirectory = path.join(__dirname, '..', 'db', 'migrations')

test.before(async () => {
  await db.migrate.latest({ directory: migrationsDirectory })
})

test.after.always(async () => {
  await db.migrate.rollback({ directory: migrationsDirectory })
  db.destroy()
})

test('create a team', async (t) => {
  const [data] = await team.create({ name: 'map team 1' })
  t.truthy(data)
  t.true(data.name === 'map team 1')
})

test('list teams', async (t) => {
  const list = await team.list()
  t.true(Array.isArray(list) && list.length > 0)
  list.forEach((item) => {
    t.truthy(item.name)
    t.truthy(item.id)
  })
})

test('update a team', async (t) => {
  const [data] = await team.create({ name: 'poi team 1' })
  const [updated] = await team.update(data.id, { name: 'road team 1' })
  t.true(updated.name === 'road team 1')
})

test('destroy a team', async (t) => {
  const [data] = await team.create({ name: 'poi team 2' })
  await team.destroy(data.id)
  const [notfound] = await team.get(data.id)
  t.falsy(notfound)
})

test('get a team', async (t) => {
  const [created] = await team.create({ name: 'boundary team 1' })
  const [data] = await team.get(created.id)
  t.truthy(data)
  t.true(data.name === 'boundary team 1')
})
