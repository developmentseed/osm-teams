import React, { Component } from 'react'
import Router from 'next/router'

class Login extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        challenge: query.challenge
      }
    }
  }

  componentDidMount () {
    Router.push(`/oauth/openstreetmap?login_challenge=${this.props.challenge}`)
  }

  render () {
    return <section className='page inner'>Loading...</section>
  }
}

export default Login
