import React from 'react'
import join from 'url-join'
import theme from '../styles/theme'
import css from 'styled-jsx/css'
import Link from 'next/link'

const URL = process.env.APP_URL

const style = css.global`
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
    background: #ffffff;
    background-repeat: no-repeat;
    background-position: center;
    color: ${theme.colors.primaryColor};
    box-shadow: 2px 2px #ffffff, 4px 4px ${theme.colors.primaryColor};
    border: 2px solid ${theme.colors.primaryColor};
  }

  .button:hover,
  .button.primary:hover,
  .button.submit:hover,
  .button.danger:hover {
    opacity: 0.68;
    box-shadow: 0 0;
  }

  .button.primary {
    color: #ffffff;
    background: ${theme.colors.primaryColor};
    border: none;
    box-shadow: 2px 2px #ffffff, 4px 4px ${theme.colors.primaryColor};
  }
  .button.small {
    padding: 0.5rem ${theme.layout.globalSpacing};
    font-size: 0.875rem;
  }

  .button.submit {
    background: ${theme.colors.primaryLite};
  }

  .button.disabled {
    backgroundcolor: #777777;
    border: 2px solid #555;
    color: ${theme.colors.baseColor};
    transition: none;
    opacity: 0.68;
    box-shadow: 0 0;
    cursor: not-allowed;
  }

  .button.danger {
    color: ${theme.colors.baseColor};
    box-shadow: 2px 2px #ffffff, 4px 4px ${theme.colors.secondaryColor};
    border-color: ${theme.colors.secondaryColor};
  }

  .button.fixed-size {
    width: 200px;
  }
`

export default function Button({
  name,
  id,
  value,
  variant,
  type,
  disabled,
  href,
  onClick,
  children,
  size,
  className,
  flat,
}) {
  let classes = [`button`, variant, size, className]
  if (disabled) classes.push('disabled')
  let classNames = classes.join(' ')
  if (type === 'submit') {
    return (
      <button
        type='submit'
        className={classNames}
        disabled={disabled}
        name={name}
        id={id}
        onClick={onClick}
        value='value'
      >
        {children || value}
        <style jsx>{style}</style>
      </button>
    )
  }
  if (href) {
    return (
      <Link
        href={href}
        className={classNames}
        disabled={disabled}
        name={name}
        id={id}
      >
        {children || value}
        <style jsx>{style}</style>
      </Link>
    )
  }
  return (
    <div onClick={onClick} className={classNames} disabled={disabled}>
      {children}
      <style jsx>{style}</style>
      <style jsx>{`
        .button {
          box-shadow: ${flat && 'none'};
          border: ${flat && 'none'};
          background-image: ${type === 'close' &&
          `url(${join(URL, '/static/icon-close.svg')})`};
        }
      `}</style>
    </div>
  )
}
