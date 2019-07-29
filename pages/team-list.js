import React, { Component } from 'react'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import { TeamDetailSmall } from '../components/team'
import List from '../components/list'
import { getTeams } from '../services/teams-api'

export default class TeamList extends Component {
  static async getInitialProps ({ query }) {}

  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined
    }
  }

  async componentDidMount () {
    try {
      const teams = await getTeams()
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
    return (
      <div>
        <h2>Profile</h2>
        <Section>
          <SectionHeader>Teams</SectionHeader>
          {this.renderTeams()}
        </Section>
      </div>
    )
  }
}
