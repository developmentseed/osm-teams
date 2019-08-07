import React, { Component } from 'react'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import Section from '../components/section'
import Table from '../components/table'
import join from 'url-join'
import { isNil, pick, reject, map, props, prop } from 'ramda'
import { getTeams } from '../lib/teams-api'

const Map = dynamic(import('../components/list-map'), {
  ssr: false
})

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

export default class TeamList extends Component {
  static async getInitialProps () {}

  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      teams: []
    }
  }

  async getTeams () {
    try {
      // Filters
      const bbox = this.state.mapBounds

      const teams = await getTeams({ bbox })
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

  async componentDidMount () {
    this.getTeams()
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
          Router.push(join(URL, `/team?id=${row.id}`), join(URL, `/teams/${row.id}`))
        }}
      />
    )
  }

  renderMap () {
    const { teams } = this.state
    if (!teams) return null
    if (teams.length === 0) {
      return <div />
    }

    const teamLocations = map(pick(['location', 'id']), teams)
    const locations = teamLocations.filter(({ location }) => !!location) // reject nulls
    const centers = map(({ location, id }) => ({ id, center: JSON.parse(location).coordinates.reverse() }), locations)

    return <Map markers={centers} style={{height: '300px'}}/>
  }

  render () {
    return (
      <div>
        <h2>Teams</h2>
        { this.renderMap() }
        <Section>
          {this.renderTeams()}
        </Section>
      </div>
    )
  }
}
