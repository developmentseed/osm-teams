import React, { Component } from 'react'
import Button from './button'
import Card from './card'
import theme from '../styles/theme'
import join from 'url-join'
import logger from '../lib/logger'

const APP_URL = process.env.APP_URL

function newClient({ client_id, client_name, client_secret }) {
  return (
    <ul>
      <li>
        <label>client_id: </label>
        {client_id}
      </li>
      <li>
        <label>client_name: </label>
        {client_name}
      </li>
      <li>
        <label>client_secret: </label>
        {client_secret}
      </li>
      <style jsx>
        {`
          ul {
            padding: 0;
          }

          li {
            list-style: none;
            font-family: ${theme.typography.headingFontFamily};
          }

          label {
            font-family: ${theme.typography.headingFontFamily};
            font-weight: bold;
          }
        `}
      </style>
    </ul>
  )
}

class Clients extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      redirectURI: '',
      clientName: '',
      newClient: null,
    }

    this.getClients = this.getClients.bind(this)
    this.createClient = this.createClient.bind(this)
    this.deleteClient = this.deleteClient.bind(this)
    this.refreshClients = this.refreshClients.bind(this)
    this.handleClientNameChange = this.handleClientNameChange.bind(this)
    this.handleClientCallbackChange = this.handleClientCallbackChange.bind(this)
  }

  async getClients() {
    let res = await fetch(join(APP_URL, '/api/clients'))
    if (res.status === 200) {
      return res.json()
    } else {
      throw new Error('Could not retrieve clients')
    }
  }

  async createClient(e) {
    e.preventDefault()
    let res = await fetch(join(APP_URL, '/api/clients'), {
      method: 'POST',
      body: JSON.stringify({
        client_name: this.state.clientName,
        redirect_uris: [this.state.redirectURI],
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
    let newClient = {}
    if (res.status === 200) {
      newClient = await res.json()
    } else {
      throw new Error('Could not create new client')
    }

    this.setState({ newClient: newClient.client, clientName: '' })
    await this.refreshClients()
  }

  async deleteClient(id) {
    await fetch(join(APP_URL, `/api/clients/${id}`), {
      method: 'DELETE',
    })
    await this.refreshClients()
  }

  handleClientNameChange(e) {
    this.setState({
      clientName: e.target.value,
    })
  }

  handleClientCallbackChange(e) {
    this.setState({
      redirectURI: e.target.value,
    })
  }

  async refreshClients() {
    try {
      let { clients } = await this.getClients()
      this.setState({
        clients,
        loading: false,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        clients: [],
        loading: false,
      })
    }
  }

  componentDidMount() {
    this.refreshClients()
  }

  render() {
    if (this.state.loading) return <div className='inner page'>Loading...</div>
    if (this.state.error)
      return <div className='inner page'> {this.state.error.message} </div>
    let token = this.props.token || ''

    let clients = this.state.clients
    let clientSection = <p>No clients created</p>
    if (clients.length > 0) {
      clientSection = (
        <ul>
          {clients.map((client) => {
            return (
              <li className='client-item' key={client.client_id}>
                <div>
                  <span>{client.client_name}</span>
                  <div>({client.client_id})</div>
                </div>
                <Button
                  variant='danger small'
                  onClick={() => this.deleteClient(client.client_id)}
                >
                  Delete
                </Button>
              </li>
            )
          })}
          <style jsx>
            {`
              ul {
                padding: 0;
              }

              .client-item {
                list-style: none;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: ${theme.layout.globalSpacing};
                font-family: ${theme.typography.headingFontFamily};
                padding-bottom: ${theme.layout.globalSpacing};
                border-bottom: 1px solid ${theme.colors.baseColorLight};
              }

              @media screen and (min-width: ${theme.mediaRanges.medium}) {
                .client-item {
                  align-items: center;
                }
              }

              .client-item span {
                font-weight: bold;
              }
            `}
          </style>
        </ul>
      )
    }

    return (
      <div className='inner page clients'>
        <div className='page__heading'>
          <h2> ⚙️ OAuth2 settings</h2>
          <p>Add an OAuth app to integrate with the OSM Teams API</p>
        </div>
        <section className='clients__new'>
          <h3>Add a new app</h3>
          <form className='form-control' onSubmit={this.createClient}>
            <div className='form-control form-control__vertical'>
              <label>Name: </label>
              <input
                type='text'
                placeholder='My app'
                required='true'
                onChange={this.handleClientNameChange}
              />
            </div>
            <div className='form-control form-control__vertical'>
              <label>Callback URL: </label>
              <input
                type='url'
                placeholder='https://myapp/callback'
                required='true'
                onChange={this.handleClientCallbackChange}
              />
            </div>
            <Button variant='submit' type='submit' value='Add new app'>
              Add New App{' '}
            </Button>
          </form>
        </section>
        <section className='clients__list'>
          {this.state.newClient ? (
            <section className='alert'>
              <h3>Newly created client</h3>
              <p>⚠️ Save this information, we won&apos;t show it again.</p>
              {newClient(this.state.newClient)}
            </section>
          ) : (
            <div />
          )}
          <Card>
            <h3>Your personal access token</h3>
            <p>
              <textarea rows='4' cols='30'>
                {token}
              </textarea>
            </p>
            <h3>Your apps</h3>
            {clientSection}
          </Card>
        </section>
        <style jsx>
          {`
            .inner.clients {
              display: grid;
              grid-template-columns: repeat(12, 1fr);
              grid-template-rows: 6rem 1fr;
              grid-gap: ${theme.layout.globalSpacing};
            }

            .page__heading {
              grid-column: 1 / span 12;
              display: block;
            }

            .clients__new,
            .clients__list {
              grid-column: 1 / span 12;
              margin-bottom: 4rem;
            }

            form {
              flex-direction: column;
              align-items: flex-start;
            }
            @media screen and (min-width: ${theme.mediaRanges.medium}) {
              .clients__new {
                grid-column: 1 / span 4;
              }
              .clients__list {
                grid-column: 5 / span 8;
              }
            }
          `}
        </style>
      </div>
    )
  }
}
export default Clients
