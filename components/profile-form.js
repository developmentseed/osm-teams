import React, { Component } from 'react'
import Router from 'next/router'
import descriptionPopup from './description-popup'
import { Formik, Field, Form } from 'formik'
import { getOrgMemberAttributes, getTeamMemberAttributes, getMyProfile, setMyProfile } from '../lib/profiles-api'
import Button from '../components/button'
import { prop } from 'ramda'
export default class ProfileForm extends Component {
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
      memberAttributes: [],
      profileValues: {},
      loading: true,
      error: undefined
    }
  }

  async componentDidMount () {
    this.getProfileForm()
  }

  async getProfileForm () {
    const { id, formType } = this.props
    try {
      let memberAttributes
      let returnUrl
      switch (formType) {
        case 'org': {
          memberAttributes = await getOrgMemberAttributes(id)
          returnUrl = `/organizations/${this.props.id}`
          break
        }
        case 'team': {
          memberAttributes = await getTeamMemberAttributes(id)
          returnUrl = `/teams/${this.props.id}`
          break
        }
      }
      let profileValues = (await getMyProfile()).tags
      this.setState({
        id,
        returnUrl,
        memberAttributes,
        profileValues,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        loading: false
      })
    }
  }

  render () {
    let { memberAttributes, profileValues, returnUrl } = this.state
    profileValues = profileValues || {}

    return (
      <article className='inner page'>
        <h2>Add Your Profile</h2>
        <Formik
          enableReinitialize
          initialValues={profileValues}
          onSubmit={async (values, actions) => {
            const data = Object.keys(values).map(key => ({
              'key_id': key,
              'value': values[key]
            }))
            actions.setSubmitting(true)
            try {
              await setMyProfile(data)
              actions.setSubmitting(false)
              Router.push(returnUrl)
            } catch (e) {
              console.error(e)
              actions.setSubmitting(false)
              actions.setStatus(e.message)
            }
          }}
          render={({ errors, status, isSubmitting, values }) => {
            const addProfileText = `Submit ${isSubmitting ? ' 🕙' : ''}`
            return (
              <Form>
                { memberAttributes.map(attribute => {
                  return <div className='form-control form-control__vertical'>
                    <label>{attribute.name}
                      {attribute.required ? <span className='form--required'>*</span> : ''}
                      {attribute.description ? descriptionPopup(attribute.description) : ''}
                    </label>
                    <Field
                      type='text'
                      name={attribute.id}
                      required={attribute.required}
                      value={prop(attribute.id, values)}
                    />
                  </div>
                })}
                {status && status.msg && <div>{status.msg}</div>}
                <div className='form-control form-control__vertical'>
                  <Button type='submit' variant='submit' disabled={isSubmitting}>
                    {addProfileText}
                  </Button>
                </div>
              </Form>
            )
          }}
        />
      </article>
    )
  }
}
