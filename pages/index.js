import React, { Component } from 'react'
import Button from '../components/button'
import Router from 'next/router'
import join from 'url-join'
import getConfig from 'next/config'
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
      <section>
        <h1>Teams!</h1>
        <p className='measure-copy'>
          Create teams of {publicRuntimeConfig.OSM_NAME} users and import them into your apps.
        </p>
        {
          this.props.user.username
            ? (
              <div className='mt4'>
                <h2>Welcome, {this.props.user.username}!</h2>
                <ul className='mt4 mb4 list pl2'>
                  <li className='pv1'><a href={join(publicRuntimeConfig.APP_URL, '/teams')} className='link dib'>🌏 All Teams</a></li>
                  <li className='pv1'><a href={join(publicRuntimeConfig.APP_URL, '/profile')} className='link dib'>💁‍♀️ Profile</a></li>
                  <li className='pv1'><a href={join(publicRuntimeConfig.APP_URL, '/clients')} className='link dib'>⚙️ Connected Apps</a></li>
                </ul>
                <Button onClick={() => {
                  window.sessionStorage.clear()
                  Router.push('/logout')
                }
                }>Logout</Button>
              </div>
            )
            : <Button href='/login'>Sign in →</Button>
        }
      </section>
    )
  }
}

export default Home
