import React, { Component } from 'react'

const URL = process.env.APP_URL

class Developers extends Component {
  render() {
    return (
      <section className='inner page'>
        <h1>OSM Teams API Guide</h1>
        <p>
          OSM Teams API builds a second authentication layer on top of the OSM
          id, providing OAuth2 access to a user’s teams. A user signs in through
          your app and clicks a “Connect Teams” button that will start the OAuth
          flow, sending them to our API site to grant access to their teams,
          returning with an access token your app can use to authenticate with
          the API
        </p>
        <h2>Resources</h2>
        <ul>
          <li>
            <a href={`${URL}/docs/api`}>API Docs</a>
          </li>
          <li>
            <a href={`${URL}/clients`}>Connect a new application</a>
          </li>
          <li>
            <a href='https://github.com/developmentseed/osm-teams-node-example'>
              Example Node Integration
            </a>
          </li>
          <li>
            <a href='https://github.com/thadk/osm-teams-python-example'>
              Example Python Integration
            </a>
          </li>
        </ul>
      </section>
    )
  }
}

export default Developers
