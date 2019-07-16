import React from 'react'

export default function Header ({ user, picture }) {
  return (
    <h2 className='flex items-center bb b--black-10 pb3'>
      <img src={picture} className='br2 h3 w3 dib' />
      <span className='pl3 flex-auto f2 black-70'>{user}</span>
    </h2>
  )
}
