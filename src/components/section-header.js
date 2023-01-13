import React from 'react'
import theme from '../styles/theme'

export default function SectionHeader({ children }) {
  return (
    <h3>
      {children}
      <style jsx>
        {`
          h3 {
            color: ${theme.colors.primaryColor};
            font-family: ${theme.typography.headingFontFamily};
            font-weight: ${theme.typography.baseFontWeight};
            text-transform: uppercase;
            letter-spacing: 0.75px;
            margin-bottom: 0.5rem;
          }
        `}
      </style>
    </h3>
  )
}
