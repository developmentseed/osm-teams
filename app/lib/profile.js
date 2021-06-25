const db = require('../db')
const { unpack, ValidationError, checkRequiredProperties } = require('../lib/utils')
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
 * @param {Object[]} attributes
 * @param {string} attributes[].name Name of the attribute
 * @param {string} attributes[].description Description of the attribute
 * @param {integer} attributes[].ownerId iD in owner, user or team tables
 * @param {string} attributes[].ownerType enum: 'owner', 'user', 'team'
 * @param {boolean} attributes[].required whether this attribute is required to be filled
 * @param {enum} attributes[].visibility enum: 'owner', 'user', 'team'
 */
async function addProfileKey (attributes) {
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
 * @param {integer} id id of key to delete
 */
async function deleteProfileKey (id) {
  const conn = await db()
  return conn('profile_keys').where('id', id).delete()
}

/**
 * @param {integer} id id of key to get
 * @returns ProfileAttribute
 */
async function getProfileKey (id) {
  const conn = await db()
  return unpack(conn('profile_keys').where('id', id))
}

/**
 * @param {string} ownerType 'user' | 'org' | 'team'
 * @param {*} ownerId id of owner
 */
async function getProfileKeysForOwner (ownerType, ownerId) {
  if (!ownerTypeValid({ ownerType })) {
    throw new Error('ownerType must be one of "user", "org" or "team"')
  }
  const conn = await db()
  return conn('profile_keys').where({
    [`owner_${ownerType}`]: ownerId
  })
}
module.exports = {
  addProfileKey,
  deleteProfileKey,
  getProfileKey,
  getProfileKeysForOwner
}
