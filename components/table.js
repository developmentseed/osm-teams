import React from 'react'

function TableHead ({ columns }) {
  return (
    <thead className=''>
      <tr className=''>
        {columns.map((column) => {
          return (
            <th
              key={`column-${column.key}`}
              className='fw6 bb b--black-20 tl pb2 ph3 bg-white ttc'
              onClick={() => {
                column.onClick && column.onClick()
              }}
            >
              {column.key}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

function Row ({ columns, row, index, onRowClick }) {
  return (
    <tr
      className={onRowClick && 'pointer hover-bg-near-white'}
      onClick={() => {
        onRowClick && onRowClick(row, index)
      }}
    >
      {columns.map(({ key }) => {
        return (
          <td
            key={`row-${index}-key-${key}`}
            className='pl3 pv3 pr3 bb b--black-20'
          >
            {row[key]}
          </td>
        )
      })}
    </tr>
  )
}

function TableBody ({ columns, rows, onRowClick }) {
  return (
    <tbody className='lh-copy'>
      {
        rows.map((row, index) => {
          return (
            <Row
              key={`row-${index}`}
              columns={columns}
              row={row}
              index={index}
              onRowClick={onRowClick}
            />
          )
        })
      }
    </tbody>
  )
}

export default function Table ({ columns, rows, onRowClick }) {
  return (
    <table className='collapse f6 w-100 mw8 center'>
      <TableHead columns={columns} />
      <TableBody columns={columns} rows={rows} onRowClick={onRowClick} />
    </table>
  )
}
