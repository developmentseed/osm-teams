import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { pick } from 'ramda'
import { getTeam, updateTeam } from '../lib/teams-api'
import getConfig from 'next/config'
import EditTeamForm from '../components/edit-team-form'
const { publicRuntimeConfig } = getConfig()

export default class Team extends Component {
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
      let team = await getTeam(id)
      this.setState({
        team,
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
    const { team, error } = this.state

    if (error) {
      if (error.status >= 400 && error.status < 500) {
        return (
          <article className='inner'>
            <h1>Team not found</h1>
          </article>
        )
      } else if (error.status >= 500) {
        return (
          <article className='inner'>
            <h1>Error fetching team</h1>
          </article>
        )
      }
    }

    if (!team) return null

    return (
      <article className='inner page'>
        <EditTeamForm
          initialValues={pick(['name', 'bio', 'hashtag', 'location'], team)}
          onSubmit={async (values, actions) => {
            try {
              await updateTeam(team.id, values)
              actions.setSubmitting(false)
              Router.push(join(publicRuntimeConfig.APP_URL, `/teams/${team.id}`))
            } catch (e) {
              console.error(e)
              actions.setSubmitting(false)
              // set the form errors actions.setErrors(e)
              actions.setStatus(e.message)
            }
          }}
        />
        <style jsx>
          {`
            .form-control {
              flex-direction: column;
              align-items: flex-start;
            }

          `}
        </style>
      </article>
    )
  }
}
