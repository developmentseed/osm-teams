import React from 'react'
import join from 'url-join'
import Router from 'next/router'
import { createTeam, createOrgTeam } from '../../lib/teams-api'
import { dissoc } from 'ramda'
import getConfig from 'next/config'
import EditTeamForm from '../../components/edit-team-form'
import { getSession } from 'next-auth/react'
import { getOrgStaff } from '../../models/organization'
const { publicRuntimeConfig } = getConfig()

export default function TeamCreate({ staff }) {
  return (
    <article className='inner page'>
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

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)

  // Get organizations the user is part of
  const staff = await getOrgStaff({ osmId: session.user_id })

  return { props: { staff } }
}
