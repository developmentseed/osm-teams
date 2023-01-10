import T from 'prop-types'
import Table from '../../../components/tables/table'
import { useState } from 'react'
import Pagination from '../../../components/pagination'
import { serverRuntimeConfig } from '../../../../next.config.js'
const { DEFAULT_PAGE_SIZE } = serverRuntimeConfig

function MembersTable({ rows, onRowClick }) {
  const [page, setPage] = useState(1)

  const columns = [{ key: 'name' }, { key: 'id' }, { key: 'role' }]

  // Calculate start and end index
  const pageStartIndex = (page - 1) * DEFAULT_PAGE_SIZE
  const pageEndIndex = pageStartIndex + DEFAULT_PAGE_SIZE

  return (
    <>
      <Table
        data-cy={`team-members-table`}
        rows={rows.slice(pageStartIndex, pageEndIndex)}
        columns={columns}
        emptyPlaceHolder={'This team has no members.'}
        onRowClick={onRowClick}
        showRowNumbers
      />
      {rows.length > DEFAULT_PAGE_SIZE && (
        <Pagination
          pagination={{
            perPage: DEFAULT_PAGE_SIZE,
            total: rows.length,
            currentPage: page,
          }}
          data-cy={`team-members-table-pagination`}
          setPage={setPage}
        />
      )}
    </>
  )
}

MembersTable.propTypes = {
  rows: T.array.isRequired,
  onRowClick: T.func,
}

export default MembersTable
