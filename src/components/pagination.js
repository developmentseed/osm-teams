import React from 'react'
import T from 'prop-types'

import Button from './button'

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

function Pagination({
  pageSize,
  currentPage,
  totalRecords,
  setPage,
  'data-cy': dataCy,
}) {
  const maxPages = pageSize ? Math.ceil(totalRecords / pageSize) : 0
  const pages = listPageOptions(currentPage + 1, maxPages)

  return (
    <nav data-cy={dataCy}>
      <Button
        data-cy='first-page-button'
        onClick={() => setPage(0)}
        disabled={currentPage === 0}
        useIcon='chevron-left--trail'
        className='small'
        flat
      />
      <Button
        data-cy='previous-page-button'
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 0}
        useIcon='chevron-left--small'
        className='small'
        flat
      />
      {pages.map((page) => {
        return (
          <Button
            onClick={() => setPage(page - 1)}
            key={`page-${page - 1}`}
            disabled={page === '...'}
            data-cy={`page-${page}-button`}
            className='small'
            flat
          >
            {page}
          </Button>
        )
      })}
      <Button
        data-cy='next-page-button'
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === maxPages - 1}
        useIcon='chevron-right--small'
        className='small'
        flat
      />
      <Button
        data-cy='last-page-button'
        onClick={() => setPage(maxPages - 1)}
        disabled={currentPage === maxPages - 1}
        useIcon='chevron-right--trail'
        className='small'
        flat
      />
      <div>
        Showing {currentPage * pageSize + 1}-
        {Intl.NumberFormat().format(
          currentPage === maxPages - 1
            ? totalRecords
            : (currentPage + 1) * pageSize
        )}{' '}
        of {Intl.NumberFormat().format(totalRecords)}
      </div>
      <style jsx>
        {`
          nav {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 1rem;
          }
          nav > div:last-child {
            flex-basis: 100%;
            width: 100%;
            text-align: center;
          }
        `}
      </style>
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
