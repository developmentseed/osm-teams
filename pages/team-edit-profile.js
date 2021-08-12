import React, { Component } from 'react'
import { isEmpty } from 'ramda'
import { getTeamMemberAttributes } from '../lib/profiles-api'

export default class TeamEditProfile extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        id: query.id
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined
    }
  }

  async componentDidMount () {
    const { id } = this.props
    try {
      let memberAttributes = await getTeamMemberAttributes(id)
      this.setState({
        memberAttributes,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false
      })
    }
  }
  render () {
    const { memberAttributes } = this.state

    return (
      <article className='inner page'>
        <section>
          <h2>Current Attributes</h2>
          <p>Members of your team will be able to add these attributes to your profile</p>
          {
            isEmpty(memberAttributes) ? "You haven't added any attributes yet!" : ''
          }
        </section>
        <section>
          <h2>Add an attribute</h2>
          <p>Add an attribute to your team member's profile</p>
        </section>
      </article>
    )
  }
}
