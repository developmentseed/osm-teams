import React from 'react'
import { isEmpty } from 'ramda'
import theme from '../styles/theme'

export default function ProfileModal ({ user, attributes }) {
  let profileContent = <dl>User does not have a profile</dl>
  if (!isEmpty(attributes)) {
    profileContent = <>
      <dl>
        {
          attributes && attributes.map(attribute => {
            if (attribute.value) {
              return (
                <>
                  <dt>{attribute.name}:</dt>
                  <dd>{attribute.value}</dd>
                </>
              )
            }
          })
        }
      </dl>
      <style jsx>{`
            dl {
              line-height: calc(${theme.layout.globalSpacing} * 1.5);
              display: flex;
              flex-flow: row wrap;
              margin-bottom: 2rem;
            }

            dt {
              font-family: ${theme.typography.headingFontFamily};
              text-transform: uppercase;
              flex-basis: 40%;
              margin-right: ${theme.layout.globalSpacing};
            }

            dd {
              margin: 0;
              flex-basis: 50%;
              flex-grow: 1;
              align-self: center;
              margin-bottom: ${theme.layout.globalSpacing};
            }
  `}</style>
    </>
  }
  return <article className='modal__details'>
    { user.img ? <img src={user.img}></img> : '' }
    <h2>{user.name} </h2>
    {profileContent}
  </article>
}
