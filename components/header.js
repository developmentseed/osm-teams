import React from 'react'
import join from 'url-join'
import getConfig from 'next/config'
import theme from '../styles/theme'
const { publicRuntimeConfig } = getConfig()

export default function Header ({ uid, username, picture }) {
  return (
    <header className='header'>
      <div className='inner'>
        <i className='fas fa-bars header__men' />
        <h1 className='header__page-title hidden'><a href='/'>Teams</a></h1>
        {
          uid
            ? <a href='#' className='user__heading'>
              <img src={picture} className='user__heading-avatar' />
              <h2 className='user__heading-username'>{username}</h2>
            </a>
            : <a className='user__heading' href={join(publicRuntimeConfig.APP_URL, 'login')}>Login</a>
        }
      </div>
      <style jsx global>{`
        .header {
          grid-area: header;
        }

        .header .inner {
          display: flex;
          flex-flow: row nowrap;
          justify-content: space-between;
          align-items: center;
          padding: ${theme.layout.globalSpacing} 0;
          min-height: 5rem;
        }

        .header__page-title a {
          color: ${theme.colors.secondaryColor};
          font-family: ${theme.typography.headingFontFamily};
          font-size: ${theme.typography.baseFontSize};
          font-weight: ${theme.typography.baseFontWeight};
          text-transform: uppercase;
          vertical-align: middle;
        }

        .header__input {
          outline: none;
          border: none;
          margin-left: ${theme.layout.globalSpacing};
          padding: 0.25rem 0;
          background: transparent;
          border-bottom: 1px inset ${theme.colors.baseColorLight};
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        .header__input:focus,
        .header__input:active {
          border-bottom: 1px inset ${theme.colors.primaryColor};
        }

        .user__heading {
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          margin-right: calc(${theme.layout.globalSpacing} * 2);
          margin-left: auto;
        }

        .user__heading-username {
          position: relative;
          color: ${theme.colors.primaryColor};
          font-family: ${theme.typography.headingFontFamily};
          font-size: ${theme.typography.baseFontSize};
          font-weight: ${theme.typography.baseFontWeight};
          letter-spacing: 0.0125rem;
          margin-left: ${theme.layout.globalSpacing};
        }

        .user__heading-username:after{
          position: absolute;
          content: "";
          width: 8px;
          height: 8px;
          background: none;
          border-left: 2px solid ${theme.colors.primaryColor};
          border-bottom: 2px solid ${theme.colors.primaryColor};
          transform: rotate(-45deg) translateY(-50%);
          top: 36%;
          right: -1rem;
        }

        .user__heading-avatar {
          border-radius: 50%;
          width: 3rem;
          height: 3rem;
        }

        @media screen and (min-width: ${theme.mediaRanges.small}) {
          .header {
            border-bottom: 4px solid ${theme.colors.primaryColor};
          }
        }
      `}
      </style>
    </header>
  )
}
