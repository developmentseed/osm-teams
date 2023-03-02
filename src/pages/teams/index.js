import React, { Component } from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import { Box, Checkbox, Container, Heading } from '@chakra-ui/react'
import Table from '../../components/tables/table'
import join from 'url-join'
import { pick, map, sort, descend, ascend, prop } from 'ramda'
import { getTeams } from '../../lib/teams-api'
import logger from '../../lib/logger'
import { serverRuntimeConfig } from '../../../next.config.js'
import Pagination from '../../components/pagination'
import SearchInput from '../../components/tables/search-input'
import InpageHeader from '../../components/inpage-header'
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
        style={{
          height: '360px',
          border: '2px solid var(--chakra-colors-brand-700)',
          boxShadow: '4px 4px 0 0 var(--chakra-colors-brand-600)',
          zIndex: '10',
        }}
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
      <Box as='main'>
        <InpageHeader>
          <Heading color='white'>Explore All Teams</Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          {this.renderMap()}
          <Checkbox
            border={'2px'}
            marginTop={'-4rem'}
            marginLeft={'1rem'}
            position='absolute'
            zIndex='2000'
            borderColor='brand.600'
            p={2}
            bg='white'
            name='map-bounds-filter'
            id='map-bounds-filter'
            type='checkbox'
            colorScheme={'brand'}
            checked={searchOnMapMove}
            onChange={(e) => this.setSearchOnMapMove(e)}
          >
            Filter teams by map
          </Checkbox>
          <Box as='section' mt={8} layerStyle={'shadowed'}>
            {this.renderTeams()}
          </Box>
        </Container>
      </Box>
    )
  }
}
