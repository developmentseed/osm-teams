import React, { Component } from 'react'
import join from 'url-join'
import getConfig from 'next/config'
import Link from 'next/link'
import Button from '../components/button'
import Chance from 'chance'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import { TeamDetailSmall } from '../components/team'
import List from '../components/list'
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

    const teamsWithPaths = this.state.teams.map(team => {
      return Object.assign({
        href: `/team?id=${team.id}`,
        as: `/team/${team.id}`
      }, team)
    })

    return <List items={teamsWithPaths}>
      {
        (team) => (
          <TeamDetailSmall {...team} />
        )
      }
    </List>
  }

  render () {
    if (this.state.loading) return <div>Loading...</div>
    if (this.state.error) return <div> {this.state.error.message} </div>

    return (
      <div>
        <h2>Profile</h2>
        <Section>
          <SectionHeader>Teams</SectionHeader>
          {this.renderTeams()}
        </Section>
        <Button onClick={() => this.createTeam()} >Create team</Button>
      </div>
    )
  }
}
