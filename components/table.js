import React from 'react'

const Row = ({ item, children }) => {
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

export default function Table ({ items, children }) {
  return (
    <div>
      {items.map((item) => {
        return (<Row item={item}>{children}</Row>)
      })}
    </div>
  )
}
