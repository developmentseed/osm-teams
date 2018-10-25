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
  const [data] = await team.create({ name: 'map team' })
  t.truthy(data)
  t.true(data.name === 'map team')
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
  const [data] = await team.create({ name: 'poi team' })
  const [updated] = await team.update(data.id, { name: 'road team' })
  t.true(updated.name === 'road team')
})

test('destroy a team', async (t) => {
  const [data] = await team.create({ name: 'poi team' })
  await team.destroy(data.id)
  const [notfound] = await team.get(data.id)
  t.falsy(notfound)
})

test('get a team', async (t) => {
  const [created] = await team.create({ name: 'boundary team' })
  const [data] = await team.get(created.id)
  t.truthy(data)
  t.true(data.name === 'boundary team')
})
