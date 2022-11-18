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
            letter-spacing: 0.0125rem;
          }
        `}
      </style>
    </h3>
  )
}
