import React from 'react'
import theme from '../styles/theme'

export default function Header ({ username, picture }) {
  return (
    <h2 className='flex items-center bb b--black-10 pb3'>
      <img src={picture} className='br2 h3 w3 dib' />
      <span className='pl3 flex-auto f2 black-70'>{username}</span>
      <style jsx global>{`
        h2 {
          color: ${theme.colors.primaryColor};
          font-family: ${theme.typography.headingFontFamily};
          font-weight: 400;
          font-size: 2.125rem;
          letter-spacing: 0.0125em;
        }
      `}</style>
    </h2>
  )
}
