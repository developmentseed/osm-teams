import React from 'react'

export function TeamDetailSmall ({ id, name, hashtag }) {
  return (
    <li key={id} className='flex'>
      <div className='flex-auto'>
        <span className='f5 tracked b'>{name}</span>
        <div className='f6'>{hashtag}</div>
      </div>
    </li>
  )
}
