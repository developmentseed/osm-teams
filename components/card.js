import React from 'react'
import theme from '../styles/theme'

export default function Card ({ children }) {
  return (
    <section>
      {children}
      <style jsx>
        {`
          background: #fff;
          padding: calc(${theme.layout.globalSpacing} * 2);
          border: 1px solid ${theme.colors.primaryLite};
          box-shadow: 4px 4px ${theme.colors.primaryColor};
        `}
      </style>
    </section>
  )
}
