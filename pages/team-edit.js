import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { pick } from 'ramda'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { getTeam, updateTeam } from '../lib/teams-api'
import getConfig from 'next/config'
import Button from '../components/button'
import { FormikMap } from '../components/formikmap'
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
          <article>
            <h1>Team not found</h1>
          </article>
        )
      } else if (error.status >= 500) {
        return (
          <article>
            <h1>Error fetching team</h1>
          </article>
        )
      }
    }

    if (!team) return null

    return (
      <article>
        <Formik
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
          render={({ status, isSubmitting, submitForm, values, setFieldValue }) => (
            <Form>
              <div className='mt3'>
                <label htmlFor='name' className='db fw4 lh-copy f6'>Name:</label>
                <Field type='text' name='name' />
                <ErrorMessage name='name' component='div' />
              </div>
              <div className='mt3'>
                <label htmlFor='hashtag' className='db fw4 lh-copy f6'>Hashtag:</label>
                <Field type='text' name='hashtag' />
                <ErrorMessage name='hashtag' component='div' />
              </div>
              <div className='mt3'>
                <label htmlFor='bio' className='db fw4 lh-copy f6'>Description:</label>
                <Field type='textarea' name='bio' />
                <ErrorMessage name='bio' component='div' />
              </div>
              <div className='mt3'>
                <FormikMap name='location' value={values.location} onChange={setFieldValue} />
              </div>
              <div className='mt3'>
                { status && status.msg && <div>{status.msg}</div> }
                <Button disabled={isSubmitting} onClick={() => submitForm()}>Submit</Button>
              </div>
            </Form>
          )}
        />
      </article>
    )
  }
}
