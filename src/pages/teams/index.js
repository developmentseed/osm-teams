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
import SearchInput from '../../components/tables/search-input'
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
      search: '',
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
    const { teams, sortOptions, page, search } = this.state
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

    // Default empty table message
    let emptyTableMessage = 'No teams created yet.'

    if (search?.length > 0) {
      // Apply search
      rows = rows.filter((r) =>
        r.name.toUpperCase().includes(search.toUpperCase())
      )

      // Change empty table message when no results are available
      if (rows.length === 0) {
        emptyTableMessage = 'Search returned no results.'
      }
    }

    // Calculate start and end index
    const pageStartIndex = (page - 1) * DEFAULT_PAGE_SIZE
    const pageEndIndex = pageStartIndex + DEFAULT_PAGE_SIZE

    return (
      <>
        <SearchInput
          data-cy='teams-table'
          placeholder='Search by team name'
          onSearch={(search) => {
            // Reset to page 1 and search
            this.setState({ page: 1, search })
          }}
        />
        <Table
          data-cy={`teams-table`}
          columns={columns}
          rows={rows.slice(pageStartIndex, pageEndIndex)}
          onRowClick={(row) => {
            Router.push(join(URL, `/teams/${row.id}`))
          }}
          emptyPlaceHolder={emptyTableMessage}
          showRowNumbers
          sort={sortOptions}
          setSort={(s) => this.setState({ sortOptions: s })}
        />
        {rows?.length > 0 && (
          <Pagination
            data-cy='teams-table-pagination'
            pagination={{
              perPage: DEFAULT_PAGE_SIZE,
              total: rows.length,
              currentPage: page,
            }}
            setPage={(p) => this.setState({ page: p })}
          />
        )}
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
        style={{ height: '360px' }}
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
        <h1>Explore All Teams</h1>
        {this.renderMap()}
        <fieldset>
          <input
            name='map-bounds-filter'
            id='map-bounds-filter'
            type='checkbox'
            checked={searchOnMapMove}
            onChange={(e) => this.setSearchOnMapMove(e)}
          />
          <label for='map-bounds-filter'>Filter teams by map</label>
        </fieldset>
        <Section>{this.renderTeams()}</Section>
        <style jsx>
          {`
            fieldset {
              display: inline-block;
              padding: 0.5rem;
              background: white;
              border-color: ${theme.colors.primaryColor};
              border-color: #384a9e;
              position: relative;
              top: -4rem;
              left: 1rem;
              z-index: 1000;
            }
            fieldset input,
            fieldset label {
              cursor: pointer;
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
