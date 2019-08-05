import React, { Component } from 'react'
import Button from './button'
import Card from './card'
import join from 'url-join'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

function newClient ({ client_id, client_name, client_secret }) {
  return <ul>
    <li><label className='b'>client_id: </label>{client_id}</li>
    <li><label>client_name: </label>{client_name}</li>
    <li><label>client_secret: </label>{client_secret}</li>
  </ul>
}

class Clients extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      redirectURI: '',
      clientName: '',
      newClient: null
    }

    this.getClients = this.getClients.bind(this)
    this.createClient = this.createClient.bind(this)
    this.deleteClient = this.deleteClient.bind(this)
    this.refreshClients = this.refreshClients.bind(this)
    this.handleClientNameChange = this.handleClientNameChange.bind(this)
    this.handleClientCallbackChange = this.handleClientCallbackChange.bind(this)
  }

  async getClients () {
    let res = await fetch(join(publicRuntimeConfig.APP_URL, '/api/clients'))
    if (res.status === 200) {
      return res.json()
    } else {
      throw new Error('Could not retrieve clients')
    }
  }

  async createClient (e) {
    e.preventDefault()
    let res = await fetch(join(publicRuntimeConfig.APP_URL, '/api/clients'), {
      method: 'POST',
      body: JSON.stringify({
        client_name: this.state.clientName,
        redirect_uris: [this.state.redirectURI]
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
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

  async deleteClient (id) {
    await fetch(join(publicRuntimeConfig.APP_URL, `/api/clients/${id}`), { method: 'DELETE' })
    await this.refreshClients()
  }

  handleClientNameChange (e) {
    this.setState({
      clientName: e.target.value
    })
  }

  handleClientCallbackChange (e) {
    this.setState({
      redirectURI: e.target.value
    })
  }

  async refreshClients () {
    try {
      let { clients } = await this.getClients()
      this.setState({
        clients,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        clients: [],
        loading: false
      })
    }
  }

  componentDidMount () {
    this.refreshClients()
  }

  render () {
    if (this.state.loading) return <div>Loading...</div>
    if (this.state.error) return <div> {this.state.error.message} </div>

    let clients = this.state.clients
    let clientSection = <p>No clients created</p>
    if (clients.length > 0) {
      clientSection = (<ul>
        {
          clients.map(client => {
            return (
              <li key={client.client_id}>
                <div>
                  <span>{client.client_name}</span>
                  <div>({client.client_id})</div>
                </div>
                <Button small danger onClick={() => this.deleteClient(client.client_id)}>Delete</Button>
              </li>
            )
          })
        }
      </ul>)
    }

    return (
      <div className='inner'>
        <h2> ⚙️ OAuth2 settings</h2>
        <p>Add an OAuth app to integrate with OSM/Hydra.</p>
        <Card>
          <h3>Your apps</h3>
          {
            clientSection
          }
        </Card>
        {
          this.state.newClient
            ? <section className='bg-washed-yellow pa3'>
              <h3>Newly created client</h3>
              <p>⚠️ Save this information, we won't show it again.</p>
              {newClient(this.state.newClient)}
            </section>
            : <div />
        }
        <section>
          <h3>Add a new app</h3>
          <form onSubmit={this.createClient} className='mw6'>
            <label>Name: </label>
            <input type='text'
              placeholder='My app'
              onChange={this.handleClientNameChange}
            />
            <label>Callback URL: </label>
            <input type='text'
              placeholder='https://myapp/callback'
              onChange={this.handleClientCallbackChange}
            />
            <br />
            <br />
            <Button type='submit' value='Add new app'>Add New App </Button>
          </form>
        </section>
        <style jsx>
          {`
            form {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }

            label {
              margin-top: 1rem;
            }

            input {
              padding: 0.5rem 0.2rem;
              width: 100%;
            }
          `}
        </style>
      </div>
    )
  }
}
export default Clients
