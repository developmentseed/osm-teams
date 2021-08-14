import React, { Component } from 'react'
import Popup from 'reactjs-popup'
import { Formik, Field, Form } from 'formik'
import { getTeamMemberAttributes, getMyProfile, setMyProfile } from '../lib/profiles-api'
import Button from '../components/button'
import { prop } from 'ramda'

const descriptionPopup = (description) => {
  return (
    <Popup
      position='right top'
      on='click'
      closeOnDocumentClick
      trigger={
        <span className='infolink'>
          <style jsx>
            {`.infolink:after {
        content: '?';
        display: inline-block;
        font-family: sans-serif;
        font-weight: bold;
        text-align: center;
        font-size: 0.8em;
        line-height: 0.8em;
        border-radius: 50%;
        margin-left: 6px;
        padding: 0.13em 0.2em 0.09em 0.2em;
        color: inherit;
        border: 1px solid;
        text-decoration: none;
      }`}
          </style>
        </span>}
    >
      {description}
    </Popup>
  )
}
export default class TeamProfile extends Component {
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
    this.getTeamProfileForm()
  }

  async getTeamProfileForm () {
    const { id } = this.props
    try {
      let memberAttributes = await getTeamMemberAttributes(id)
      let profileValues = (await getMyProfile()).tags
      this.setState({
        teamId: id,
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
    let { memberAttributes, profileValues } = this.state
    profileValues = profileValues || {}

    return (
      <article className='inner page'>
        <h2>Team Profile</h2>
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
              this.getTeamProfileForm()
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