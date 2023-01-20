import React, { useRef } from 'react'
import css from 'styled-jsx/css'
import { isEmpty } from 'ramda'
import theme from '../styles/theme'
import Popup from 'reactjs-popup'
import Button from './button'
import SvgSquare from '../components/svg-square'

const ModalStyles = css`
  .modal__body {
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    gap: 1rem;
    width: 100%;
  }
  .modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: sticky;
    top: -2rem;
    background: white;
    padding-top: 2rem;
    margin-top: -2rem;
  }
  .user__item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .user__item h3 {
    font-weight: bold;
  }
  .user__item figure {
    position: relative;
    height: 3rem;
    overflow: hidden;
    margin: 0;
    border-radius: 0.25rem;
    aspect-ratio: 1 / 1;
    background: rgba(23, 23, 23, 0.08);
  }
  .user__item figure:before {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    content: '';
    box-shadow: inset 0 0 0 1px rgba(23, 23, 23, 0.24);
    border-radius: 0.25rem;
    pointer-events: none;
  }
  .user__item figure > * {
    position: relative;
    height: 100%;
    width: 100%;
    z-index: 1;
    object-fit: cover;
  }
`
const popupStyles = css`
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
    background: ${theme.colors.baseColorLight};
    color: ${theme.colors.secondaryColor};
  }
`

function renderActions(actions) {
  return (
    <Popup
      trigger={
        <span
          className='button'
          style={{
            cursor: 'pointer',
            alignSelf: 'start',
            fontSize: '0.875rem',
          }}
        >
          Edit user access
        </span>
      }
      position='bottom left'
      on='click'
      closeOnDocumentClick
      contentStyle={{ padding: '10px', width: '250px', border: 'none' }}
    >
      <ul>
        {actions.map((action) => {
          return (
            <li onClick={() => action.onClick()} key={action.name}>
              {action.name}
            </li>
          )
        })}
      </ul>
      <style jsx>{popupStyles}</style>
    </Popup>
  )
}

function renderBadges(badges) {
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

export default function ProfileModal({
  user,
  attributes,
  badges,
  onClose,
  actions,
}) {
  actions = actions || []
  let profileContent = <dl>User does not have a profile</dl>
  if (!isEmpty(attributes)) {
    profileContent = (
      <>
        <dl>
          {attributes &&
            attributes.map((attribute) => {
              if (attribute.value) {
                return (
                  <>
                    <dt>{attribute.name}:</dt>
                    <dd>{attribute.value}</dd>
                  </>
                )
              }
            })}
        </dl>
        <style jsx>{`
          dl {
            display: grid;
            grid-template-columns: 4rem 1fr;
            grid-gap: 0.25rem 1rem;
          }

          dt {
            font-family: ${theme.typography.headingFontFamily};
            text-transform: uppercase;
          }
        `}</style>
      </>
    )
  }
  const ref = useRef()
  return (
    <article className='modal__body'>
      <div className='modal__header'>
        <div className='user__item'>
          {user.image ? (
            <figure>
              <img src={user.image} />
            </figure>
          ) : (
            <figure>
              <img />
            </figure>
          )}
          <h3>{user.name}</h3>
        </div>
        <Button
          flat
          useIcon='close'
          variant='small'
          onClick={() => onClose()}
        />
      </div>
      {!isEmpty(actions) && renderActions(actions, ref)}
      {profileContent}
      {renderBadges(badges)}
      <style jsx>{ModalStyles}</style>
    </article>
  )
}
