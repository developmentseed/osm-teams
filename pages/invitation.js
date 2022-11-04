import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import getConfig from 'next/config'
import { toast } from 'react-toastify'
import Button from '../components/button'
import { acceptTeamJoinInvitation } from '../lib/teams-api'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

export default class Invitation extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        teamId: query.team_id,
        invitationId: query.invitation_id,
        team: query.team,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      invitationPending: true,
      invitationSuccess: false,
      error: undefined,
    }
  }

  async componentDidMount() {
    const { team } = this.props
    this.setState({
      team,
    })
  }

  async rejectInvitation() {
    Router.push(URL)
  }

  async acceptInvitation() {
    const { teamId, invitationId } = this.props
    try {
      const res = await acceptTeamJoinInvitation(teamId, invitationId)
      if (res.ok) {
        toast.success('Success! You are now part of the team')
      }
      this.setState({
        invitationSuccess: true,
        invitationPending: false,
      })
    } catch (err) {
      console.error(err)
      toast.error('There was an error accepting this invitation')
      this.setState({
        invitationPending: false,
      })
    }
  }

  render() {
    const { team, error } = this.state
    if (error) {
      if (error.status === 401 || error.status === 403) {
        return (
          <article className='inner page'>
            <h1>Unauthorized</h1>
          </article>
        )
      } else if (error.status === 404) {
        return (
          <article className='inner page'>
            <h1>This invitation was not found or has expired</h1>
          </article>
        )
      } else {
        return (
          <article className='inner page'>
            <h1>Error: {error.message}</h1>
          </article>
        )
      }
    }

    if (!team) return null
    const userId = this.props.user.uid
    if (!userId) {
      return (
        <article className='inner page'>
          You are not logged in. Sign in and come back to this link.
        </article>
      )
    }
    return (
      <article className='inner page'>
        You have been invited to join <b>{team.name}</b>
        <br />
        <br />
        {this.state.invitationPending ? (
          <>
            <Button variant='submit' onClick={() => this.acceptInvitation()}>
              Accept
            </Button>
            <span style={{ marginLeft: '1rem' }}>
              <Button onClick={() => this.rejectInvitation()}>Cancel</Button>
            </span>
          </>
        ) : (
          ''
        )}
        {this.state.invitationSuccess ? (
          <Button variant='submit' href={join(URL, 'teams', `${team.id}`)}>
            Go to your team
          </Button>
        ) : (
          ''
        )}
      </article>
    )
  }
}
