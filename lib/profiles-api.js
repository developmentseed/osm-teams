import getConfig from 'next/config'
import join from 'url-join'

const { publicRuntimeConfig } = getConfig()
const URL = join(publicRuntimeConfig.APP_URL, '/api/profiles')

/**
 * getTeams
 * Get list of teams from the API
 *
 * @returns {Array[Object]} - list of team details
 */
export async function getTeamMemberAttributes (id) {
  let res = await fetch(join(URL, 'keys', 'teams', `${id}`, 'users'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
  if (res.status === 200) {
    return res.json()
  } else {
    const err = new Error('could not retrieve team member attributes')
    err.status = res.status
    throw err
  }
}

/**
 * modifyMemberAttribute
 * Modify attribute given a profile key
 *
 * @param {integer} id - key id
 * @param {Object} data - new key attributes
 */
export async function modifyMemberAttribute (id, data) {
  return fetch(join(URL, 'keys', `${id}`), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * deleteMemberAttribute
 * Deletes attribute given a profile key
 * @param {integer} id - key id
 */
export async function deleteMemberAttribute (id) {
  return fetch(join(URL, 'keys', `${id}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * getUserOrgrofile
 * get the profile of a user in a team
 */
export async function getUserOrgProfile (orgId, userId) {
  const res = await fetch(join(URL, 'organizations', `${orgId}`, `${userId}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
  if (res.status === 200) {
    return res.json()
  } if (res.status === 404) {
    return {}
  } else {
    const err = new Error('could not retrieve profile')
    err.status = res.status
    throw err
  }
}

/**
 * getUserTeamProfile
 * get the profile of a user in a team
 */
export async function getUserTeamProfile (teamId, userId) {
  const res = await fetch(join(URL, 'teams', `${teamId}`, `${userId}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
  if (res.status === 200) {
    return res.json()
  } if (res.status === 404) {
    return {}
  } else {
    const err = new Error('could not retrieve profile')
    err.status = res.status
    throw err
  }
}

/**
 * addTeamMemberAttributes
 * Add attribute to team user profile
 *
 * @param {integer} id - team id
 * @param {Object} data - key attribute
 */
export async function addTeamMemberAttributes (id, data) {
  data = [].concat(data)
  return fetch(join(URL, 'keys', 'teams', `${id}`, 'users'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * getMyProfile
 * Get the requesting user's profile
 */
export async function getMyProfile () {
  let res = await fetch(join(publicRuntimeConfig.APP_URL, '/api/my/profiles'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
  if (res.status === 200) {
    return res.json()
  } else {
    const err = new Error('could not retrieve profile')
    err.status = res.status
    throw err
  }
}

/**
 * setMyProfile
 * Set the requesting user's profile
 */
export async function setMyProfile (data) {
  return fetch(join(publicRuntimeConfig.APP_URL, '/api/my/profiles'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}
