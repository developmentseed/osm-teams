import React, { Component } from 'react'
import join from 'url-join'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

export default class Team extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        id: query.id
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined
    }
  }

  async componentDidMount () {
    const { id } = this.props
    try {
      let { team } = await this.getTeam(id)
      this.setState({
        team,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false
      })
    }
  }

  async getTeam (id) {
    let res = await fetch(join(publicRuntimeConfig.APP_URL, `/api/teams/${id}`))
    if (res.status === 200) {
      return res.json()
    } else {
      throw new Error('could not retrieve team')
    }
  }

  render () {
    return (
      <h1>Team</h1>
    )
  }
}
