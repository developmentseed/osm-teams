import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { createTeam } from '../lib/teams-api'
import getConfig from 'next/config'
import EditTeamForm from '../components/edit-team-form'
const { publicRuntimeConfig } = getConfig()

export default class TeamCreate extends Component {
  render () {
    return (
      <article>
        <EditTeamForm
          onSubmit={async (values, actions) => {
            try {
              const team = await createTeam(values)
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
      </article>
    )
  }
}
