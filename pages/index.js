import React, { Component } from 'react'
import Button from '../components/button'

class Home extends Component {
  static async getInitialProps ({ query }) {
    if (query.user) {
      return {
        user: query.user
      }
    }
  }

  render() {
    return (
      <section>
        <h1>OSM Teams!</h1>
        <p className="measure-copy">
          Create teams of OSM users and import them into your apps.
        </p>
        {
          this.props.user
            ? (
              <div className="mt4">
                <h2>Welcome, {this.props.user}!</h2>
                <ul className="mt4 mb4 list pl2">
                  <li><a href='/profile' className="link dib">💁‍♀️ Profile</a></li>
                  <li><a href='/clients' className="link dib">⚙️ Connected Apps</a></li>
                </ul>
                <Button href="/logout">Logout</Button>
              </div>
            )
            : <Button href="/login">Sign in →</Button>
        }
      </section>
    )
  }
}

export default Home