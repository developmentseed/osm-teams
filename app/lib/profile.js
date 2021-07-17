const db = require('../db')
const { unpack, ValidationError, checkRequiredProperties, PropertyRequiredError } = require('../lib/utils')
const { map, has, propEq, anyPass, forEach, mergeRight, prop, assoc, pick, keys } = require('ramda')

/**
 * Given the profile type return the db table
 */
function getTableForProfileType (profileType) {
  let table
  switch (profileType) {
    case 'org': {
      table = 'organization'
      break
    }
    case 'team': {
      table = 'team'
      break
    }
    case 'user': {
      table = 'users'
      break
    }
  }
  return table
}

// Checks for enums
const ownerTypeValid = anyPass([
  propEq('ownerType', 'user'),
  propEq('ownerType', 'team'),
  propEq('ownerType', 'org')
])

const profileTypeValid = anyPass([
  propEq('profileType', 'user'),
  propEq('profileType', 'team'),
  propEq('profileType', 'org')
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
  checkRequiredProperties(['name', 'ownerId', 'ownerType', 'profileType'], attribute)

  if (!ownerTypeValid(attribute)) {
    throw new ValidationError('ownerType should be one of "user", "team" or "org"')
  }

  if (!profileTypeValid(attribute)) {
    throw new ValidationError('profileType should be one of "user", "team" or "org"')
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
    profileType,
    ...rest
  }) => ({
    [`owner_${ownerType}`]: ownerId,
    'profile_type': profileType,
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
 * @param {string} profileType Type of profile we are inserting to
 * @param {integer} id ID of profile for which we are setting the attributes
 */
async function setProfile (attributeValues, profileType, id) {
  attributeValues = [].concat(attributeValues)

  if (!profileType) {
    throw new PropertyRequiredError('profileType')
  }

  if (!id) {
    throw new PropertyRequiredError('id')
  }

  if (!profileTypeValid({ profileType })) {
    throw new ValidationError('profileType should be one of "user", "team" or "org"')
  }

  const conn = await db()
  const currentProfile = await getProfile(profileType, id)
  let tags = prop('tags', currentProfile)

  // Pick tags that are still in the database
  const tagsInDB = await conn('profile_keys').select('id').whereIn('id', keys(tags))

  tags = pick(map(prop('id'), tagsInDB), tags)

  // Add the attribute values
  tags = attributeValues.reduce(
    (acc, curr) => mergeRight(acc, { [curr['key_id']]: curr['value'] }),
    tags
  )

  const table = getTableForProfileType(profileType)

  return conn(table)
    .update({ profile: assoc('tags', tags, currentProfile), updated_at: conn.fn.now() })
    .where('id', id)
}

/**
 * Get a user's profile
 *
 * @param {string} profileType Type of profile we are getting from to
 * @param {integer} id ID of profile for which we are getting the attributers
 * @returns
 */
async function getProfile (profileType, id) {
  if (!profileType) {
    throw new PropertyRequiredError('profileType')
  }
  if (!id) {
    throw new PropertyRequiredError('id')
  }

  if (!profileTypeValid({ profileType })) {
    throw new ValidationError('profileType should be one of "user", "team" or "org"')
  }

  const table = getTableForProfileType(profileType)

  const conn = await db()
  return unpack(conn(table).select('profile').where('id', id))
    .then(prop('profile'))
}

module.exports = {
  addProfileKeys,
  modifyProfileKey,
  deleteProfileKey,
  getProfileKey,
  getProfileKeysForOwner,
  setProfile,
  getProfile
}
