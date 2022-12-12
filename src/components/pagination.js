import React from 'react'
import T from 'prop-types'

function listPageOptions(page, lastPage) {
  let pageOptions = [1]
  if (lastPage === 0) {
    return pageOptions
  }
  if (page === 0 || page > lastPage) {
    return pageOptions.concat([2, '...', lastPage])
  }
  if (lastPage > 5) {
    if (page < 3) {
      return pageOptions.concat([2, 3, '...', lastPage])
    }
    if (page === 3) {
      return pageOptions.concat([2, 3, 4, '...', lastPage])
    }
    if (page === lastPage) {
      return pageOptions.concat(['...', page - 2, page - 1, lastPage])
    }
    if (page === lastPage - 1) {
      return pageOptions.concat(['...', page - 1, page, lastPage])
    }
    if (page === lastPage - 2) {
      return pageOptions.concat(['...', page - 1, page, page + 1, lastPage])
    }
    return pageOptions.concat([
      '...',
      page - 1,
      page,
      page + 1,
      '...',
      lastPage,
    ])
  } else {
    let range = []
    for (let i = 1; i <= lastPage; i++) {
      range.push(i)
    }
    return range
  }
}

function Pagination({ pageSize, currentPage, totalRecords, setPage }) {
  const maxPages = pageSize ? Math.ceil(totalRecords / pageSize) : 0
  const pages = listPageOptions(currentPage + 1, maxPages)

  return (
    <nav>
      <button
        data-cy='first-page-button'
        onClick={() => setPage(0)}
        disabled={currentPage === 0}
        useIcon='chevron-left-trail--small'
        hideText
        $flat={false}
        variation='primary-raised-light'
        size='small'
      >
        Previous page
      </button>
      <button
        data-cy='previous-page-button'
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 0}
        useIcon='chevron-left--small'
        hideText
        $flat={false}
        variation='primary-raised-light'
        size='small'
      >
        Previous page
      </button>
      {pages.map((page) => {
        return (
          <button
            onClick={() => setPage(page - 1)}
            key={`page-${page - 1}`}
            $flat={currentPage === page - 1}
            variation={
              page === '...'
                ? 'base-plain'
                : currentPage === page - 1
                ? 'primary-raised-dark'
                : 'primary-raised-light'
            }
            disabled={page === '...'}
            data-cy={`page-${page}-button`}
            size='small'
          >
            {page}
          </button>
        )
      })}
      <button
        data-cy='next-page-button'
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === maxPages - 1}
        useIcon='chevron-right--small'
        hideText
        $flat={false}
        variation='primary-raised-light'
        size='small'
      >
        Next page
      </button>
      <button
        data-cy='last-page-button'
        onClick={() => setPage(maxPages - 1)}
        disabled={currentPage === maxPages - 1}
        useIcon='chevron-right-trail--small'
        hideText
        $flat={false}
        variation='primary-raised-light'
        size='small'
      >
        Last page
      </button>
      <div>
        Showing {currentPage * pageSize + 1}-
        {Intl.NumberFormat().format(
          currentPage === maxPages - 1
            ? totalRecords
            : (currentPage + 1) * pageSize
        )}{' '}
        of {Intl.NumberFormat().format(totalRecords)}
      </div>
    </nav>
  )
}

Pagination.propTypes = {
  pageSize: T.number.isRequired,
  currentPage: T.number.isRequired,
  totalRecords: T.number.isRequired,
  setPage: T.func.isRequired,
}

export default Pagination
