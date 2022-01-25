import React from 'react'
import getConfig from 'next/config'
import join from 'url-join'
import theme from '../styles/theme'
import css from 'styled-jsx/css'

const { publicRuntimeConfig } = getConfig()

const style = css`
  .button {
    display: inline-block;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    line-height: 1.5rem;
    font-size: 1rem;
    min-width: 2rem;
    font-family: ${theme.typography.monoFontFamily};
    font-weight: ${theme.typography.baseFontWeight};
    text-transform: uppercase;
    letter-spacing: 0.125rem;
    padding: 0.75rem calc(${theme.layout.globalSpacing} * 2);
    cursor: pointer;
    transition: all 0.2s ease;
    /* Default Colors */
    background: #FFFFFF;
    color: ${theme.colors.primaryColor};
    box-shadow: 2px 2px #FFFFFF, 4px 4px ${theme.colors.primaryColor};
    border: 2px solid ${theme.colors.primaryColor};
  }

  .button:hover,
  .button.primary:hover,
  .button.submit:hover,
  .button.danger:hover {
    opacity: 0.68;
    box-shadow: 0 0 ;
  }

  .button.primary {
    color: #FFFFFF;
    background: ${theme.colors.primaryColor};
    border: none;
    box-shadow: 2px 2px #FFFFFF,
                4px 4px ${theme.colors.primaryColor};
  }
  .button.small {
    padding: 0.5rem ${theme.layout.globalSpacing};
    font-size: 0.875rem;
  }

  .button.submit {
    background: ${theme.colors.primaryLite};
  }

  .button.disabled {
    backgroundColor: #777777;
    border: 2px solid #555;
    color: ${theme.colors.baseColor};
    transition: none;
    opacity: 0.68;
    box-shadow: 0 0;
    cursor: not-allowed;
  }

  .button.danger {
    color: ${theme.colors.baseColor};
    box-shadow: 2px 2px #FFFFFF,
                4px 4px ${theme.colors.secondaryColor};
    border-color: ${theme.colors.secondaryColor};
  }

  .button.fixed-size {
    width: 200px;
  }
`

export default function Button ({ name, id, value, variant, type, disabled, href, onClick, children, size }) {
  let classes = [`button`, variant, size]
  if (disabled) classes.push('disabled')
  let classNames = classes.join(' ')
  if (type === 'submit') {
    return <button type='submit' className={classNames} disabled={disabled} name={name} id={id} onClick={onClick} value='value'>{children || value}<style jsx>{style}</style></button>
  }
  if (href) {
    let fullUrl
    (href.startsWith('http')) ? (fullUrl = href) : (fullUrl = join(publicRuntimeConfig.APP_URL, href))
    return <a href={fullUrl} className={classNames} disabled={disabled} name={name} id={id}>{children}<style jsx>{style}</style></a>
  }
  return <div onClick={onClick} className={classNames} disabled={disabled}>{children}<style jsx>{style}</style></div>
}
