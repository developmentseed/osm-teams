import T from 'prop-types'
import Table from './table'
import Router from 'next/router'
import join from 'url-join'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import Pagination from '../pagination'

const APP_URL = process.env.APP_URL

function TeamsTable({ type, orgId }) {
  const [page, setPage] = useState(1)

  let apiBasePath
  let emptyMessage

  switch (type) {
    case 'all-teams':
      apiBasePath = '/teams'
      break
    case 'my-teams':
      apiBasePath = '/my/teams'
      emptyMessage = 'You are not part of a team yet.'
      break
    case 'org-teams':
      apiBasePath = `/organizations/${orgId}/teams`
      emptyMessage = 'This organization has no teams.'
      break
    default:
      break
  }

  const {
    result: { data, pagination },
    isLoading,
  } = useFetchList(`${apiBasePath}?page=${page}`)

  const columns = [{ key: 'name' }, { key: 'members' }]

  return (
    <>
      <Table
        data-cy={`${type}-table`}
        rows={data}
        columns={columns}
        emptyPlaceHolder={isLoading ? 'Loading...' : emptyMessage}
        onRowClick={(row) => {
          Router.push(
            join(APP_URL, `/team?id=${row.id}`),
            join(APP_URL, `/teams/${row.id}`)
          )
        }}
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

TeamsTable.propTypes = {
  type: T.oneOf(['all-teams', 'org-teams', 'my-teams']).isRequired,
  orgId: T.number,
}

export default TeamsTable
