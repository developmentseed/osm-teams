import React from 'react'
import theme from '../styles/theme'
import { rgba, darken } from 'polished'

export default function Label(props) {
  return (
    <span>
      {props.children}
      <style jsx>
        {`
          span {
            background-color: ${rgba(
              props.bgColor || theme.colors.primaryColor,
              0.16
            )};
            color: ${darken(
              0.16,
              props.bgColor || theme.colors.baseColorLight
            )};
            font-family: ${theme.typography.baseFontFamily};
            font-size: calc(${theme.typography.baseFontSize} * 0.75);
            font-weight: ${theme.typography.baseFontWeight};
            border-radius: ${theme.shape.rounded};
            padding: 4px 12px;
            line-height: 1;
            text-transform: uppercase;
            text-align: center;
            letter-spacing: 0.0125rem;
          }
        `}
      </style>
    </span>
  )
}

export function RoleLabel(props) {
  const roleBgColor = {
    member: theme.colors.primaryColor,
    moderator: theme.colors.infoColor,
    manager: theme.colors.infoColor,
    owner: theme.colors.secondaryColor,
  }
  console.log(props)
  return (
    <Label bgColor={roleBgColor[props.role.toLowerCase()]}>
      {props.children}
    </Label>
  )
}
