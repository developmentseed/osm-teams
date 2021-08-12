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
    const err = new Error('could not retrieve team')
    err.status = res.status
    throw err
  }
}

export async function addTeamMemberAttributes (id, data) {
  return fetch(join(URL, 'keys', 'teams', `${id}`, 'users'), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}
