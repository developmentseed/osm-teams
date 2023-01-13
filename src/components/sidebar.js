import React, { Fragment } from 'react'
import css from 'styled-jsx/css'
import join from 'url-join'
import theme from '../styles/theme'
import NavLink from '../components/Link'
import NextLink from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import Button from './button'

const URL = process.env.APP_URL

const sidebarStyles = css.global`
  .page__sidebar {
    grid-area: sidebar;
    top: 0;
    position: sticky;
    z-index: 100;
    background-color: ${theme.colors.primaryColor};
    color: white;
    display: flex;
    flex-flow: row nowrap;
    flex: 1;
    margin: 0;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    z-index: 1001;
  }

  .page__title {
    font-size: ${theme.typography.baseFontSize};
    max-width: 12rem;
  }

  .page__title a,
  .page__title a:visited {
    font-size: ${theme.typography.baseFontSize};
    text-transform: uppercase;
    color: ${theme.colors.secondaryColor};
    font-weight: bold;
    letter-spacing: 0.1rem;
  }

  .page__title img {
    vertical-align: middle;
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

  .global-menu__link,
  .global-menu__link:visited {
    color: ${theme.colors.primaryColor};
    padding: 1.25rem;
    display: inline-block;
    text-align: center;
    white-space: nowrap;
    font-family: ${theme.typography.headingFontFamily};
    font-size: 0.8rem;
    line-height: 1rem;
    text-transform: uppercase;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 40%;
  }

  .global-menu li {
    line-height: 1;
  }

  .global-menu__link.active {
    background-color: ${theme.colors.primaryDark};
  }

  .global-menu__link.login {
    text-align: center;
    background: white;
  }
  .global-menu__link:active {
    background-color: rgba(244, 244, 244, 0.1);
  }

  .global-menu__link--make {
    background-image: url(${join(URL, '/static/icon-teams.svg')});
  }

  .global-menu__link--profile {
    background-image: url(${join(URL, '/static/icon-profile.svg')});
  }

  .global-menu__link--app {
    background-image: url(${join(URL, '/static/icon-gear.svg')});
  }

  .global-menu__link--explore {
    background-image: url(${join(URL, '/static/icon-globe.svg')});
  }

  .global-menu__link--developers {
    background-image: url(${join(URL, '/static/icon-code.svg')});
  }

  .global-menu__link--about {
    background-image: url(${join(URL, '/static/icon-info.svg')});
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
      max-height: 100vh;
      align-items: center;
      justify-content: flex-start;
    }

    .page__headline {
      margin: 2rem 0;
    }

    .page__sidebar nav {
      flex: 1;
      flex-flow: column nowrap;
    }

    .global-menu li {
      max-height: 4rem;
    }

    .global-menu__link {
      padding: 2rem;
      background-size: initial;
    }

    .global-menu__link.login {
      transform: rotate(-90deg) translateX(2rem);
    }

    .global-menu {
      flex-flow: column nowrap;
    }

    .global-menu > li {
      margin-bottom: 1.5rem;
      margin-right: 0;
    }
  }
  @media screen and (min-width: ${theme.mediaRanges.large}) {
    .page__sidebar {
      align-items: baseline;
      overflow: hidden;
    }

    .page__sidebar nav {
      width: 100%;
    }

    .global-menu {
      align-items: baseline;
    }

    .global-menu > li {
      width: 100%;
    }

    .global-menu__link {
      display: block;
      text-align: left;
      background-position: 12% 50%;
      padding: 1.5rem 1rem;
    }

    .global-menu__link span {
      display: inline-block;
      margin-left: 3rem;
    }
    .global-menu__link.login {
      transform: none;
      margin-bottom: 2rem;
    }
  }
`

export default function Sidebar() {
  const { status } = useSession()

  const isAuthenticated = status === 'authenticated'

  const additionalMenuItems = (
    <Fragment>
      <li>
        <NavLink href='/teams/create'>
          <div
            className='global-menu__link global-menu__link--make'
            title='Make New Team'
          >
            <span>Make New Team</span>
          </div>
        </NavLink>
      </li>
      <li>
        <NavLink href='/profile'>
          <div
            className='global-menu__link global-menu__link--profile'
            title='Visit Your Profile'
          >
            <span>Profile</span>
          </div>
        </NavLink>
      </li>
      <li>
        <NavLink href='/clients'>
          <div
            className='global-menu__link global-menu__link--app'
            title='Connect new app'
          >
            <span>Connect a new app</span>
          </div>
        </NavLink>
      </li>
    </Fragment>
  )
  return (
    <div className='page__sidebar'>
      <div className='page__headline'>
        <h1 className='page__title'>
          <NextLink href='/' title='Visit the home page'>
            <img src={join(URL, '/static/TeamsLogo_reverse.svg')} />
          </NextLink>
        </h1>
      </div>
      <nav role='navigation'>
        <ul className='global-menu'>
          <li>
            <NavLink href='/teams'>
              <div
                className='global-menu__link global-menu__link--explore'
                title='Explore all Teams'
              >
                <span>Explore Teams</span>
              </div>
            </NavLink>
          </li>
          {isAuthenticated ? additionalMenuItems : <Fragment />}
          <li>
            <NavLink href='/developers'>
              <div
                className='global-menu__link global-menu__link--developers'
                title='Visit Developers Page'
              >
                <span>Developer guide</span>
              </div>
            </NavLink>
          </li>
        </ul>
        {isAuthenticated ? (
          <Button className='global-menu__link login' onClick={signOut}>
            Log Out
          </Button>
        ) : (
          <Button
            className='global-menu__link login'
            onClick={() => signIn('osm-teams')}
          >
            Sign in
          </Button>
        )}
      </nav>
      <style jsx>{sidebarStyles}</style>
    </div>
  )
}
