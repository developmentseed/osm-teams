import React, { Component } from 'react'
import Router from 'next/router'
import descriptionPopup from './description-popup'
import { Formik, Field, Form } from 'formik'
import { getOrgMemberAttributes, getTeamMemberAttributes, getMyProfile, setMyProfile } from '../lib/profiles-api'
import { getTeam } from '../lib/teams-api'
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
      orgAttributes: [],
      profileValues: {},
      loading: true,
      error: undefined
    }
  }

  async componentDidMount () {
    this.getProfileForm()
  }

  async getProfileForm () {
    const { id } = this.props
    try {
      let memberAttributes = []
      let orgAttributes = []
      const returnUrl = `/teams/${this.props.id}`
      const team = await getTeam(id)
      if (team.org) {
        orgAttributes = await getOrgMemberAttributes(team.org.organization_id)
      }
      memberAttributes = await getTeamMemberAttributes(id)
      let profileValues = (await getMyProfile()).tags
      this.setState({
        id,
        returnUrl,
        memberAttributes,
        orgAttributes,
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
    let { memberAttributes, orgAttributes, profileValues, returnUrl } = this.state
    profileValues = profileValues || {}

    return (
      <article className='inner page'>
        <h1>Add Your Profile</h1>
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
                {orgAttributes.length > 0
                  ? <>
                    <h2>Org Profile</h2>
                    {orgAttributes.map(attribute => {
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
                  </>
                  : ''
                }
                <h2>Team Profile</h2>
                { memberAttributes.length > 0 ? memberAttributes.map(attribute => {
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
                })
                  : 'No profile form to fill yet'
                }
                {status && status.msg && <div>{status.msg}</div>}
                <div style={{ marginTop: '1rem' }}className='form-control form-control__vertical'>
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
