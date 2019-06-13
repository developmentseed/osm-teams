import Button from '../components/button'
import React, { Component } from 'react'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

class Login extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        challenge: query.challenge
      }
    }
  }

  render () {
    const OSM_NAME = publicRuntimeConfig.OSM_NAME
    return (
      <section>
        <h1>Login Provider</h1>
        <p>Teams uses {OSM_NAME} as your login, connect your {OSM_NAME} account!</p>
        <br />
        <Button href={`/oauth/openstreetmap?login_challenge=${this.props.challenge}`}>Login with {OSM_NAME}</Button>
      </section>
    )
  }
}

export default Login
