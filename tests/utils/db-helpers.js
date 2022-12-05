const db = require('../../src/lib/db')

async function resetDb() {
  await db.raw('TRUNCATE TABLE organization RESTART IDENTITY CASCADE')
  await db.raw('TRUNCATE TABLE team RESTART IDENTITY CASCADE')
  await db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE')
}

async function disconnectDb() {
  return db.destroy()
}

module.exports = {
  resetDb,
  disconnectDb,
}
