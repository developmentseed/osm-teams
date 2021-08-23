import getConfig from 'next/config'
import join from 'url-join'

const { publicRuntimeConfig } = getConfig()
const URL = join(publicRuntimeConfig.APP_URL, '/api/profiles')

/**
 * getTeamMemberAttributes
 * Get attributes for team
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
 * getOrgMemberAttributes
 * Get attributes for org members
 *
 * @returns {Array[Object]} - list of team details
 */
export async function getOrgMemberAttributes (id) {
  let res = await fetch(join(URL, 'keys', 'organizations', `${id}`, 'users'), {
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
 * getOrgTeamAttributes
 * Get attributes for team attributes
 *
 * @returns {Array[Object]} - list of team details
 */
export async function getOrgTeamAttributes (id) {
  let res = await fetch(join(URL, 'keys', 'organizations', `${id}`, 'teams'), {
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
 * modifyAttribute
 * Modify attribute given a profile key
 *
 * @param {integer} id - key id
 * @param {Object} data - new key attributes
 */
export async function modifyAttribute (id, data) {
  return fetch(join(URL, 'keys', `${id}`), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * deleteAttribute
 * Deletes attribute given a profile key
 * @param {integer} id - key id
 */
export async function deleteAttribute (id) {
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
 * addOrgMemberAttributes
 * Add attribute to org user profile
 *
 * @param {integer} id - team id
 * @param {Object} data - key attribute
 */
export async function addOrgMemberAttributes (id, data) {
  data = [].concat(data)
  return fetch(join(URL, 'keys', 'organizations', `${id}`, 'users'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * addOrgMemberAttributes
 * Add attribute to org team profile
 *
 * @param {integer} id - team id
 * @param {Object} data - key attribute
 */
export async function addOrgTeamAttributes (id, data) {
  data = [].concat(data)
  return fetch(join(URL, 'keys', 'organizations', `${id}`, 'teams'), {
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

export async function getTeamProfile (id) {
  let res = await fetch(join(publicRuntimeConfig.APP_URL, `/api/profiles/teams/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
  if (res.status === 200) {
    return res.json()
  } if (res.status === 404) {
    return []
  } else {
    const err = new Error('could not retrieve profile')
    err.status = res.status
    throw err
  }
}
