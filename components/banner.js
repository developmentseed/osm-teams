import React from 'react'
import theme from '../styles/theme'

export default function PageBanner ({ content, variant }) {
  return (
    <div>
      <p>{content}
      </p>
      <style jsx>
        {`
          div {
            display: flex;
            align-items: center;
            padding: 1rem 0.5rem;
            border-bottom: 4px solid ${variant === 'warning' ? `${theme.colors.secondaryColor}` : `${theme.colors.primaryColor}`};
          }
          
          p {
            font-size: 0.85rem;
            font-family: ${theme.typography.headingFontFamily};
            text-transform: uppercase;
            margin: 0;
          }
        `}
      </style>
    </div>
  )
}
