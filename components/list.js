import React from 'react'

const Item = ({ item, children }) => {
  return (
    <a
      className='flex mb2 no-underline black nl2 ph2 pv3 hover-bg-light-gray pointer'
      href={item.href}
      as={item.as || item.href}
    >
      {children(item)}
    </a>
  )
}

export default function List ({ items, children }) {
  return (
    <div>
      {items.map((item) => {
        return (<Item item={item}>{children}</Item>)
      })}
    </div>
  )
}
