import T from 'prop-types'
import Table from '../table'
import Router from 'next/router'
import join from 'url-join'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import Pagination from '../pagination'

const APP_URL = process.env.APP_URL

function TeamsTable({ orgId }) {
  const [page, setPage] = useState(0)

  const {
    result: { total, data },
    isLoading,
  } = useFetchList(`/organizations/${orgId}/teams?page=${page}`)

  const columns = [{ key: 'name' }, { key: 'members' }]

  return (
    <>
      <Table
        data-cy='org-teams-table'
        rows={data}
        columns={columns}
        emptyPlaceHolder={
          isLoading ? 'Loading...' : 'This organization has no teams.'
        }
        onRowClick={(row) => {
          Router.push(join(APP_URL, `/teams/${row.id}`))
        }}
      />
      {total > 0 && (
        <Pagination
          data-cy='org-teams-table-pagination'
          pageSize={10}
          currentPage={page}
          totalRecords={total}
          setPage={setPage}
        />
      )}
    </>
  )
}

TeamsTable.propTypes = {
  orgId: T.number.isRequired,
}

export default TeamsTable
