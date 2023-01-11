import T from 'prop-types'
import Table from '../../../components/tables/table'
import { useState } from 'react'
import Pagination from '../../../components/pagination'
import { serverRuntimeConfig } from '../../../../next.config.js'
import * as R from 'ramda'
import SearchInput from '../../../components/tables/search-input'
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
  ]

  let rows = R.sort(
    sort.direction === 'asc'
      ? R.ascend(R.prop(sort.key))
      : R.descend(R.prop(sort.key)),
    allRows
  )

  if (search) {
    rows = rows.filter((r) =>
      r.name.toUpperCase().includes(search.toUpperCase())
    )
  }

  // Calculate start and end index
  const pageStartIndex = (page - 1) * DEFAULT_PAGE_SIZE
  const pageEndIndex = pageStartIndex + DEFAULT_PAGE_SIZE

  return (
    <>
      <SearchInput
        data-cy='team-members-table'
        placeholder='Type an username...'
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
        emptyPlaceHolder='This team has no members.'
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
        data-cy={`team-members-table-pagination`}
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
