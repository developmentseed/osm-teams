const profile = require('../lib/profile')
const team = require('../lib/team')
const org = require('../lib/organization')
const { concat, pick, prop, assoc } = require('ramda')
const { ValidationError, PropertyRequiredError } = require('../lib/utils')

/**
 * Gets a user profile in a team
 */
async function getUserTeamProfile (req, reply) {
  const { osmId, id: teamId } = req.params
  const { user_id: requesterId } = reply.locals

  if (!osmId) {
    reply.boom.badRequest('osmId is required parameter')
  }

  try {
    let visibleKeys = []
    let teamKeys = []
    let orgKeys = []
    let requesterIsMemberOfTeam = false
    let requesterIsMemberOfOrg = false

    // Get team attributes
    teamKeys = await profile.getProfileKeysForOwner('team', teamId, 'user')
    requesterIsMemberOfTeam = await team.isMember(teamId, requesterId) // Is the requester part of this team?

    // Get org keys & visibility
    const associatedOrg = await team.associatedOrg(teamId) // Is the team part of an organization?
    if (associatedOrg) {
      orgKeys = await profile.getProfileKeysForOwner('org', associatedOrg, 'user')
      requesterIsMemberOfOrg = org.isMember(associatedOrg, requesterId)
    }

    // Get visibile keys
    const allKeys = concat(teamKeys, orgKeys)
    allKeys.forEach((key) => {
      const { visibility } = key
      switch (visibility) {
        case 'public': {
          visibleKeys.push(key)
          break
        }
        case 'team': {
          if (requesterIsMemberOfTeam) {
            visibleKeys.push(key)
          }
          break
        }
        case 'org': {
          if (requesterIsMemberOfOrg) {
            visibleKeys.push(key)
          }
          break
        }
      }
    })

    // Get values for keys
    const values = await profile.getProfile('user', osmId)
    if (!values) {
      reply.sendStatus(404)
    }
    const tags = prop('tags', values)
    const visibleKeyIds = visibleKeys.map(prop('id'))
    const visibleValues = pick(visibleKeyIds, tags)

    const keysToSend = visibleKeys.map(key => {
      return assoc('value', visibleValues[key.id], key)
    })

    reply.send(keysToSend)
  } catch (err) {
    console.error(err)
    return reply.boom.badImplementation()
  }
}

/**
 * Create keys for profile
 */
function createProfileKeys (ownerType, profileType) {
  return async function (req, reply) {
    const { id } = req.params
    const { body } = req

    if (!id) {
      reply.boom.badRequest('id is required parameter')
    }

    try {
      const attributesToAdd = body.map(({ name, description, required, visibility }) => {
        return {
          name,
          description,
          required,
          visibility,
          profileType
        }
      })

      const data = await profile.addProfileKeys(attributesToAdd, ownerType, id)
      reply.send(data)
    } catch (err) {
      console.error(err)
      if (err instanceof ValidationError || err instanceof PropertyRequiredError) {
        reply.boom.badRequest(err)
      }
      return reply.boom.badImplementation()
    }
  }
}

/**
 * Modify profile key
 */
async function modifyProfileKey (req, reply) {
  const { id } = req.params
  const { body } = req

  if (!id) {
    reply.boom.badRequest('id is required parameter')
  }

  try {
    await profile.modifyProfileKey(id, body)
    reply.sendStatus(200)
  } catch (err) {
    console.error(err)
    if (err instanceof ValidationError || err instanceof PropertyRequiredError) {
      reply.boom.badRequest(err)
    }
    return reply.boom.badImplementation()
  }
}

/**
 * Delete profile key
 */
async function deleteProfileKey (req, reply) {
  const { id } = req.params

  if (!id) {
    reply.boom.badRequest('id is required parameter')
  }

  try {
    await profile.deleteProfileKey(id)
    reply.sendStatus(200)
  } catch (err) {
    console.error(err)
    if (err instanceof ValidationError || err instanceof PropertyRequiredError) {
      reply.boom.badRequest(err)
    }
    return reply.boom.badImplementation()
  }
}

/**
 * Get the keys set by an owner
 */
function getProfileKeys (ownerType, profileType) {
  return async function (req, reply) {
    const { id } = req.params

    if (!id) {
      reply.boom.badRequest('id is required parameter')
    }

    try {
      const data = await profile.getProfileKeysForOwner(ownerType, id, profileType)
      reply.send(data)
    } catch (err) {
      console.error(err)
      if (err instanceof ValidationError || err instanceof PropertyRequiredError) {
        reply.boom.badRequest(err)
      }
      return reply.boom.badImplementation()
    }
  }
}

/**
 * Given a profileType, return a req, reply function
 * for setting a profile
 *
 * @param {string} profileType - 'user', 'org', 'team'
 */
function setProfile (profileType) {
  return async function (req, reply) {
    const { id } = req.params
    const { body } = req

    if (!id) {
      reply.boom.badRequest('id is required parameter')
    }

    try {
      await profile.setProfile(body, profileType, id)
      reply.sendStatus(200)
    } catch (err) {
      console.error(err)
      return reply.boom.badImplementation()
    }
  }
}

/**
 * Get a user's profile
 */
async function getMyProfile (req, reply) {
  const { user_id } = reply.locals
  try {
    const data = await profile.getProfile('user', user_id)
    reply.send(data)
  } catch (err) {
    console.error(err)
    return reply.boom.badImplementation()
  }
}

async function setMyProfile (req, reply) {
  const { user_id } = reply.locals
  const { body } = req
  try {
    await profile.setProfile(body, 'user', user_id)
    reply.sendStatus((200))
  } catch (err) {
    console.error(err)
    return reply.boom.badImplementation()
  }
}

module.exports = {
  getUserTeamProfile,
  createProfileKeys,
  modifyProfileKey,
  deleteProfileKey,
  getProfileKeys,
  getMyProfile,
  setMyProfile,
  setProfile
}
