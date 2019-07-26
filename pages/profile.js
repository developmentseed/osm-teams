import React, { Component } from 'react'
import join from 'url-join'
import getConfig from 'next/config'
import Link from 'next/link'
import Button from '../components/button'
import Chance from 'chance'
const chance = Chance()

const { publicRuntimeConfig } = getConfig()

export default class Profile extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      teams: [],
      error: undefined
    }
  }

  async getTeams () {
    let res = await fetch(join(publicRuntimeConfig.APP_URL, '/api/teams'))
    if (res.status === 200) {
      return res.json()
    } else {
      throw new Error('Could not retrieve teams')
    }
  }

  async refreshTeams () {
    try {
      let teams = await this.getTeams()
      this.setState({
        teams,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        teamsk: [],
        loading: false
      })
    }
  }

  async createTeam () {
    let res = await fetch(join(publicRuntimeConfig.APP_URL, '/api/teams'), {
      method: 'POST',
      body: JSON.stringify({
        name: `${chance.country({ full: true })} ${chance.animal()} ${chance.pickone([
          'Group', 'Inc.', 'Ltd.', 'Team', 'Associates', 'Party', 'LLC', 'Corp.'
        ]
        )}`,
        hashtag: chance.hashtag()
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    if (res.status === 200) {
      await this.refreshTeams()
    } else {
      throw new Error('Could not create new team')
    }
  }

  componentDidMount () {
    this.refreshTeams()
  }

  renderTeams () {
    if (this.state.teams.length === 0) {
      return <p className='measure-copy'>No teams created</p>
    }

    let teams = this.state.teams.map((team, idx) => (
      <Link key={team.id} href={`/team?id=${team.id}`} as={`/team/${team.id}`}>
        <li className='flex mb3'>
          <div className='flex f5 pr3'>{idx + 1}. </div>
          <div className='flex-auto'>
            <span className='f5 tracked b'>{team.name}</span>
            <div className='f6' >{team.hashtag}</div>
          </div>
        </li>
      </Link>
    ))
    return <ul className='list pl1 mt3'>{teams}</ul>
  }

  render () {
    if (this.state.loading) return <div>Loading...</div>
    if (this.state.error) return <div> {this.state.error.message} </div>

    return (
      <div>
        <h2>Profile</h2>
        <section className='mt4 mb4 ba br3 b--black-10 pa3'>
          <h3 className='dark-green'>Teams</h3>
          {this.renderTeams()}
        </section>
        <Button onClick={() => this.createTeam()} >Create team</Button>
      </div>
    )
  }
}
