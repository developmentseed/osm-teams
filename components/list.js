import React from 'react'
import theme from '../styles/theme'

const Item = ({ item, children }) => {
  return (
    <a
      href={item.href}
      as={item.as || item.href}
    >
      {children(item)}
      <style jsx>
        {`
          a {
            display: flex;
            padding: 1rem 0.5rem;
            margin-left: -0.5rem;
            transition: all 0.24s ease !important;
          }
          a:hover {
            background: ${theme.colors.primaryLite};
          }
        `}
      </style>
    </a>
  )
}

export default function List ({ items, children }) {
  return (
    <div>
      {items.map((item, index) => {
        return (
          <Item
            key={`list-item-${index}`}
            item={item}
          >
            {children}
          </Item>
        )
      })}
    </div>
  )
}
