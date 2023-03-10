import React from 'react'
import T from 'prop-types'
import { Flex, Button, Text, IconButton } from '@chakra-ui/react'
import {
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronRight,
  FiChevronsRight,
} from 'react-icons/fi'
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
  let { perPage, total, currentPage, lastPage } = pagination
  currentPage = Number(currentPage)

  const maxPages = Number(lastPage)
  const pages = listPageOptions(currentPage + 1, maxPages)

  return (
    <Flex
      data-cy={dataCy}
      flexWrap='wrap'
      justifyContent='center'
      alignItems='center'
      gap={4}
    >
      <IconButton
        data-cy='first-page-button'
        aria-label='first-page-button'
        onClick={() => setPage(PAGE_INDEX_START)}
        isDisabled={currentPage === PAGE_INDEX_START}
        icon={<FiChevronsLeft />}
        variant='outline'
        size='sm'
      />
      <IconButton
        data-cy='previous-page-button'
        aria-label='previous-page-button'
        onClick={() => setPage(currentPage - 1)}
        isDisabled={currentPage === PAGE_INDEX_START}
        icon={<FiChevronLeft />}
        variant='outline'
        size='sm'
      />
      {pages.map((page) => {
        return (
          <Button
            onClick={() => setPage(page)}
            key={`page-${page}`}
            isDisabled={page === '...'}
            variant={currentPage === page ? 'solid' : 'outline'}
            size='sm'
            data-cy={`page-${page}-button`}
          >
            {page}
          </Button>
        )
      })}
      <IconButton
        data-cy='next-page-button'
        aria-label='next-page-button'
        onClick={() => setPage(currentPage + 1)}
        isDisabled={currentPage === maxPages}
        icon={<FiChevronRight />}
        variant='outline'
        size='sm'
      />
      <IconButton
        data-cy='last-page-button'
        aria-label='last-page-button'
        onClick={() => setPage(maxPages)}
        isDisabled={currentPage === maxPages}
        icon={<FiChevronsRight />}
        variant='outline'
        size='sm'
      />
      <Text flexBasis='100%' width='100%' textAlign={'center'}>
        Showing {(currentPage - 1) * perPage + 1}-
        {Intl.NumberFormat().format(
          Number(currentPage) === Number(maxPages)
            ? total
            : currentPage * perPage
        )}{' '}
        of {Intl.NumberFormat().format(total)}
      </Text>
    </Flex>
  )
}

Pagination.propTypes = {
  perPage: T.number.isRequired,
  currentPage: T.number.isRequired,
  total: T.number.isRequired,
  setPage: T.func.isRequired,
}

export default Pagination
