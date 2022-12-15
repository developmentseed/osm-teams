exports.up = function (knex) {
  return knex.schema.alterTable('team', function (table) {
    table.dropUnique('hashtag')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('team', function (table) {
    table.unique('hashtag')
  })
}
