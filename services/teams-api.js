import getConfig from 'next/config'
import join from 'url-join'

const { publicRuntimeConfig } = getConfig()
const URL = join(publicRuntimeConfig.APP_URL, '/api/teams')

export async function getTeams () {
  const res = await fetch(URL)

  if (res.status === 200) {
    return res.json()
  } else {
    throw new Error('Could not retrieve teams')
  }
}

export async function createTeam (data) {
  const res = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })

  if (res.status === 200) {
    await this.refreshTeams()
  } else {
    throw new Error('Could not create new team')
  }
}
