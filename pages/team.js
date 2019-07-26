import React, { Component } from 'react'
import join from 'url-join'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

export class TeamList extends Component {
  render () {
    const { members } = this.props

    const membersToDisplay = members.map(member => (
      <li>{member.name} - #{member.id}</li>
    ))

    return <ul>{membersToDisplay}</ul>
  }
}

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
      let team = await this.getTeam(id)
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
    const { team } = this.state
    if (!team) {
      return <div />
    }
    return (
      <article>
        <h1>{team.name}</h1>
        <section className='mt4 mb4 ba b3 b--black-10 pa3'>
          <h2 className='dark-green'>Team Details</h2>
          <dl>
            <dt>Bio: </dt>
            <dd>{team.bio}</dd>
            <dt>Hashtag: </dt>
            <dd>{team.hashtag}</dd>
          </dl>
        </section>
        <section className='mt4 mb4 ba b3 b--black-10 pa3'>
          <h2 className='dark-green'>Team Members</h2>
          <TeamList members={team.members} />
        </section>
      </article>
    )
  }
}
