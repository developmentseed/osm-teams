exports.up = async function (knex) {
  await knex.schema.alterTable('organization', (table) => {
    table.json('privacy_policy')
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('organization', (table) => {
    table.dropColumn('privacy_policy')
  })
}
