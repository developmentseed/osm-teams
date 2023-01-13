import T from 'prop-types'
import Table from '../../../components/tables/table'
import { useState } from 'react'
import join from 'url-join'

import Pagination from '../../../components/pagination'
import { serverRuntimeConfig } from '../../../../next.config.js'
import * as R from 'ramda'
import SearchInput from '../../../components/tables/search-input'
import Button from '../../../components/button'
const URL = process.env.APP_URL
const { DEFAULT_PAGE_SIZE } = serverRuntimeConfig

function MembersTable({ rows: allRows, onRowClick }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(null)
  const [sort, setSort] = useState({
    key: 'name',
    direction: 'asc',
  })

  const columns = [
    { key: 'name', sortable: true },
    { key: 'id', sortable: true },
    { key: 'role', sortable: true },
    {
      key: 'External Profiles',
      render: ({ name }) => (
        <>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                `https://www.openstreetmap.org/user/${name}`,
                '_blank',
                'noreferrer'
              )
            }}
            flat
            size='small'
            className='unstyled small'
            title='View profile on OSM'
          >
            <img
              src={`${join(URL, `/static/osm_logo.png`)}`}
              alt='OSM Logo'
              width='16'
              height='16'
            />
            OSM
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                `https://hdyc.neis-one.org/?${name}`,
                '_blank',
                'noreferrer'
              )
            }}
            flat
            size='small'
            className='unstyled small'
            title='View profile on HDYC'
          >
            <img
              src={`${join(URL, `/static/neis-one-logo.png`)}`}
              alt='How Do You Contribute Logo'
              width='16'
              height='16'
            />
            HDYC
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                `https://osmcha.org/?filters={"users":[{"label":"${name}","value":"${name}"}]}`,
                '_blank',
                'noreferrer'
              )
            }}
            flat
            size='small'
            className='unstyled small'
            title='View profile on OSMCha'
          >
            <img
              src={`${join(URL, `/static/icon-osmcha-logo.svg`)}`}
              alt='OSMCha Logo'
              width='16'
              height='16'
            />
            OSMCha
          </Button>
        </>
      ),
    },
  ]

  let rows = R.sort(
    sort.direction === 'asc'
      ? R.ascend(R.prop(sort.key))
      : R.descend(R.prop(sort.key)),
    allRows
  )

  let emptyTableMessage = 'This team has no members.'

  if (search) {
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
        data-cy='team-members-table'
        placeholder='Search by username'
        onSearch={(search) => {
          // Reset to page 1 and search
          setPage(1)
          setSearch(search)
        }}
      />
      <Table
        data-cy='team-members-table'
        rows={rows.slice(pageStartIndex, pageEndIndex)}
        columns={columns}
        emptyPlaceHolder={emptyTableMessage}
        onRowClick={onRowClick}
        showRowNumbers
        sort={sort}
        setSort={setSort}
      />
      <Pagination
        pagination={{
          perPage: DEFAULT_PAGE_SIZE,
          total: rows.length,
          currentPage: page,
        }}
        data-cy='team-members-table-pagination'
        setPage={setPage}
      />
    </>
  )
}

MembersTable.defaultProps = {
  rows: [],
}

MembersTable.propTypes = {
  rows: T.array.isRequired,
  onRowClick: T.func,
}

export default MembersTable
