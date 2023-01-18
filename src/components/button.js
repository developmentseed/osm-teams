import React from 'react'
import join from 'url-join'
import theme from '../styles/theme'
import css from 'styled-jsx/css'
import Link from 'next/link'

const URL = process.env.APP_URL

const ButtonStyles = css.global`
  .button {
    display: inline-flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
    vertical-align: middle;
    line-height: 1.5rem;
    font-size: 1rem;
    padding: 0.375rem 1rem;
    min-width: 2rem;
    min-height: 1rem;
    font-family: ${theme.typography.monoFontFamily};
    text-transform: uppercase;
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

  /* Button variations
   ========================================================================== */

  .button.primary {
    color: #ffffff;
    background: ${theme.colors.primaryColor};
    border: 2px solid transparent;
    box-shadow: 2px 2px #ffffff, 4px 4px ${theme.colors.primaryColor};
  }
  .button.secondary {
    color: ${theme.colors.primaryColor};
    background: ${theme.colors.primaryLite};
    box-shadow: 2px 2px #ffffff, 4px 4px ${theme.colors.primaryColor};
  }
  .button.flat {
    box-shadow: none;
    position: relative;
  }

  .borderless {
    border: none;
    box-shadow: none;
  }
  .transparent {
    background: transparent;
  }
  .unstyled {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  /* Button size modifiers
   ========================================================================== */

  /* XSmall (24px) */

  .button.xsmall,
  .button-group.xsmall .button {
    line-height: 1rem;
    font-size: 0.75rem;
    padding: 0.05rem 0.25rem;
    min-width: 1.5rem;
  }
  /* Small (24px) */

  .button.small,
  .button-group.small .button {
    line-height: 1.25rem;
    font-size: 0.875rem;
    padding: 0.125rem 0.5rem;
    min-width: 1.5rem;
  }

  /* Medium (32px)
   Default
*/

  .button.medium,
  .button-group.medium .button {
    line-height: 1.5rem;
    font-size: 1rem;
    padding: 0.25rem 1rem;
    min-width: 2rem;
  }

  /* Large (40px) */

  .button.large,
  .button-group.large .button {
    line-height: 1.5rem;
    font-size: 1rem;
    padding: 0.5rem 1.5rem;
    min-width: 2.5rem;
  }

  /* XLarge (48px) */

  .button.xlarge,
  .button-group.xlarge .button {
    line-height: 2rem;
    font-size: 1rem;
    padding: 0.5rem 2rem;
    min-width: 3rem;
  }

  .button.submit {
    background-color: ${theme.colors.primaryLite};
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

  div.disabled {
    pointer-events: none;
  }
`

export default function Button({
  name,
  id,
  value,
  variant,
  type,
  useIcon,
  disabled,
  href,
  onClick,
  children,
  className,
  flat,
  'data-cy': dataCy,
}) {
  let classes = [`button`, variant, className]
  if (disabled) classes.push('disabled')
  if (flat) classes.push('flat')
  let classNames = classes.join(' ')
  if (type === 'submit') {
    return (
      <button
        data-cy={dataCy}
        type='submit'
        className={classNames}
        disabled={disabled}
        name={name}
        id={id}
        onClick={onClick}
        value='value'
      >
        {children || value}
        <style jsx>{ButtonStyles}</style>
        <style jsx>{`
          .button {
            min-width: 1.75rem;
            min-height: 1.75rem;
          }
          .button::after {
            content: '';
            position: ${useIcon && 'absolute'};
            top: 0;
            left: 0;
            width: ${useIcon && '100%'};
            height: ${useIcon && '100%'};
            mask: ${useIcon
              ? `url(${join(URL, `/static/icon-${useIcon}.svg`)})`
              : 'none'};
            mask-repeat: no-repeat;
            mask-position: center;
            z-index: 2;
            background-color: ${useIcon
              ? theme.colors.primaryColor
              : 'initial'};
          }
        `}</style>
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
        <style jsx>{ButtonStyles}</style>
        <style jsx>{`
          .button {
            min-width: 1.75rem;
            min-height: 1.75rem;
          }
          .button::after {
            content: '';
            position: ${useIcon && 'absolute'};
            top: 0;
            left: 0;
            width: ${useIcon && '100%'};
            height: ${useIcon && '100%'};
            mask: ${useIcon
              ? `url(${join(URL, `/static/icon-${useIcon}.svg`)})`
              : 'none'};
            mask-repeat: no-repeat;
            mask-position: center;
            z-index: 2;
            background-color: ${useIcon
              ? theme.colors.primaryColor
              : 'initial'};
          }
        `}</style>
      </Link>
    )
  }
  return (
    <div
      data-cy={dataCy}
      onClick={onClick}
      className={classNames}
      disabled={disabled}
    >
      {children}
      <style jsx>{ButtonStyles}</style>
      <style jsx>{`
        .button {
          min-width: 1.75rem;
          min-height: 1.75rem;
        }
        .button::after {
          content: '';
          position: ${useIcon && 'absolute'};
          top: 0;
          left: 0;
          width: ${useIcon && '100%'};
          height: ${useIcon && '100%'};
          mask: ${useIcon
            ? `url(${join(URL, `/static/icon-${useIcon}.svg`)})`
            : 'none'};
          mask-repeat: no-repeat;
          mask-position: center;
          z-index: 2;
          background-color: ${useIcon ? theme.colors.primaryColor : 'initial'};
        }
      `}</style>
    </div>
  )
}
