import React from 'react'
import T from 'prop-types'
import Button from './button'

const PAGE_INDEX_START = 1

function listPageOptions(page, lastPage) {
  let pageOptions = [1]
  if (lastPage === PAGE_INDEX_START) {
    return pageOptions
  }
  if (page === PAGE_INDEX_START || page > lastPage) {
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

function Pagination({ pagination, setPage, 'data-cy': dataCy }) {
  const { perPage, total, currentPage } = pagination

  const maxPages = perPage ? Math.ceil(total / perPage) : 0
  const pages = listPageOptions(currentPage + 1, maxPages)

  return (
    <nav data-cy={dataCy}>
      <Button
        data-cy='first-page-button'
        onClick={() => setPage(PAGE_INDEX_START)}
        disabled={currentPage === PAGE_INDEX_START}
        useIcon='chevron-left--trail'
        className='small'
        flat
      />
      <Button
        data-cy='previous-page-button'
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === PAGE_INDEX_START}
        useIcon='chevron-left--small'
        className='small'
        flat
      />
      {pages.map((page) => {
        return (
          <Button
            onClick={() => setPage(page)}
            key={`page-${page}`}
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
        onClick={() => setPage(maxPages)}
        disabled={currentPage === maxPages}
        useIcon='chevron-right--trail'
        className='small'
        flat
      />
      <div>
        Showing {(currentPage - 1) * perPage + 1}-
        {Intl.NumberFormat().format(
          currentPage === maxPages ? total : currentPage * perPage
        )}{' '}
        of {Intl.NumberFormat().format(total)}
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
  perPage: T.number.isRequired,
  currentPage: T.number.isRequired,
  total: T.number.isRequired,
  setPage: T.func.isRequired,
}

export default Pagination
