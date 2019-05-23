import Button from '../components/button'
import React, { Component } from 'react'

class Login extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        challenge: query.challenge
      }
    }
  }

  render() {
    return (
      <section>
        <h1>Login Provider</h1>
        <p>OSM Hydra uses OSM as your login, connect your OSM account!</p>
        <br />
        <Button href={`/oauth/openstreetmap?login_challenge=${this.props.challenge}`}>Login with OSM</Button>
      </section>
    )
  }
}

export default Login