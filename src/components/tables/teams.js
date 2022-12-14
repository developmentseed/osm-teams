import T from 'prop-types'
import Table from './table'
import Router from 'next/router'
import join from 'url-join'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import Pagination from '../pagination'

function TeamsTable({ type, orgId }) {
  const [page, setPage] = useState(0)

  let apiBasePath

  switch (type) {
    case 'all-teams':
      apiBasePath = '/teams'
      break
    case 'my-teams':
      apiBasePath = '/my/teams'
      break
    case 'org-teams':
      apiBasePath = `/organizations/${orgId}/teams`
      break
    default:
      break
  }

  const {
    result: { total, data },
    isLoading,
  } = useFetchList(`${apiBasePath}?page=${page}`)

  const columns = [{ key: 'name' }, { key: 'members' }]

  return (
    <>
      <Table
        data-cy={`${type}-table`}
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
      {total > 0 && (
        <Pagination
          data-cy={`${type}-table-pagination`}
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
  type: T.oneOf(['all-teams', 'org-teams', 'my-teams']).isRequired,
  orgId: T.number,
}

export default TeamsTable
