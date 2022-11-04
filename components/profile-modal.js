import React from 'react'
import { isEmpty } from 'ramda'
import theme from '../styles/theme'
import Popup from 'reactjs-popup'
import Button from './button'
import SvgSquare from '../components/svg-square'

function renderActions (actions) {
  return (
    <Popup
      trigger={<span style={{ cursor: 'pointer' }}>⚙️</span>}
      position='left top'
      on='click'
      closeOnDocumentClick
      contentStyle={{ padding: '10px', border: 'none' }}
    >
      <ul>
        {actions.map(action => {
          return <li
            onClick={() => action.onClick()}
            key={action.name}>{action.name}</li>
        })}
      </ul>
      <style jsx>
        {`
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            li {
              padding-left: 0.5rem;
              font-size: 1rem;
              cursor: pointer;
            }

            li:hover {
              color: ${theme.colors.secondaryColor};
            }
          `}
      </style>
    </Popup>
  )
}

function renderBadges (badges) {
  if (!badges || badges.length === 0) {
    return null
  }

  return (
    <table>
      {badges.map((b) => (
        <tr key={b.color}>
          <td>
            <SvgSquare color={b.color} />
          </td>
          <td>{b.name}</td>
        </tr>
      ))}
    </table>
  )
}

export default function ProfileModal ({
  user,
  attributes,
  badges,
  onClose,
  actions
}) {
  actions = actions || []
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
  return (
    <article className='modal__details'>
      {user.img ? <img src={user.img} /> : ''}
      <h2 style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{user.name}</span>
        {!isEmpty(actions) && renderActions(actions)}
      </h2>
      {profileContent}
      {renderBadges(badges)}
      <Button size='small' onClick={() => onClose()}>
        close
      </Button>
    </article>
  )
}
