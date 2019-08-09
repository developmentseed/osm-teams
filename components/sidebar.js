import React, { Component } from 'react'
import join from 'url-join'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

class Sidebar extends Component {
  render () {
    return (
      <div>
        <ul className='welcome__actions'>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/teams/create')}>➕ Create New Team</a></li>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/teams')} className=''>🌏 All Teams</a></li>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/profile')} className=''>💁‍♀️ Profile</a></li>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/clients')} className=''>⚙️ Connected Apps</a></li>
        </ul>
      </div>
    )
  }
}

export default Sidebar
