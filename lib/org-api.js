import getConfig from 'next/config'
import join from 'url-join'

const { publicRuntimeConfig } = getConfig()
const URL = join(publicRuntimeConfig.APP_URL, '/api/organizations')

/**
 * createTeam
 *
 * @param {Object} data - Basic team information
 * @returns {Response}
 */
export async function createOrg (data) {
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
    throw new Error('Could not create org')
  }
}

/**
 * getOrgs
 * get list of organizations
 *
 */
export async function getMyOrgs () {
  const res = await fetch('/api/my/organizations')

  if (res.status === 200) {
    return res.json()
  } else {
    throw new Error('Could not retrieve orgs')
  }
}

/**
 * getOrg
 * get organization
 *
 * @param {integer} id
 */
export async function getOrg (id) {
  let res = await fetch(join(URL, `${id}`))
  if (res.status === 200) {
    return res.json()
  } else {
    const err = new Error('could not retrieve team')
    err.status = res.status
    throw err
  }
}

export async function getMembers (id, page) {
  let res = await fetch(join(URL, `${id}`, 'members', `?page=${page}`))
  if (res.status === 200) {
    return res.json()
  } else {
    const err = new Error('could not retrieve team')
    err.status = res.status
    throw err
  }
}
