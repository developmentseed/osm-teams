import React from 'react'
import theme from '../styles/theme'

export default function SectionHeader ({ children }) {
  return (
    <h1>
      {children}
      <style jsx>{`
          h1 {
            font-size: 2.75rem;
            font-weight: ${theme.typography.baseFontWeight};
          }
        `}
      </style>
    </h1>
  )
}
