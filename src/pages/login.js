import React, { Component } from 'react'
import { Button } from '@chakra-ui/react'

const OSM_NAME = process.env.OSM_NAME
class Login extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        challenge: query.challenge,
      }
    }
  }

  render() {
    return (
      <section className='inner page'>
        <h1>Login</h1>
        <p>
          Teams uses {OSM_NAME} as your login, connect your {OSM_NAME} account!
        </p>
        <br />
        <Button
          href={`/oauth/openstreetmap?login_challenge=${this.props.challenge}`}
        >
          Login with {OSM_NAME}
        </Button>
      </section>
    )
  }
}

export default Login
