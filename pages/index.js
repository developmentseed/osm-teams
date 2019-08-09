import React, { Component } from 'react'
import Button from '../components/button'
import Router from 'next/router'
import join from 'url-join'
import getConfig from 'next/config'
import theme from '../styles/theme'

const { publicRuntimeConfig } = getConfig()

class Home extends Component {
  static async getInitialProps ({ query }) {
    if (query.user) {
      return {
        user: {
          username: query.user
        }
      }
    }
  }

  render () {
    return (
      <section className='inner page welcome'>
        <h1>Teams!</h1>
        <p>
          Create teams of {publicRuntimeConfig.OSM_NAME} users and import them into your apps.
        </p>
        {
          this.props.user.username
            ? (
              <div>
                <h2>Welcome, {this.props.user.username}!</h2>
                <ul className='welcome__actions'>
                  <li><a href={join(publicRuntimeConfig.APP_URL, '/teams/create')}>➕ Create New Team</a></li>
                  <li><a href={join(publicRuntimeConfig.APP_URL, '/teams')} className=''>🌏 All Teams</a></li>
                  <li><a href={join(publicRuntimeConfig.APP_URL, '/profile')} className=''>💁‍♀️ Profile</a></li>
                  <li><a href={join(publicRuntimeConfig.APP_URL, '/clients')} className=''>⚙️ Connected Apps</a></li>
                </ul>
                <Button variant='danger' onClick={() => {
                  window.sessionStorage.clear()
                  Router.push('/logout')
                }
                }>Logout</Button>
              </div>
            )
            : <Button href='/login'>Sign in →</Button>
        }
        <style jsx>
          {`
            .welcome__actions {
              list-style: none;
              display: flex;
              flex-direction: column;
              margin-block-start: 0;
              margin-block-end: 0;
              padding-inline-start: 0;
              padding: ${theme.layout.globalSpacing} 0;
            }

            .welcome__actions li {
              padding-bottom: ${theme.layout.globalSpacing};
            }
          `}
        </style>
      </section>
    )
  }
}

export default Home
