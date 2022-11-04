import React, { Component } from 'react'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import Section from '../components/section'
import Table from '../components/table'
import theme from '../styles/theme'
import join from 'url-join'
import { pick, map } from 'ramda'
import { getTeams } from '../lib/teams-api'

const Map = dynamic(import('../components/list-map'), {
  ssr: false,
})

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

export default class TeamList extends Component {
  static async getInitialProps() {}

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      teams: [],
      searchOnMapMove: false,
      mapBounds: undefined,
    }
  }

  async getTeams() {
    try {
      const { mapBounds, searchOnMapMove } = this.state
      const searchParams = searchOnMapMove ? { bbox: mapBounds } : {}
      const teams = await getTeams(searchParams)
      this.setState({
        teams,
        loading: false,
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        teams: [],
        loading: false,
      })
    }
  }

  async componentDidMount() {
    this.getTeams()
  }

  renderTeams() {
    const { teams } = this.state
    if (!teams) return null

    if (teams.length === 0) {
      return <p>No teams created</p>
    }

    return (
      <Table
        rows={teams}
        columns={[{ key: 'id' }, { key: 'name' }, { key: 'hashtag' }]}
        onRowClick={(row, index) => {
          Router.push(
            join(URL, `/team?id=${row.id}`),
            join(URL, `/teams/${row.id}`)
          )
        }}
      />
    )
  }

  /**
   * Bounds is a WESN box, refresh teams
   */
  onMapBoundsChange(bounds) {
    if (this.state.searchOnMapMove) {
      this.setState(
        {
          mapBounds: bounds,
        },
        () => this.getTeams()
      )
    } else {
      this.setState({ mapBounds: bounds })
    }
  }

  renderMap() {
    const { teams } = this.state
    if (!teams) return null

    const teamLocations = map(pick(['location', 'id']), teams)
    const locations = teamLocations.filter(({ location }) => !!location) // reject nulls
    const centers = map(
      ({ location, id }) => ({
        id,
        center: JSON.parse(location).coordinates.reverse(),
      }),
      locations
    )

    return (
      <Map
        markers={centers}
        style={{ height: '300px' }}
        onBoundsChange={this.onMapBoundsChange.bind(this)}
      />
    )
  }

  setSearchOnMapMove(e) {
    this.setState(
      {
        searchOnMapMove: e.target.checked,
      },
      () => this.getTeams()
    )
  }

  render() {
    const { searchOnMapMove } = this.state
    return (
      <div className='inner page'>
        <h2>Teams</h2>
        {this.renderMap()}
        <fieldset>
          <input
            type='checkbox'
            checked={searchOnMapMove}
            onChange={(e) => this.setSearchOnMapMove(e)}
          />
          <span>Filter teams using map bounds</span>
        </fieldset>
        <Section>{this.renderTeams()}</Section>
        <style jsx>
          {`
            fieldset {
              display: inline-block;
              margin: 1rem 0 2rem;
              padding: 1.5rem;
              background: white;
              border-color: ${theme.colors.primaryColor};
            }

            fieldset input[type='checkbox'] {
              margin-right: 0.5rem;
            }
          `}
        </style>
      </div>
    )
  }
}
