import React from 'react'
import theme from '../styles/theme'

export function TeamDetailSmall ({ id, name, hashtag }) {
  return (
    <li key={id} className='team--detail'>
      <div>
        <span>{name}</span>
        <div>{hashtag}</div>
      </div>
      <style jsx>{`
        .team--detail {
          list-style: none;
        }
        span {
          font-size: 1.24rem;
          color: ${theme.colors.primaryColor};
        }
        `}
      </style>
    </li>
  )
}
