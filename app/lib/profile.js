const db = require('../db')
const { unpack, ValidationError, checkRequiredProperties, PropertyRequiredError } = require('../lib/utils')
const { has, propEq, anyPass, forEach } = require('ramda')

// Checks for enums
const ownerTypeValid = anyPass([
  propEq('ownerType', 'user'),
  propEq('ownerType', 'team'),
  propEq('ownerType', 'org')
])

const visibilityValid = anyPass([
  propEq('visibility', 'public'),
  propEq('visibility', 'team'),
  propEq('visibility', 'org')
])

/**
 * Checks validity of attribute
 *
 * @param {Object} attribute
 * @param {string} attribute.name Name of the attribute
 * @param {string} attribute.description Description of the attribute
 * @param {integer} attribute.ownerId iD in owner, user or team tables
 * @param {string} attribute.ownerType enum: 'owner', 'user', 'team'
 * @param {boolean} attribute.required whether this attribute is required to be filled
 * @param {enum} attribute.visibility enum: 'owner', 'user', 'team'
 */
function checkProfileKey (attribute) {
  checkRequiredProperties(['name', 'ownerId', 'ownerType'], attribute)

  if (!ownerTypeValid(attribute)) {
    throw new ValidationError('ownerType should be one of "user", "team" or "org"')
  }

  if (has('visibility', attribute) && !visibilityValid(attribute)) {
    throw new ValidationError('visibility should be one of "public", "team" or "org"')
  }
}

/**
 * Inserts attributes that can be added to a user profile
 *
 * @param {Object[]} attributes
 * @param {string} attributes[].name Name of the attribute
 * @param {string} attributes[].description Description of the attribute
 * @param {integer} attributes[].ownerId iD in owner, user or team tables
 * @param {string} attributes[].ownerType enum: 'owner', 'user', 'team'
 * @param {boolean} attributes[].required whether this attribute is required to be filled
 * @param {enum} attributes[].visibility enum: 'owner', 'user', 'team'
 */
async function addProfileKeys (attributes) {
  attributes = [].concat(attributes)

  // Run checks
  forEach(checkProfileKey, attributes)

  // Modify the columns for the database
  const toInsert = attributes.map(({
    ownerId,
    ownerType,
    ...rest
  }) => ({
    [`owner_${ownerType}`]: ownerId,
    ...rest
  }))

  const conn = await db()
  return conn('profile_keys').insert(toInsert).returning('*')
}

/**
 * Modify an attribute
 *
 * @param {integer} id id of key to modify
 * @param {string} attribute.description Description of the attribute
 * @param {boolean} attribute.required whether this attribute is required to be filled
 * @param {enum} attribute.visibility enum: 'owner', 'user', 'team'
 */
async function modifyProfileKey (id, attribute) {
  if (has('visibility', attribute) && !visibilityValid(attribute)) {
    throw new ValidationError('visibility should be one of "public", "team" or "org"')
  }

  const conn = await db()
  return conn('profile_keys').where('id', id).update(attribute)
}

/**
 * Delete an attribute
 *
 * @param {integer} id id of key to delete
 */
async function deleteProfileKey (id) {
  const conn = await db()
  return conn('profile_keys').where('id', id).delete()
}

/**
 * Get an attribute by its id
 *
 * @param {integer} id id of key to get
 * @returns ProfileAttribute
 */
async function getProfileKey (id) {
  const conn = await db()
  return unpack(conn('profile_keys').where('id', id))
}

/**
 * Get attributes created by an owner (user | org | team)
 *
 * @param {string} ownerType 'user' | 'org' | 'team'
 * @param {*} ownerId id of owner
 */
async function getProfileKeysForOwner (ownerType, ownerId) {
  if (!ownerTypeValid({ ownerType })) {
    throw new ValidationError('ownerType must be one of "user", "org" or "team"')
  }
  const conn = await db()
  return conn('profile_keys').where({
    [`owner_${ownerType}`]: ownerId
  })
}

/**
 * Upsert attribute values for user
 *
 * @param {Object[]} attributeValues values for profile
 * @param {integer} attributeValues[].key_id Key in profile_keys table
 * @param {string} attributeValues[].value Value for key
 * @param {integer} user_id User for which we are setting the key
 */
async function setProfileValues (attributeValues, user_id) {
  attributeValues = [].concat(attributeValues)

  const conn = await db()

  // Modify the columns for the database
  const toInsert = attributeValues.map(({
    key_id,
    value
  }) => ({
    key_id,
    user_id,
    value,
    updated_at: conn.fn.now()
  }))

  return conn('profile_values').insert(toInsert)
    .onConflict(['user_id', 'key_id'])
    .merge()
}

/**
 * Get the values for a set of attributes
 *
 * @param {integer[]} keys key ids
 * @param {integer?} user_id filter by user
 * @returns
 */
async function getProfileValues (keys, user_id) {
  keys = [].concat(keys)
  const conn = await db()

  let query = conn('profile_values')
    .join('profile_keys', 'profile_keys.id', 'profile_values.key_id')
    .whereIn('key_id', keys)

  if (user_id) {
    query = query.where('user_id', user_id)
  }

  return query
}

/**
 * Get a user's profile
 *
 * @param {integer} user_id
 * @returns
 */
async function getProfile (user_id) {
  if (!user_id) {
    throw new PropertyRequiredError('user_id')
  }

  const conn = await db()
  return conn('profile_values')
    .join('profile_keys', 'profile_keys.id', 'profile_values.key_id')
    .where('profile_values.user_id', user_id)
}

module.exports = {
  addProfileKeys,
  modifyProfileKey,
  deleteProfileKey,
  getProfileKey,
  getProfileKeysForOwner,
  setProfileValues,
  getProfileValues,
  getProfile
}
