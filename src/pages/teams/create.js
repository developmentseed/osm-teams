import React from 'react'
import join from 'url-join'
import Router from 'next/router'
import { createTeam, createOrgTeam } from '../../lib/teams-api'
import { dissoc } from 'ramda'
import EditTeamForm from '../../components/edit-team-form'
import { getSession } from 'next-auth/react'
import { getOrgStaff } from '../../models/organization'
import logger from '../../lib/logger'

const APP_URL = process.env.APP_URL

export default function TeamCreate({ staff }) {
  return (
    <article className='inner page'>
      <section>
        <div className='page__heading'>
          <h1>Create New Team</h1>
        </div>
        <EditTeamForm
          initialValues={{ location: undefined }}
          isCreateForm
          staff={staff}
          onSubmit={async (values, actions) => {
            try {
              let team
              if (values.organization) {
                team = await createOrgTeam(
                  values.organization,
                  dissoc('organization', values)
                )
              } else {
                team = await createTeam(values)
              }
              actions.setSubmitting(false)
              Router.push(join(APP_URL, `/teams/${team.id}`))
            } catch (e) {
              logger.error(e)
              actions.setSubmitting(false)
              // set the form errors actions.setErrors(e)
              actions.setStatus(e.message)
            }
          }}
        />
      </section>
    </article>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)

  // Get organizations the user is part of
  const staff = await getOrgStaff({ osmId: session.user_id })

  return { props: { staff } }
}
