import React, { Component } from 'react'
import Clients from '../components/clients'

export default class Profile extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        token: query.access_token
      }
    }
  }

  render () {
    return (
      <Clients token={this.props.token} />
    )
  }
}
