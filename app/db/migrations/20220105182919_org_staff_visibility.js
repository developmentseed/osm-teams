const constraintName = 'profile_keys_visibility_check'

exports.up = async (knex) => {
  await knex.raw(
    `ALTER TABLE profile_keys DROP CONSTRAINT IF EXISTS ${constraintName};`
  )
  await knex.raw(
    `ALTER TABLE profile_keys ADD CONSTRAINT ${constraintName} CHECK (visibility = ANY (ARRAY['public'::text, 'team'::text, 'org'::text, 'org_staff'::text]))`
  )
}

exports.down = async (knex) => {
  await knex.raw(
    `ALTER TABLE profile_keys DROP CONSTRAINT IF EXISTS ${constraintName};`
  )
  await knex.raw(
    `ALTER TABLE profile_keys ADD CONSTRAINT ${constraintName} CHECK (visibility = ANY (ARRAY['public'::text, 'team'::text, 'org'::text]))`
  )
}
