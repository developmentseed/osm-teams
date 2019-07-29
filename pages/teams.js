import React, { Component } from 'react'
import Router from 'next/router'
import Section from '../components/section'
import Table from '../components/table'
import { getTeams } from '../lib/teams-api'

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
    const { teams } = this.state
    if (!teams) return null

    if (teams.length === 0) {
      return <p className='measure-copy'>No teams created</p>
    }

    return (
      <Table
        rows={teams}
        columns={[
          { key: 'id' },
          { key: 'name' },
          { key: 'hashtag' }
        ]}
        onRowClick={(row, index) => {
          Router.push(`/team?id=${row.id}`, `/team/${row.id}`)
        }}
      />
    )
  }

  render () {
    return (
      <div>
        <h2>Teams</h2>
        <Section>
          {this.renderTeams()}
        </Section>
      </div>
    )
  }
}
