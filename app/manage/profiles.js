const profile = require('../../src/models/profile')
const team = require('../../src/models/team')
const org = require('../../src/models/organization')
const { pick, prop, assoc } = require('ramda')
const { ValidationError, PropertyRequiredError } = require('../lib/utils')
const Boom = require('@hapi/boom')

/**
 * Gets a user profile in an org
 */
async function getUserOrgProfile(req, reply) {
  const { osmId, id: orgId } = req.params
  const { user_id: requesterId } = req.session

  if (!osmId) {
    throw Boom.badRequest('osmId is required parameter')
  }

  const values = await profile.getProfile('user', osmId)
  const tags = prop('tags', values)
  if (!values || !tags) {
    throw Boom.notFound()
  }

  let visibleKeys = []
  let orgKeys = []
  let requesterIsMemberOfOrg = false
  let requesterIsManagerOfOrg = false
  let requesterIsOwnerOfOrg = false

  // Get org keys & visibility
  orgKeys = await profile.getProfileKeysForOwner('org', orgId, 'user')

  if (requesterId === osmId) {
    const allIds = orgKeys.map(prop('id'))
    const allValues = pick(allIds, tags)
    const keysToSend = orgKeys.map((key) => {
      return assoc('value', allValues[key.id], key)
    })
    return reply.send(keysToSend)
  } else {
    requesterIsMemberOfOrg = await org.isMember(orgId, requesterId)
    requesterIsManagerOfOrg = await org.isManager(orgId, requesterId)
    requesterIsOwnerOfOrg = await org.isOwner(orgId, requesterId)

    // Get visible keys
    orgKeys.forEach((key) => {
      const { visibility } = key
      switch (visibility) {
        case 'public': {
          visibleKeys.push(key)
          break
        }
        case 'org_staff': {
          if (requesterIsOwnerOfOrg || requesterIsManagerOfOrg) {
            visibleKeys.push(key)
          }
          break
        }
        case 'org': {
          if (
            requesterIsMemberOfOrg ||
            requesterIsOwnerOfOrg ||
            requesterIsManagerOfOrg
          ) {
            visibleKeys.push(key)
          }
          break
        }
      }
    })
  }

  // Get values for keys
  const visibleKeyIds = visibleKeys.map(prop('id'))
  const visibleValues = pick(visibleKeyIds, tags)

  const keysToSend = visibleKeys.map((key) => {
    return assoc('value', visibleValues[key.id], key)
  })

  return reply.send(keysToSend)
}

/**
 * Gets a team profile
 */
