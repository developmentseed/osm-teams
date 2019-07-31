import getConfig from 'next/config'
import join from 'url-join'

const { publicRuntimeConfig } = getConfig()
const URL = join(publicRuntimeConfig.APP_URL, '/api/teams')

/**
 * getTeams
 * Get list of teams from the API
 *
 * @returns {Array[Object]} - list of team details
 */
export async function getTeams () {
  const res = await fetch(URL)

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
  return fetch(URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

/**
 * getTeam
 * Get team details from the API
 *
 * @param id - id of team
 * @returns {Object} - team details + moderators + members
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
