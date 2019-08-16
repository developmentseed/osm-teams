import React, { Component, Fragment } from 'react'
import join from 'url-join'
import getConfig from 'next/config'
import Router from 'next/router'
import theme from '../styles/theme'

const { publicRuntimeConfig } = getConfig()

class Sidebar extends Component {
  render () {
    const { uid } = this.props

    const additionalMenuItems = (
      <Fragment>
        <li>
          <a href={join(publicRuntimeConfig.APP_URL, '/teams/create')} className='global-menu__link global-menu__link--make' title='Make New Team'>
            <span>Make New Team</span>
          </a>
        </li>
        <li>
          <a href={join(publicRuntimeConfig.APP_URL, '/profile')} className='global-menu__link global-menu__link--profile' title='Visit Your Profile'>
            <span>Profile</span>
          </a>
        </li>
        <li>
          <a href={join(publicRuntimeConfig.APP_URL, '/clients')} className='global-menu__link global-menu__link--app' title='Connect new app'>
            <span>Connect a new app</span>
          </a>
        </li>
      </Fragment>
    )
    return (
      <div className='page__sidebar'>
        <div className='page__headline'>
          <h1 className='page__title'><a href='/' title='Visit the home page'>Teams</a></h1>
        </div>
        <nav>
          <ul className='global-menu' role='navigation'>
            <li>
              <a href={join(publicRuntimeConfig.APP_URL, '/teams')} className='global-menu__link global-menu__link--explore' title='Explore all Teams'>
                <span>Explore Teams</span>
              </a>
            </li>
            {
              uid ? additionalMenuItems : <Fragment />
            }
            <li>
              <a href={join(publicRuntimeConfig.APP_URL, '/developers')} className='global-menu__link global-menu__link--developers' title='Visit Developers Page'>
                <span>For Developers</span>
              </a>
            </li>
            <li>
              <a href={join(publicRuntimeConfig.APP_URL, '/about')} className='global-menu__link global-menu__link--about' title='Visit About Page'>
                <span>About</span>
              </a>
            </li>

          </ul>
          {
            uid
              ? <a className='global-menu__link login danger' onClick={() => {
                window.sessionStorage.clear()
                Router.push('/logout')
              }
              }>Log Out</a>
              : <a className='global-menu__link login' href='/login'>Sign in</a>
          }
        </nav>
        <style jsx global>
          {`
            .page__sidebar {
              grid-area: sidebar;
              background-color: ${theme.colors.primaryColor};
              color: white;
              display: flex;
              flex-flow: row nowrap;
              flex: 1;
              margin: 0;
              align-items: center;
              justify-content: space-between;
              overflow: hidden;
            }
            .page__title {
              margin: 0 1rem;
              font-size: ${theme.typography.baseFontSize};
            }
            .page__title a,
            .page__title a:visited {
              font-size: ${theme.typography.baseFontSize};
              text-transform: uppercase;
              color: ${theme.colors.secondaryColor};
              font-weight: bold;
              letter-spacing: 0.1rem;
            }

            .page__sidebar nav {
              display: flex;
            }

            .global-menu {
              flex-flow: row nowrap;
              margin-block-start: 0;
              margin-block-end: 0;
              padding-inline-start: 0;
              flex: 1;
              display: flex;
              list-style: none;
              margin: 0;
              padding: 0;
              align-items: center;
            }

            .global-menu > li{
              margin-right: 0.75rem;
            }

            .global-menu__link,
            .global-menu__link:visited {
              color: ${theme.colors.primaryColor};
              padding: 1rem;
              display: inline-block;
              line-height: 1rem;
              text-align: center;
              white-space: nowrap;
              font-family: ${theme.typography.headingFontFamily};
              font-size: 0.8rem;
              line-height: 1rem;
              text-transform: uppercase;
              background-repeat: no-repeat;
              background-position: center;
            }

            .global-menu__link.login {
              background: white;
              height: 5rem;
              line-height: 3rem;
            }
            .global-menu__link:active {
              background-color: rgba(244,244,244,0.1);
            }

            .global-menu__link--make {
              background-image: url('../static/icon-teams.svg');
            }

            .global-menu__link--profile {
              background-image: url('../static/icon-profile.svg');
            }

            .global-menu__link--app {
              background-image: url('../static/icon-gear.svg');
            }

            .global-menu__link--explore {
              background-image: url('../static/icon-globe.svg');
            }

            .global-menu__link--developers {
              background-image: url('../static/icon-code.svg');
            }

            .global-menu__link--about {
              background-image: url('../static/icon-info.svg');
            }

            .global-menu__link span {
              display: none;
              color: white;
              font-size: 0.75rem;
              text-align: center;
              font-family: ${theme.typography.headingFontFamily};
              transition: opacity 0.2s ease;
            }

            .global-menu__link:hover span {
              opacity: 1;
            }
            @media screen and (min-width: ${theme.mediaRanges.small}) {
              .page__sidebar {
                flex-flow: column nowrap;
                align-items: center;
                justify-content: flex-start;
              }

              .page__headline {
                margin: 2rem 0;
              }

              .page__sidebar nav {
                flex-flow: column nowrap;
              }

              .global-menu__link {
                padding: 1.25rem 1rem;
              }

              .global-menu__link.login {
                line-height: 1rem;
                height: initial;
              }

              .global-menu {
                flex-flow: column nowrap;
              }

              .global-menu > li {
                margin-bottom: 1.5rem;
                margin-right: 0
              }
            }
            @media screen and (min-width: ${theme.mediaRanges.large}) {
              .page__sidebar {
                align-items: baseline;
              }

              .page__sidebar nav {
                width: 100%;
              }

              .global-menu {
                align-items: baseline;
                margin-left: 1.25rem;
              }

              .global-menu__link span {
                display: inline-block;
                margin-left: 2rem;
              }

              .global-menu__link {
                background-position: left;
                padding: 1rem;
              }
            }
          `}
        </style>
      </div>
    )
  }
}

export default Sidebar
