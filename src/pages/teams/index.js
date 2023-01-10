import React, { Component } from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import Section from '../../components/section'
import Table from '../../components/tables/table'
import theme from '../../styles/theme'
import join from 'url-join'
import { pick, map, sort, descend, ascend, prop } from 'ramda'
import { getTeams } from '../../lib/teams-api'
import logger from '../../lib/logger'
import { serverRuntimeConfig } from '../../../next.config.js'
import Pagination from '../../components/pagination'
const { DEFAULT_PAGE_SIZE } = serverRuntimeConfig

const Map = dynamic(import('../../components/list-map'), {
  ssr: false,
})

const URL = process.env.APP_URL

export default class TeamList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      teams: [],
      searchOnMapMove: false,
      mapBounds: undefined,
      page: 1,
      sortOptions: {
        key: 'name',
        direction: 'asc',
      },
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
      logger.error(e)
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
    const { teams, sortOptions, page } = this.state
    if (!teams) return null

    const columns = [
      { key: 'name', sortable: true },
      { key: 'id', sortable: true },
      { key: 'hashtag', sortable: true },
    ]

    let rows = sort(
      sortOptions.direction === 'asc'
        ? ascend(prop(sortOptions.key))
        : descend(prop(sortOptions.key)),
      teams
    )

    // Calculate start and end index
    const pageStartIndex = (page - 1) * DEFAULT_PAGE_SIZE
    const pageEndIndex = pageStartIndex + DEFAULT_PAGE_SIZE

    return (
      <>
        <Table
          data-cy={`teams-table`}
          columns={columns}
          rows={rows.slice(pageStartIndex, pageEndIndex)}
          onRowClick={(row) => {
            Router.push(join(URL, `/teams/${row.id}`))
          }}
          emptyPlaceHolder={'No teams created yet.'}
          showRowNumbers
          sort={sortOptions}
          setSort={(s) => this.setState({ sortOptions: s })}
        />
        <Pagination
          data-cy={`teams-table-pagination`}
          pagination={{
            perPage: DEFAULT_PAGE_SIZE,
            total: rows.length,
            currentPage: page,
          }}
          setPage={(p) => this.setState({ page: p })}
        />
      </>
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
