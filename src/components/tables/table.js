import React from 'react'
import {
  Table as BaseTable,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Box,
} from '@chakra-ui/react'
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons'

function TableHead({ dataCy, columns, sort, setSort, onClick }) {
  return (
    <Thead>
      <Tr>
        {columns.map(({ sortable, label, key, alignment }) => {
          const isSorted = sortable && sort.key === key
          const currentSortDirection = (isSorted && sort.direction) || 'none'
          const nextSortDirection =
            currentSortDirection === 'asc' ? 'desc' : 'asc'
          let sortIcon = ''
          if (currentSortDirection !== 'none') {
            sortIcon =
              currentSortDirection === 'asc' ? (
                <TriangleUpIcon />
              ) : (
                <TriangleDownIcon />
              )
          }

          return (
            <Th
              key={`table-head-column-${key}`}
              data-cy={`${dataCy}-head-column-${key}`}
              className={sortable && 'sortable'}
              title={sortable && `Click to sort by ${key}`}
              onClick={() => {
                onClick && onClick()

                if (sortable) {
                  setSort({
                    key,
                    direction: nextSortDirection,
                  })
                }
              }}
              padding='0.5rem 1rem'
              verticalAlign='middle'
              position='relative'
              textTransform='uppercase'
              textAlign={alignment ? alignment : 'left'}
              fontFamily='mono'
              fontWeight='base'
              fontSize='sm'
              letterSpacing='0.125rem'
              background='brand.50'
              borderBottom='4px solid var(--chakra-colors-brand-600)'
              cursor={sortable && 'pointer'}
              _hover={sortable && { fontWeight: 'bold', color: 'brand.500' }}
              _first={{
                base: {
                  position: 'sticky',
                  left: '0',
                  zIndex: '2',
                  background: 'brand.50',
                  borderRight: '2px solid var(--chakra-colors-brand-100)',
                },
                md: {
                  position: 'initial',
                  left: 'initial',
                  zIndex: 'initial',
                  borderRight: 'none',
                },
              }}
            >
              {label || key}
              {sortable && sortIcon}
            </Th>
          )
        })}
      </Tr>
    </Thead>
  )
}

function Row({ columns, row, index, onRowClick, showRowNumber }) {
  return (
    <Tr
      key={`row-${index}`}
      onClick={() => {
        onRowClick && onRowClick(row, index)
      }}
      role='group'
    >
      {columns.map(({ key, render, alignment }) => {
        let item =
          typeof render === 'function' ? render(row, index, columns) : row[key]
        if (showRowNumber && key === ' ') {
          item = index + 1
        }
        return (
          <Td
            width={showRowNumber && key === ' ' && '1rem'}
            padding='0.875rem'
            borderBottom={1}
            borderColor='brand.800'
            fontSize='0.9rem'
            textAlign={alignment ? alignment : 'left'}
            _groupHover={
              onRowClick && {
                cursor: 'pointer',
                background: 'brand.50',
                color: 'brand.500',
              }
            }
            _first={{
              base: {
                position: 'sticky',
                left: '0',
                zIndex: '2',
                bg: 'white',
                borderRight: '2px solid var(--chakra-colors-brand-100)',
              },
              md: {
                position: 'initial',
                left: 'initial',
                zIndex: 'initial',
                borderRight: 'none',
              },
            }}
            key={`row-${index}-key-${key}`}
          >
            {item}
          </Td>
        )
      })}
    </Tr>
  )
}

function TableBody({
  columns,
  rows,
  onRowClick,
  emptyPlaceHolder,
  showRowNumbers,
}) {
  const isEmpty = !rows || rows.length === 0
  return (
    <Tbody
      className='lh-copy'
      data-cy={isEmpty ? 'empty-table' : 'not-empty-table'}
    >
      {isEmpty ? (
        <Tr>
          <Td key='empty-row' colSpan={columns.length}>
            {emptyPlaceHolder || 'No data available.'}
          </Td>
        </Tr>
      ) : (
        rows.map((row, index) => {
          return (
            <Row
              key={`row-${index}`}
              columns={columns}
              row={row}
              index={index}
              onRowClick={onRowClick}
              showRowNumber={showRowNumbers}
            />
          )
        })
      )}
    </Tbody>
  )
}

export default function Table({
  columns,
  rows,
  onRowClick,
  emptyPlaceHolder,
  showRowNumbers,
  'data-cy': dataCy,
  sort,
  setSort,
}) {
  showRowNumbers && columns.unshift({ key: ' ' })
  return (
    <Box
      display='grid'
      gridTemplateColumns='minmax(0, 1fr)'
      overflowX='auto'
      position='relative'
      my={2}
    >
      <BaseTable
        data-cy={dataCy}
        marginBottom={2}
        layout='fixed'
        size='sm'
        width='initial'
        sx={{
          base: {
            borderSpacing: '0',
            borderCollapse: 'separate',
          },
          md: { borderCollapse: 'collapse' },
        }}
      >
        <TableHead
          dataCy={dataCy}
          columns={columns}
          sort={sort}
          setSort={setSort}
        />
        <TableBody
          columns={columns}
          rows={rows}
          onRowClick={onRowClick}
          emptyPlaceHolder={emptyPlaceHolder}
          showRowNumbers={showRowNumbers}
        />
      </BaseTable>
    </Box>
  )
}
