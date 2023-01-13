import T from 'prop-types'
import Table from './table'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import Pagination from '../pagination'
import qs from 'qs'
import SearchInput from './search-input'

function UsersTable({ type, orgId, onRowClick, isSearchable }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(null)

  let apiBasePath
  let emptyMessage
  let columns

  const querystring = qs.stringify({
    search,
    page,
  })

  switch (type) {
    case 'org-members':
      apiBasePath = `/organizations/${orgId}/members`
      emptyMessage = 'No members yet.'
      columns = [{ key: 'name' }, { key: 'id', label: 'OSM ID' }]
      break
    case 'org-staff':
      apiBasePath = `/organizations/${orgId}/staff`
      emptyMessage = 'No staff found.'
      columns = [
        { key: 'name' },
        { key: 'id', label: 'OSM ID' },
        { key: 'type' },
      ]
      break
    default:
      break
  }

  const {
    result: { data, pagination },
    isLoading,
  } = useFetchList(`${apiBasePath}?${querystring}`)

  if (!isLoading && search?.length > 0) {
    emptyMessage = 'Search returned no results.'
  }

  return (
    <>
      {isSearchable && (
        <SearchInput
          data-cy={`${type}-table`}
          onSearch={(search) => {
            // Reset to page 1 and search
            setPage(1)
            setSearch(search)
          }}
          placeholder='Search by username'
        />
      )}
      <Table
        data-cy={`${type}-table`}
        rows={data}
        columns={columns}
        emptyPlaceHolder={isLoading ? 'Loading...' : emptyMessage}
        onRowClick={onRowClick}
      />
      {pagination?.total > 0 && (
        <Pagination
          data-cy={`${type}-table-pagination`}
          pagination={pagination}
          setPage={setPage}
        />
      )}
    </>
  )
}

UsersTable.propTypes = {
  type: T.oneOf(['org-members', 'org-staff']).isRequired,
  orgId: T.number,
}

export default UsersTable
