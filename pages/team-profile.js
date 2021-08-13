import React, { Component } from 'react'
import { Formik, Field, Form } from 'formik'
import { getTeamMemberAttributes, getMyProfile } from '../lib/profiles-api'
import Button from '../components/button'

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
      let profileValues = await getMyProfile()
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
    const { memberAttributes, profileValues } = this.state
    return (
      <article className='inner page'>
        <h2>Team Profile</h2>
        <Formik
          initialValues={profileValues}
          render={({ errors, status, isSubmitting, values }) => {
            const addProfileText = `Submit ${isSubmitting ? ' 🕙' : ''}`
            return (
              <Form>
                { memberAttributes.map(attribute => {
                  return <div className='form-control form-control__vertical'>
                    <label>{attribute.name}{ attribute.required ? <span className='form--required'>*</span> : '' }</label>
                    <p>{attribute.description}</p>
                    <Field
                      type='text'
                      name={attribute.id}
                      required={attribute.required}
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