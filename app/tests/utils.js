async function dropTables (db) {
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
}

module.exports = {
  dropTables
}
