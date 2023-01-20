import React from 'react'
import theme from '../styles/theme'

const hexToRgb = (hex) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => '#' + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))
    .join()

export default function Badge({ name, color, dot, children }) {
  let classes = [`badge`]
  if (dot) classes.push('dot')
  let classNames = classes.join(' ')
  return (
    <span className={classNames}>
      {children}
      {name}
      <style jsx>
        {`
          .badge {
            display: inline-flex;
            align-items: center;
            font-size: 0.75rem;
            background: rgba(${hexToRgb(color)}, 0.125);
            padding: 0.125rem 0.5rem;
            border-radius: 999px;
            box-shadow: 0 0 0 1px ${theme.colors.primaryLite};
            font-size: 12px;
            white-space: nowrap;
            margin-right: 4px;
            line-height: initial;
            position: relative;
            overflow: hidden;
          }
          .badge.dot::before {
            content: '';
            background-color: ${color};
            box-shadow: 0 0 0 1px ${theme.colors.primaryLite};
            height: 0.5rem;
            width: 0.5rem;
            border-radius: 999px;
            margin-right: 0.25rem;
          }
        `}
      </style>
    </span>
  )
}
