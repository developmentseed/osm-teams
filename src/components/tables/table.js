import React from 'react'
import theme from '../../styles/theme'

function TableHead({ columns, sort, setSort, onClick }) {
  return (
    <thead>
      <tr>
        {columns.map(({ sortable, label, key }) => {
          const header = label || key

          const isSorted = sortable && sort.key === header
          const currentSortDirection = (isSorted && sort.direction) || 'none'
          const nextSortDirection =
            currentSortDirection === 'asc' ? 'desc' : 'asc'
          let sortIcon = ''
          if (currentSortDirection !== 'none') {
            sortIcon = currentSortDirection === 'asc' ? '▲' : '▼'
          }

          return (
            <th
              key={`table-head-column-${key}`}
              data-cy={`table-head-column-${key}`}
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
            >
              {header}
              {sortable && ` ${sortIcon}`}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

function Row({ columns, row, index, onRowClick, showRowNumber }) {
  return (
    <tr
      key={`row-${index}`}
      onClick={() => {
        onRowClick && onRowClick(row, index)
      }}
    >
      {columns.map(({ key }) => {
        let item =
          typeof row[key] === 'function'
            ? row[key](row, index, columns)
            : row[key]
        if (showRowNumber && key === ' ') {
          item = index + 1
        }
        return (
          <td
            width={showRowNumber && key === ' ' && '1rem'}
            key={`row-${index}-key-${key}`}
          >
            {item}
          </td>
        )
      })}
    </tr>
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
    <tbody
      className='lh-copy'
      data-cy={isEmpty ? 'empty-table' : 'not-empty-table'}
    >
      {isEmpty ? (
        <tr>
          <td key='empty-row' colSpan={columns.length}>
            {emptyPlaceHolder || 'No data available.'}
          </td>
        </tr>
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
    </tbody>
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
    <table data-cy={dataCy}>
      <TableHead columns={columns} sort={sort} setSort={setSort} />
      <TableBody
        columns={columns}
        rows={rows}
        onRowClick={onRowClick}
        emptyPlaceHolder={emptyPlaceHolder}
        showRowNumbers={showRowNumbers}
      />
      <style jsx global>
        {`
          table {
            border-collapse: collapse;
            width: 100%;
            border-spacing: 0;
            max-width: 100%;
            margin-bottom: ${theme.layout.globalSpacing};
          }

          thead th {
            padding: 0.5rem 1rem;
            vertical-align: middle;
            position: relative;
            text-transform: uppercase;
            text-align: left;
            font-family: ${theme.typography.headingFontFamily};
            font-weight: ${theme.typography.baseFontWeight};
            font-size: 0.875rem;
            letter-spacing: 0.125rem;
            background: ${theme.colors.primaryLite};
            border-bottom: 4px solid ${theme.colors.primaryColor};
          }
          thead th.sortable {
            cursor: pointer;
          }

          tbody tr td {
            padding: 0.875rem;
            border-bottom: 1px solid ${theme.colors.baseColorLight};
            font-size: 0.9rem;
          }

          tbody tr {
            background: #fff;
            ${onRowClick && 'cursor: pointer'}
          }

          ${onRowClick &&
          `tbody tr:hover {
            background: ${theme.colors.primaryLite};
          }`}
        `}
      </style>
    </table>
  )
}
