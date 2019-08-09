import React, { Component } from 'react'
import join from 'url-join'
import getConfig from 'next/config'
import theme from '../styles/theme'

const { publicRuntimeConfig } = getConfig()

class Sidebar extends Component {
  render () {
    return (
      <div className='sidebar'>
        <h1><a href='#'>Teams</a></h1>
        <ul className='welcome__actions'>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/teams/create')}>➕ Create New Team</a></li>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/teams')} className=''>🌏 All Teams</a></li>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/profile')} className=''>💁‍♀️ Profile</a></li>
          <li><a href={join(publicRuntimeConfig.APP_URL, '/clients')} className=''>⚙️ Connected Apps</a></li>
        </ul>
        <style jsx>
          {`
            .sidebar {
              grid-area: sidebar;
            }

            .sidebar h1 a{
              font-size: 1rem;
              text-transform: uppercase;
              color: ${theme.colors.secondaryColor};
            }

            .sidebar ul {
              list-style: none;
              margin-block-start: 0;
              margin-block-end: 0;
              padding-inline-start: 0;
            }
          `}
        </style>
      </div>
    )
  }
}

export default Sidebar
