import T from 'prop-types'
import Table from '../table'
import Router from 'next/router'
import join from 'url-join'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import Pagination from '../pagination'

function TeamsTable({ orgId }) {
  const [page, setPage] = useState(0)

  const {
    result: { total, data },
    isLoading,
  } = useFetchList(`/organizations/${orgId}/teams?page=${page}`)

  const columns = [{ key: 'name' }, { key: 'id' }, { key: 'members' }]

  return (
    <>
      <Table
        rows={data}
        columns={columns}
        emptyPlaceHolder={
          isLoading ? 'Loading...' : 'This organization has no teams.'
        }
        onRowClick={(row) => {
          Router.push(
            join(URL, `/team?id=${row.id}`),
            join(URL, `/teams/${row.id}`)
          )
        }}
      />
      <Pagination
        pageSize={10}
        currentPage={page}
        totalRecords={total}
        setPage={setPage}
      />
    </>
  )
}

TeamsTable.propTypes = {
  orgId: T.number.isRequired,
}

export default TeamsTable
