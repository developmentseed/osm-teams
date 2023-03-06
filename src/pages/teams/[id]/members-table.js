import T from 'prop-types'
import Table from '../../../components/tables/table'
import { useState } from 'react'

import Pagination from '../../../components/pagination'
import * as R from 'ramda'
import SearchInput from '../../../components/tables/search-input'
import ExternalProfileButton from '../../../components/external-profile-button'
import Badge from '../../../components/badge'
import { makeTitleCase } from '../../../../app/lib/utils'
import theme from '../../../styles/theme'
const SCOREBOARD_URL = process.env.SCOREBOARD_URL
const HDYC_URL = process.env.HDYC_URL
const DEFAULT_PAGE_SIZE = process.env.DEFAULT_PAGE_SIZE

function MembersTable({ rows: allRows, onRowClick }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(null)
  const [sort, setSort] = useState({
    key: 'name',
    direction: 'asc',
  })

  const roleBgColor = {
    member: theme.colors.primaryColor,
    moderator: theme.colors.secondaryColor,
    manager: theme.colors.infoColor,
    owner: theme.colors.secondaryColor,
    undefined: theme.colors.primaryDark,
  }

  const columns = [
    { key: 'name', sortable: true },
    { key: 'id', sortable: true },
    {
      key: 'role',
      label: 'role',
      sortable: true,
      render: ({ role }) => (
        <Badge color={roleBgColor[role.toLowerCase()]}>
          {makeTitleCase(role)}
        </Badge>
      ),
    },
    {
      key: 'External Profiles',
      render: ({ id, name }) => (
        <>
          <ExternalProfileButton type='osm-profile' userId={name} />
          {SCOREBOARD_URL && (
            <ExternalProfileButton type='scoreboard' userId={id} />
          )}
          {HDYC_URL && <ExternalProfileButton type='hdyc' userId={name} />}
          <ExternalProfileButton type='osmcha' userId={name} />
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
