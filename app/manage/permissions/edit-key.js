const profile = require('../../../src/models/profile')
const organization = require('../../../src/models/organization')
const team = require('../../../src/models/team')
const R = require('ramda')

/**
 * key:edit
 *
 * Only the same owner of a key can edit it
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {Promise<boolean>} can the request go through?
 */
async function editKey(uid, { id }) {
  // user has to be authenticated
  if (!uid) return false

  const key = await profile.getProfileKey(id)

  let owners = []

  if (key.owner_user) {
    return uid.toString() === key.owner_user.toString()
  }

  if (key.owner_team) {
    owners = await team.getModerators(key.owner_team)
  }

  if (key.owner_org) {
    owners = await organization.getOwners(key.owner_org)
  }
  let osmIds = owners.map((owner) => R.prop('osm_id', owner).toString())
  return osmIds.includes(uid.toString())
}

module.exports = editKey
