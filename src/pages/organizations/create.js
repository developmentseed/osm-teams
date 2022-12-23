import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import EditOrgForm from '../../components/edit-org-form'
import { createOrg } from '../../lib/org-api'
import logger from '../../lib/logger'

const APP_URL = process.env.APP_URL

export default class OrgCreate extends Component {
  render() {
    return (
      <article className='inner page'>
        <EditOrgForm
          onSubmit={async (values, actions) => {
            try {
              const org = await createOrg(values)
              actions.setSubmitting(false)
              Router.push(join(APP_URL, `organizations/${org.id}`))
            } catch (e) {
              logger.error(e)
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
