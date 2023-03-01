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

function TableHead({ dataCy, columns, sort, setSort, onClick }) {
  return (
    <Thead>
      <Tr>
        {columns.map(({ sortable, label, key }) => {
          const isSorted = sortable && sort.key === key
          const currentSortDirection = (isSorted && sort.direction) || 'none'
          const nextSortDirection =
            currentSortDirection === 'asc' ? 'desc' : 'asc'
          let sortIcon = ''
          if (currentSortDirection !== 'none') {
            sortIcon = currentSortDirection === 'asc' ? '▲' : '▼'
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
              textAlign='left'
              fontFamily='mono'
              fontWeight='base'
              fontSize='sm'
              letterSpacing='0.125rem'
              background='brand.50'
              borderBottom='4px solid var(--chakra-colors-brand-600)'
            >
              {label || key}
              {sortable && ` ${sortIcon}`}
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
    >
      {columns.map(({ key, render }) => {
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
            borderColor='base.100'
            fontSize='0.9rem'
            _first={[
              null,
              {
                position: 'sticky',
                left: '0',
                zIndex: '2',
                borderRight: '2px solid var(--chakra-colors-brand-100)',
              },
            ]}
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
      overflowS='scroll'
      position='relative'
      my={2}
    >
      <BaseTable
        data-cy={dataCy}
        borderCollapse={['collapse', 'separate']}
        borderSpacing='0'
        marginBottom={2}
        tableLayout='fixed'
        whiteSpace='pre'
        overflowX='scroll'
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
        {/* <style jsx global>
          {`
            thead th.sortable {
              cursor: pointer;
            }

            tbody tr {
              background: #fff;
              ${onRowClick && 'cursor: pointer'}
            }

            ${onRowClick &&
            `tbody tr:hover td {
                background: ${theme.colors.primaryLite};
              }
            `}
            @media (max-width: ${theme.mediaRanges.medium}) {
              td:first-child,
              th:first-child {
                position: sticky;
                left: 0;
                z-index: 2;
                border-right: 2px solid ${theme.colors.primaryLite};
              }
              td:first-child {
                background: #fff;
              }
            }
          `}
        </style> */}
      </BaseTable>
    </Box>
  )
}
