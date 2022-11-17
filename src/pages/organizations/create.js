import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import getConfig from 'next/config'
import EditOrgForm from '../../components/edit-org-form'
import { createOrg } from '../../lib/org-api'
const { publicRuntimeConfig } = getConfig()

export default class OrgCreate extends Component {
  render() {
    return (
      <article className='inner page'>
        <EditOrgForm
          onSubmit={async (values, actions) => {
            try {
              const org = await createOrg(values)
              actions.setSubmitting(false)
              Router.push(
                join(publicRuntimeConfig.APP_URL, `organizations/${org.id}`)
              )
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
