import join from 'url-join'

const APP_URL = process.env.APP_URL
const PROFILE_URL = join(APP_URL, '/api/profiles')

/**
 * getTeamMemberAttributes
 * Get attributes for team
 *
 * @returns {Array[Object]} - list of team details
 */
export async function getTeamMemberAttributes(id) {
  let res = await fetch(join(PROFILE_URL, 'keys', 'teams', `${id}`, 'users'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
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
export async function getOrgMemberAttributes(id) {
  let res = await fetch(
    join(PROFILE_URL, 'keys', 'organizations', `${id}`, 'users'),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  )
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
export async function getOrgTeamAttributes(id) {
  let res = await fetch(
    join(PROFILE_URL, 'keys', 'organizations', `${id}`, 'teams'),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  )
  if (res.status === 200) {
    return res.json()
  } else {
    const err = new Error('could not retrieve team member attributes')
    err.status = res.status
    throw err
  }
}

/**
 * getTeamAttributess
 * Get attributes for team attributes
 *
 * @returns {Array[Object]} - list of team details
 */
export async function getTeamAttributes(id) {
  let res = await fetch(join(PROFILE_URL, 'keys', 'teams', `${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
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
export async function modifyAttribute(id, data) {
  return fetch(join(PROFILE_URL, 'keys', `${id}`), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * deleteAttribute
 * Deletes attribute given a profile key
 * @param {integer} id - key id
 */
export async function deleteAttribute(id) {
  return fetch(join(PROFILE_URL, 'keys', `${id}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * getUserOrgProfile
 * get the profile of a user in a org
 */
export async function getUserOrgProfile(orgId, userId) {
  const res = await fetch(
    join(PROFILE_URL, 'organizations', `${orgId}`, `${userId}`),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  )
  if (res.status === 200) {
    return res.json()
  }
  if (res.status === 404 || res.status === 401) {
    return []
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
export async function getUserTeamProfile(teamId, userId) {
  const res = await fetch(
    join(PROFILE_URL, 'teams', `${teamId}`, `${userId}`),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  )
  if (res.status === 200) {
    return res.json()
  }
  if (res.status === 404 || res.status === 401) {
    return []
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
export async function addTeamMemberAttributes(id, data) {
  data = [].concat(data)
  return fetch(join(PROFILE_URL, 'keys', 'teams', `${id}`, 'users'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * addOrgMemberAttributes
 * Add attribute to org user profile
 *
 * @param {integer} id - team id
 * @param {Object} data - key attribute
 */
export async function addOrgMemberAttributes(id, data) {
  data = [].concat(data)
  return fetch(join(PROFILE_URL, 'keys', 'organizations', `${id}`, 'users'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * addOrgMemberAttributes
 * Add attribute to org team profile
 *
 * @param {integer} id - team id
 * @param {Object} data - key attribute
 */
export async function addOrgTeamAttributes(id, data) {
  data = [].concat(data)
  return fetch(join(PROFILE_URL, 'keys', 'organizations', `${id}`, 'teams'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * getMyProfile
 * Get the requesting user's profile
 */
export async function getMyProfile() {
  let res = await fetch(join(APP_URL, '/api/my/profiles'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
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
export async function setMyProfile(data) {
  return fetch(join(APP_URL, '/api/my/profiles'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

export async function getTeamProfile(id) {
  let res = await fetch(join(APP_URL, `/api/profiles/teams/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
  if (res.status === 200) {
    return res.json()
  }
  if (res.status === 404 || res.status === 401) {
    return []
  } else {
    const err = new Error('could not retrieve profile')
    err.status = res.status
    throw err
  }
}
