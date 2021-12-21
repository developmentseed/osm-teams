import getConfig from 'next/config'
import qs from 'qs'
import join from 'url-join'

const { publicRuntimeConfig } = getConfig()
const URL = join(publicRuntimeConfig.APP_URL, '/api/teams')

/**
 * getTeams
 * Get list of teams from the API
 *
 * @returns {Array[Object]} - list of team details
 */
export async function getTeams (options) {
  let str = qs.stringify(options, { arrayFormat: 'comma' })
  const res = await fetch(`${URL}?${str}`)

  if (res.status === 200) {
    return res.json()
  } else {
    throw new Error('Could not retrieve teams')
  }
}

/**
 * createTeam
 *
 * @param {Object} data - Basic team information
 * @returns {Response}
 */
export async function createTeam (data) {
  const res = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })

  if (res.status === 200) {
    return res.json()
  } else {
    throw new Error('Could not retrieve teams')
  }
}

/**
 * createOrgTeam
 *
 * @param {int} orgId - org id
 * @param {Object} data - Basic team information
 * @returns {Response}
 */
export async function createOrgTeam (orgId, data) {
  const res = await fetch(join(publicRuntimeConfig.APP_URL, 'api', 'organizations', `${orgId}`, 'teams'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })

  if (res.status === 200) {
    return res.json()
  } else {
    throw new Error('Could not retrieve teams')
  }
}

/**
 * getTeam
 * Get team details from the API
 *
 * @param id - id of team
 * @returns {Object} - team details
 */
export async function getTeam (id) {
  let res = await fetch(join(URL, `${id}`))
  if (res.status === 200) {
    return res.json()
  } else {
    const err = new Error('could not retrieve team')
    err.status = res.status
    throw err
  }
}

/**
 * updateTeam
 * Update a team
 *
 * @param id - Team id
 * @param values - Basic details { bio, name, hashtag }
 * @returns {Response}
 */
export async function updateTeam (id, values) {
  return fetch(join(URL, `${id}`), {
    method: 'PUT',
    body: JSON.stringify(values),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * Delete a team
 * @param id - Team id
 */
export async function destroyTeam (id) {
  return fetch(join(URL, `${id}`), {
    method: 'DELETE'
  })
}

/**
 * getMembers
 * Get a team's members
 *
 * @param id - Team id
 * @returns {Response}
 */
export async function getTeamMembers (id) {
  let res = await fetch(join(URL, `${id}`, 'members'))
  if (res.status === 200) {
    return res.json()
  }
  if (res.status === 401) { // If unauthorized, don't display team members
    return { members: [], moderators: [] }
  } else {
    const err = new Error('could not retrieve team members')
    err.status = res.status
    throw err
  }
}

/**
 * updateMembers
 * Update a team's members
 *
 * @param id - Team id
 * @param {array} add - array of osm IDs to add
 * @param {array} remove - array of osm IDs to remove
 * @returns {Response}
 */
export async function updateMembers (id, add, remove) {
  return fetch(join(URL, `${id}`, 'members'), {
    method: 'PATCH',
    body: JSON.stringify({ add, remove }),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * addMember
 * Add a team member
 *
 * @param id - Team id
 * @param {int} osmId - user osm id
 * @returns {Response}
 */
export async function addMember (id, osmId) {
  return updateMembers(id, [osmId], [])
}

/**
 * removeMember
 * Remove a team member
 *
 * @param id - Team id
 * @param {int} osmId - user osm id
 * @returns {Response}
 */
export async function removeMember (id, osmId) {
  return updateMembers(id, [], [osmId])
}

/**
 * joinTeam
 * Let current user join team
 *
 * @param id - Team id
 * @returns {Response}
 */
export async function joinTeam (id) {
  return fetch(join(URL, `${id}`, 'join'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * addModerator
 * add a moderator to a team
 * @param {int} id - team id
 * @param {int} osmId - id of new moderator
 */
export async function assignModerator (id, osmId) {
  return fetch(join(URL, `${id}`, 'assignModerator', `${osmId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * removeModerator
 * remove a moderator to a team
 * @param {int} id - team id
 * @param {int} osmId - id of new moderator
 */
export async function removeModerator (id, osmId) {
  return fetch(join(URL, `${id}`, 'removeModerator', `${osmId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}
