const path = require('path')

const migrationsDirectory = path.join(
  __dirname,
  '..',
  'db',
  'migrations'
)

async function resetDb (db) {
  console.log('Dropping tables...')
  const pgres = await db.raw(`
      SELECT
          'drop table "' || tablename || '" cascade;' AS drop
      FROM
          pg_tables
      WHERE
          schemaname = 'public'
          AND tablename != 'spatial_ref_sys'
  `)

  for (const r of pgres.rows) {
    await db.raw(r.drop)
  }

  console.log('Migrating...')
  await db.migrate.latest({ directory: migrationsDirectory })
}

module.exports = {
  resetDb
}
