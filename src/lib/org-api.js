import join from 'url-join'
const APP_URL = process.env.APP_URL
const ORG_URL = join(APP_URL, '/api/organizations')

/**
 * createTeam
 *
 * @param {Object} data - Basic team information
 * @returns {Response}
 */
export async function createOrg(data) {
  const res = await fetch(ORG_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
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
export async function getMyOrgs() {
  const res = await fetch(join(APP_URL, '/api/my/organizations'))

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
export async function getOrg(id) {
  let res = await fetch(join(ORG_URL, `${id}`))
  if (res.status === 200) {
    return res.json()
  } else {
    const err = new Error('could not retrieve org')
    err.status = res.status
    throw err
  }
}

/**
 * getOrgStaff
 * get org staff
 * @param {integer} id
 */
export async function getOrgStaff(id) {
  let res = await fetch(join(ORG_URL, `${id}`, 'staff'))
  if (res.status === 200) {
    return res.json()
  }
  if (res.status === 401) {
    return { managers: [], owners: [] }
  } else {
    const err = new Error('could not retrieve organization')
    err.status = res.status
    throw err
  }
}
/**
 * getMembers
 * get org members (paginated)
 * @param {integer} id
 * @param {integer} page
 */
export async function getMembers(id, page) {
  let res = await fetch(join(ORG_URL, `${id}`, 'members', `?page=${page}`))
  if (res.status === 200) {
    return res.json()
  }
  if (res.status === 401) {
    return { members: [], page }
  } else {
    const err = new Error('could not retrieve organization')
    err.status = res.status
    throw err
  }
}

/**
 * updateOrg
 * @param {integer} id id of organization
 * @param {data} values data to update
 */
export async function updateOrg(id, values) {
  return fetch(join(ORG_URL, `${id}`), {
    method: 'PUT',
    body: JSON.stringify(values),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * updateOrgPrivacyPolicy
 * @param {integer} id id of organization
 * @param {data} values data to update
 */
export async function updateOrgPrivacyPolicy(id, privacyPolicy) {
  return fetch(join(ORG_URL, `${id}`), {
    method: 'PUT',
    body: JSON.stringify({ privacy_policy: privacyPolicy }),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * destroyOrg
 * delete an org
 * @param {integer} id id of organization
 */
export async function destroyOrg(id) {
  return fetch(join(ORG_URL, `${id}`), {
    method: 'DELETE',
  })
}

/**
 * addManager
 * @param {integer} id id of organization
 * @param {integer} osmId osmId to add
 */
export async function addManager(id, osmId) {
  return fetch(join(ORG_URL, `${id}`, 'addManager', `${osmId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * removeManager
 * @param {integer} id id of organization
 * @param {integer} osmId osmId to add
 */
export async function removeManager(id, osmId) {
  return fetch(join(ORG_URL, `${id}`, 'removeManager', `${osmId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * addOwner
 * @param {integer} id id of organization
 * @param {integer} osmId osmId to add
 */
export async function addOwner(id, osmId) {
  return fetch(join(ORG_URL, `${id}`, 'addOwner', `${osmId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * removeOwner
 * @param {integer} id id of organization
 * @param {integer} osmId osmId to add
 */
export async function removeOwner(id, osmId) {
  return fetch(join(ORG_URL, `${id}`, 'removeOwner', `${osmId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
