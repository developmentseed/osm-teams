import React, { Component } from 'react'
import Button from './button'

function newClient ({ client_id, client_name, client_secret}) {
  return <ul className="list pl0">
    <li><label className="b">client_id: </label>{client_id}</li>
    <li><label className="b">client_name: </label>{client_name}</li>
    <li><label className="b">client_secret: </label>{client_secret}</li>
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
      redirectURI: '',
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
    let res = await fetch('/api/clients')
    if (res.status == 200) {
      return await res.json()
    }
    else {
      throw new Error('Could not retrieve clients')
    }
  }

  async createClient(e) {
    e.preventDefault()
    let res = await fetch('/api/clients', {
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
    if (res.status == 200) {
      newClient = await res.json()
    }
    else {
      throw new Error('Could not create new client')
    }

    this.setState({ newClient: newClient.client, clientName: '' })
    await this.refreshClients()
  }

  async deleteClient(id) {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
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

  async refreshClients() {
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
    let clientSection = <p className="measure-copy">No clients created</p>
    if (clients.length > 0) {
      clientSection = (<ul className="list pl1 mt3">
        {
          clients.map(client => {
            return (
              <li key={client.client_id} className="flex mb3">
                <div className="flex-auto">
                  <span className="f5 tracked b">{client.client_name}</span>
                  <div className="f6">({client.client_id})</div>
                </div>
                <Button small danger onClick={() => this.deleteClient(client.client_id)}>Delete</Button>
              </li>
            )
          })
        }
      </ul>)
    }

    return (
      <div>
        <h2 className="mt4"> ⚙️ OAuth2 settings</h2>
        <p>Add an OAuth app to integrate with OSM/Hydra.</p>
        <section className="mt4 mb4 ba br3 b--black-10 pa3">
          <h3>Your apps</h3>
          {
            clientSection
          }
        </section>
        {
          this.state.newClient ? 
          <section className="bg-washed-yellow pa3">
            <h3>Newly created client</h3>
            <p>⚠️ Save this information, we won't show it again.</p>
            {newClient(this.state.newClient)}
          </section>
          : <div />
        }
        <section>
          <h3>Add a new app</h3>
          <form onSubmit={this.createClient} className="mw6">
            <label>Name: </label>
            <input className="input-reset mt2 mb3 w-100 dib pa2 br2 ba b--black-10" type="text" 
              placeholder="My app"
              onChange={this.handleClientNameChange}
            />
            <label>Callback URL: </label>
            <input className="input-reset mt2 mb3 w-100 dib pa2 br2 ba b--black-10" type="text" 
              placeholder="https://myapp/callback"
              onChange={this.handleClientCallbackChange}
            />
            <br />
            <br />
            <input className="input-reset f6 link dim br1 ba bw2 ph3 pv2 mb2 dib dark-green pointer b--dark-green bg-white" type="submit" value="Add new app"/>
          </form>
        </section>
      </div>
    )
  }
}
export default Clients