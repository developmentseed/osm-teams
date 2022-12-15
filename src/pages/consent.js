import React, { Component } from 'react'
import Button from '../components/button'
import Link from 'next/link'

class Consent extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        user: query.user,
        client: query.client,
        challenge: query.challenge,
        requested_scope: query.requested_scope,
      }
    }
  }

  render() {
    const { user, client, requested_scope, challenge } = this.props

    if (!client) {
      return (
        <div className='page inner'>
          Invalid parameters, go back <Link href='/'>home</Link>?
        </div>
      )
    }

    const clientDisplayName = client.client_name || client.client_id
    return (
      <section className='page inner'>
        <form method='post'>
          <input type='hidden' value={challenge} name='challenge' />
          <p>
            Hi, {user}, <strong>{clientDisplayName}</strong> wants to access
            resources on your behalf and needs the following permissions:
          </p>
          {requested_scope.map((scope) => {
            let scopeLabel = ''
            switch (scope) {
              case 'clients': {
                scopeLabel = 'Read and update your OAuth clients'
                break
              }
              case 'offline': {
                scopeLabel = 'Offline access to your profile'
                break
              }
              case 'openid': {
                scopeLabel = 'Your user profile information'
                break
              }
              default: {
                scopeLabel = 'Unknown scope'
                break
              }
            }
            return (
              <div key={scope}>
                <input
                  type='checkbox'
                  readOnly='readonly'
                  checked='checked'
                  id={scope}
                  value={scope}
                  name='grant_scope'
                />
                <label htmlFor={scope}>{scopeLabel}</label>
                <br />
              </div>
            )
          })}
          <p>
            Do you want to be asked next time when this application wants to
            access your data? The application will not be able to ask for more
            permissions without your consent.
          </p>
          <ul>
            {client.client_policy ? (
              <li>
                <Link href={client.client_policy}>Policy</Link>
              </li>
            ) : (
              <div />
            )}
            {client.tos_uri ? (
              <li>
                <Link href={client.tos_uri}>Terms of Service</Link>
              </li>
            ) : (
              <div />
            )}
          </ul>
          <p>
            <input type='checkbox' id='remember' name='remember' value='1' />
            <label htmlFor='remember'>Do not ask me again</label>
          </p>
          <p>
            <Button
              type='submit'
              variant='primary'
              id='accept'
              name='submit'
              value='Allow access'
            >
              Allow Access
            </Button>
            <Button
              type='submit'
              variant='danger'
              id='reject'
              name='submit'
              value='Deny access'
            >
              Deny Access
            </Button>
          </p>
        </form>
        <style jsx>
          {`
            label {
              padding-left: 1rem;
            }

            ul {
              list-style: none;
              padding: none;
            }

            li {
              margin-bottom: 1rem;
            }
          `}
        </style>
      </section>
    )
  }
}

export default Consent
