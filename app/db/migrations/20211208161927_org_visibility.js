
exports.up = async (knex) => {
    return knex.schema.alterTable('organization', table => {
        table.enum('privacy', ['public', 'private', 'unlisted']).defaultTo('public')
    })
};

exports.down = async (knex) => {
    return knex.schema.alterTable('organization', table => {
        table.dropColumn('privacy')
    })
};
