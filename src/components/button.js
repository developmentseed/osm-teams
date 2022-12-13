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
    min-width: 1rem;
    min-height: 1rem;
    font-family: ${theme.typography.monoFontFamily};
    text-transform: uppercase;
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
  useIcon,
  disabled,
  href,
  onClick,
  children,
  className,
  flat,
}) {
  let classes = [`button`, variant, className]
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
          background-image: ${useIcon
            ? `url(${join(URL, `/static/icon-${useIcon}.svg`)})`
            : 'none'};
          min-height: ${useIcon && '1.75rem'};
          min-width: ${useIcon && '1.75rem'};
        }
      `}</style>
    </div>
  )
}