async function getTeamProfile(req, reply) {
  const { id: teamId } = req.params
  const { user_id: requesterId } = req.session

  if (!teamId) {
    return reply.boom.badRequest('teamId is required parameter')
  }

  // try {
  let visibleKeys = []
  let teamKeys = []
  let requesterIsMemberOfTeam = false
  let requesterIsMemberOfOrg = false
  let requesterIsManagerOfOrg = false
  let requesterIsOwnerOfOrg = false

  const values = await profile.getProfile('team', teamId)
  const tags = prop('tags', values)
  if (!values || !tags) {
    throw Boom.notFound()
  }

  // Get org keys & visibility
  const associatedOrg = await team.associatedOrg(teamId) // Is the team part of an organization?

  if (!associatedOrg) {
    throw Boom.notFound()
  }

  const isUserModerator = await team.isModerator(teamId, requesterId)

  // Get team attributes from org
  teamKeys = await profile.getProfileKeysForOwner(
    'org',
    associatedOrg.organization_id,
    'team'
  )
  requesterIsMemberOfTeam = await team.isMember(teamId, requesterId) // Is the requester part of this team?
  requesterIsMemberOfOrg = await org.isMemberOrStaff(
    associatedOrg.organization_id,
    requesterId
  )
  requesterIsManagerOfOrg = await org.isManager(
    associatedOrg.organization_id,
    requesterId
  )
  requesterIsOwnerOfOrg = await org.isOwner(
    associatedOrg.organization_id,
    requesterId
  )

  if (isUserModerator || requesterIsOwnerOfOrg) {
    const allIds = teamKeys.map(prop('id'))
    const allValues = pick(allIds, tags)
    const keysToSend = teamKeys.map((key) => {
      return assoc('value', allValues[key.id], key)
    })
    return reply.send(keysToSend)
  }

  // Get visible keys
  teamKeys.forEach((key) => {
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
      case 'org_staff': {
        if (requesterIsOwnerOfOrg || requesterIsManagerOfOrg) {
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
  const visibleKeyIds = visibleKeys.map(prop('id'))
  const visibleValues = pick(visibleKeyIds, tags)

  const keysToSend = visibleKeys.map((key) => {
    return assoc('value', visibleValues[key.id], key)
  })

  return reply.send(keysToSend)
}

/**
 * Gets a user profile in a team
 */
async function getUserTeamProfile(req, reply) {
  const { osmId, id: teamId } = req.params
  const { user_id: requesterId } = req.session

  if (!osmId) {
    throw Boom.badRequest('osmId is required parameter')
  }

  let visibleKeys = []
  let teamKeys = []
  let requesterIsMemberOfTeam = false
  let requesterIsMemberOfOrg = false
  let requesterIsOwnerOfOrg = false

  const values = await profile.getProfile('user', osmId)
  const tags = prop('tags', values)
  if (!values || !tags) {
    throw Boom.notFound()
  }

  // Get team attributes
  teamKeys = await profile.getProfileKeysForOwner('team', teamId, 'user')
  requesterIsMemberOfTeam = await team.isMember(teamId, requesterId) // Is the requester part of this team?

  // Get org keys & visibility
  const associatedOrg = await team.associatedOrg(teamId) // Is the team part of an organization?
  if (associatedOrg) {
    requesterIsMemberOfOrg = await org.isMember(
      associatedOrg.organization_id,
      requesterId
    )
    requesterIsOwnerOfOrg = await org.isOwner(
      associatedOrg.organization_id,
      requesterId
    )
  }

  if (requesterIsOwnerOfOrg) {
    const allIds = teamKeys.map(prop('id'))
    const allValues = pick(allIds, tags)
    const keysToSend = teamKeys.map((key) => {
      return assoc('value', allValues[key.id], key)
    })
    return reply.send(keysToSend)
  }

  // Get visible keys
  teamKeys.forEach((key) => {
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
  const visibleKeyIds = visibleKeys.map(prop('id'))
  const visibleValues = pick(visibleKeyIds, tags)

  const keysToSend = visibleKeys.map((key) => {
    return assoc('value', visibleValues[key.id], key)
  })

  return reply.send(keysToSend)
}

/**
 * Create keys for profile
 */
function createProfileKeys(ownerType, profileType) {
  return async function (req, reply) {
    const { id } = req.params
    const { body } = req

    if (!id) {
      throw Boom.badRequest('id is required parameter')
    }

    try {
      const attributesToAdd = body.map(
        ({ name, description, required, visibility, key_type }) => {
          return {
            name,
            description,
            required,
            visibility,
            profileType,
            key_type,
          }
        }
      )

      const data = await profile.addProfileKeys(attributesToAdd, ownerType, id)
      return reply.send(data)
    } catch (err) {
      console.error(err)
      if (
        err instanceof ValidationError ||
        err instanceof PropertyRequiredError
      ) {
        throw Boom.badRequest(err)
      }
      throw Boom.badImplementation()
    }
  }
}

/**
 * Modify profile key
 */
async function modifyProfileKey(req, reply) {
  const { id } = req.params
  const { body } = req

  if (!id) {
    throw Boom.badRequest('id is required parameter')
  }

  try {
    await profile.modifyProfileKey(id, body)
    return reply.status(200).send()
  } catch (err) {
    console.error(err)
    if (
      err instanceof ValidationError ||
      err instanceof PropertyRequiredError
    ) {
      throw Boom.badRequest(err)
    }
    throw Boom.badImplementation()
  }
}

/**
 * Delete profile key
 */
async function deleteProfileKey(req, reply) {
  const { id } = req.params

  if (!id) {
    throw Boom.badRequest('id is required parameter')
  }

  try {
    await profile.deleteProfileKey(id)
    return reply.status(200).send()
  } catch (err) {
    console.error(err)
    if (
      err instanceof ValidationError ||
      err instanceof PropertyRequiredError
    ) {
      throw Boom.badRequest(err)
    }
    throw Boom.badImplementation()
  }
}

/**
 * Get the keys set by an owner
 */
function getProfileKeys(ownerType, profileType) {
  return async function (req, reply) {
    const { id } = req.params

    if (!id) {
      throw Boom.badRequest('id is required parameter')
    }

    try {
      const data = await profile.getProfileKeysForOwner(
        ownerType,
        id,
        profileType
      )
      return reply.send(data)
    } catch (err) {
      console.error(err)
      if (
        err instanceof ValidationError ||
        err instanceof PropertyRequiredError
      ) {
        throw Boom.badRequest(err)
      }
      throw Boom.badImplementation()
    }
  }
}

/**
 * Given a profileType, return a req, reply function
 * for setting a profile
 *
 * @param {string} profileType - 'user', 'org', 'team'
 */
function setProfile(profileType) {
  return async function (req, reply) {
    const { id } = req.params
    const { body } = req

    if (!id) {
      throw Boom.badRequest('id is required parameter')
    }

    try {
      await profile.setProfile(body, profileType, id)
      reply.status(200).send()
    } catch (err) {
      console.error(err)
      throw Boom.badImplementation()
    }
  }
}

/**
 * Get a user's profile
 */
async function getMyProfile(req, reply) {
  const { user_id } = req.session
  try {
    const data = await profile.getProfile('user', user_id)
    return reply.send(data)
  } catch (err) {
    console.error(err)
    throw Boom.badImplementation()
  }
}

async function setMyProfile(req, reply) {
  const { user_id } = req.session
  const { body } = req
  try {
    await profile.setProfile(body, 'user', user_id)
    return reply.status(200).send()
  } catch (err) {
    console.error(err)
    throw Boom.badImplementation()
  }
}

module.exports = {
  getUserTeamProfile,
  getUserOrgProfile,
  createProfileKeys,
  modifyProfileKey,
  deleteProfileKey,
  getProfileKeys,
  getMyProfile,
  setMyProfile,
  setProfile,
  getTeamProfile,
}
