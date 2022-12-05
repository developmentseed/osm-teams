import React from 'react'
import theme from '../styles/theme'

function TableHead({ columns }) {
  return (
    <thead className=''>
      <tr className=''>
        {columns.map((column) => {
          return (
            <th
              key={`column-${column.key}`}
              onClick={() => {
                column.onClick && column.onClick()
              }}
            >
              {column.label || column.key}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

function Row({ columns, row, index, onRowClick, showRowNumber, children }) {
  return (
    <tr
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
            {children || item}
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
  return (
    <tbody className='lh-copy'>
      {!rows || rows.length === 0 ? (
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
}) {
  showRowNumbers && columns.unshift({ key: ' ' })
  return (
    <table>
      <TableHead columns={columns} />
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
            margin-bottom: calc(${theme.layout.globalSpacing} * 4);
          }

          thead th {
            padding: 0 1rem 1rem;
            vertical-align: middle;
            position: relative;
            text-transform: uppercase;
            text-align: left;
            font-family: ${theme.typography.headingFontFamily};
            font-weight: ${theme.typography.baseFontWeight};
            font-size: 0.875rem 1rem;
            letter-spacing: 0.125rem;
            border-bottom: 4px solid ${theme.colors.primaryColor};
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
