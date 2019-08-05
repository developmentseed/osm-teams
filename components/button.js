import React from 'react'
import getConfig from 'next/config'
import join from 'url-join'
import theme from '../styles/theme'
import css from 'styled-jsx/css'

const { publicRuntimeConfig } = getConfig()

const style = css`
  .button {
    display: inline-block;
    font-family: ${theme.typography.monoFontFamily};
    font-size: ${theme.typography.rootFontSize};
    font-weight: ${theme.typography.baseFontWeight};
    text-transform: uppercase;
    letter-spacing: 0.125rem;
    padding: 0.75rem ${theme.layout.globalSpacing};
    color: ${theme.colors.primaryColor};
    border: 2px solid ${theme.colors.primaryColor};
    box-shadow: 2px 2px ${theme.colors.primaryColor};
    cursor: pointer;
    transition: box-shadow 0.12s ease;
  }
  .button:hover {
    opacity: 0.68;
    box-shadow: 0 0 ;
  }
  .button.primary {
    color: #FFFFFF;
    background: ${theme.colors.primaryColor};
    border: 2px solid #FFFFFF;
  }
  .button.disabled {
    backgroundColor: #777777;
    border: 2px solid #555;
    color: ${theme.colors.baseColor};
  }
  .button.danger {
    color: 'white';
    background: ${theme.colors.secondaryColor};
    border: 2px solid #FFFFFF;
  }
`

export default function Button ({ href, onClick, children, danger, small, disabled }) {
  let color = 'dark-green'
  let size = 'bw2 ph3 pv2 mb2'

  if (danger) {
    color = `${theme.colors.secondaryColor}`
    // box-shadow: `2px 2px ${theme.colors.primaryColor}`;
  }

  if (disabled) {
    color = 'near-gray'
  }

  if (small) {
    size = 'bw1 ph2 pv1 mb1'
  }

  const commonStyle = `${color} ${size} f6 link dim br1 ba dib pointer`

  if (disabled) {
    return <div className='button disabled' >{children}<style jsx>{style}</style></div>
  }

  if (href) {
    const fullUrl = join(publicRuntimeConfig.APP_URL, href)
    return <a href={fullUrl} className='button'>{children}<style jsx>{style}</style></a>
  }
  return <div onClick={onClick} className='button'>{children}<style jsx>{style}</style></div>
}
