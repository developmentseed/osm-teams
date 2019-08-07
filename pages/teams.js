import React, { Component } from 'react'
import getConfig from 'next/config'
import Router from 'next/router'
import Section from '../components/section'
import Table from '../components/table'
import join from 'url-join'
import { getTeams } from '../lib/teams-api'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

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
        teams: [],
        loading: false
      })
    }
  }

  renderTeams () {
    const { teams } = this.state
    if (!teams) return null

    if (teams.length === 0) {
      return <p>No teams created</p>
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
          Router.push(join(URL, `/team?id=${row.id}`), join(URL, `/teams/${row.id}`))
        }}
      />
    )
  }

  render () {
    return (
      <div className='inner'>
        <h2>Teams</h2>
        <Section>
          {this.renderTeams()}
        </Section>
        <style jsx>
          {`
            margin-top: 2rem;
          `}
        </style>
      </div>
    )
  }
}
