import React, {Component } from 'react'
import Clients from '../components/clients'

export default class Profile extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        user: query.user,
        picture: query.user_picture
      }
    }
  }

  render() {
    const { user, picture } = this.props

    return (
      <div>
        <h2 className="flex items-center bb b--black-10 pb3">
          <img src={picture} className="br2 h3 w3 dib"/>
          <span className="pl3 flex-auto f2 black-70">{user}</span>
        </h2>
        <Clients />
      </div>
    )
  }
}