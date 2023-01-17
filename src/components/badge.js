import React from 'react'

export default function Badge({ name, color, children }) {
  return (
    <span className='badge'>
      {children}
      {name}
      <style jsx>
        {`
          .badge {
            font-size: 0.75rem;
            background: ${color};
            display: inline-flex;
            align-items: center;
            padding: 0.125rem 0.5rem;
            border-radius: 999px;
            font-size: 12px;
            line-height: 1.5;
            white-space: nowrap;
            margin-right: 4px;
          }
        `}
      </style>
    </span>
  )
}
