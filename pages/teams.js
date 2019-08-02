import React, { Component } from 'react'
import getConfig from 'next/config'
import Map from 'pigeon-maps'
import Marker from '../components/marker'
import Router from 'next/router'
import Section from '../components/section'
import Table from '../components/table'
import join from 'url-join'
import { isNil, pick, reject, map, props, prop } from 'ramda'
import { getTeams } from '../lib/teams-api'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

export default class TeamList extends Component {
  static async getInitialProps () {}

  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      teams: [],
      map: { center: [30, 30], zoom: 1 }
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
    const DivMarker = ({ left, top, style, children }) => (
      <div style={{
        position: 'absolute',
        left: left,
        top: top,
        style: {
          width: 30,
          height: 30,
          background: 'red',
          borderBottomLeftRadius: '100%',
          borderBottomRightRadius: '100%'
        }
      }} >{children}</div>
    )
    const { teams, map: { center, zoom } } = this.state
    if (!teams) return null
    if (teams.length === 0) {
      return <div />
    }

    const teamLocations = map(pick(['location', 'id']), teams)
    const locations = teamLocations.filter(({ location }) => !!location) // reject nulls
    const centers = map(({ location, id }) => ({ id, center: JSON.parse(location).coordinates.reverse() }), locations)

    return (
      <Map center={center} mouseEvents zoom={zoom} width={400} height={300} >
        {centers.map(c => <Marker key={c.id} anchor={c.center} payload={c.id} />) }
      </Map>
    )
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
