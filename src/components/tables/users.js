import T from 'prop-types'
import Table from './table'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useEffect, useRef, useState } from 'react'
import Pagination from '../pagination'
import qs from 'qs'
import { Field, Form, Formik, useFormikContext } from 'formik'
import Button from '../button'

/**
 * This is a helper component to auto-submit search values after a timeout
 */
const AutoSubmitSearch = () => {
  const timerRef = useRef(null)

  const { values, touched, submitForm } = useFormikContext()

  useEffect(() => {
    // Check if input was touched. Formik behavior is to update 'touched'
    // flag on input blur or submit, but we want to submit changes also on
    // key press. 'touched' is not a useEffect dependency because it is
    // constantly updated without value changes.
    const isTouched = touched.search || values?.search.length > 0

    // If search is touched
    if (isTouched) {
      // Clear previous timeout, if exists
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      // Define new timeout
      timerRef.current = setTimeout(submitForm, 1000)
    }

    // Clear timeout on unmount
    return () => timerRef.current && clearTimeout(timerRef.current)
  }, [values])

  return null
}

/**
 * The search input
 */
const SearchInput = ({ onSearch, 'data-cy': dataCy }) => {
  return (
    <Formik
      initialValues={{ search: '' }}
      onSubmit={({ search }) => onSearch(search)}
    >
      <Form
        className='form-control justify-start'
        style={{ alignItems: 'stretch' }}
      >
        <Field
          data-cy={`${dataCy}-search-input`}
          type='search'
          name='search'
          id='search'
          placeholder='Search username...'
          style={{ width: '12rem' }}
        />
        <Button
          data-cy={`${dataCy}-search-submit`}
          type='submit'
          variant='submit'
          useIcon='magnifier-left'
          flat
        />
        <AutoSubmitSearch />
      </Form>
    </Formik>
  )
}

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
