import React, { Component } from 'react'
import join from 'url-join'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../lib/api-client'
import { getOrg } from '../../lib/org-api'
import Button from '../../components/button'
import Router from 'next/router'
import { getRandomColor } from '../../lib/utils'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

const apiClient = new APIClient()

function validateName (value) {
  if (!value) return 'Name field is required'
}

function renderError (text) {
  return <div className='form--error'>{text}</div>
}

function renderErrors (errors) {
  const keys = Object.keys(errors)
  return keys.map((key) => {
    return renderError(errors[key])
  })
}

function ButtonWrapper ({ children }) {
  return <div>
    {children}
    <style jsx global>{`
      .button {
        margin-right: 10px;
      }
    }`}</style>
  </div>
}

export default class OrgCreate extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        id: query.id
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {}

    this.getOrg = this.getOrg.bind(this)
  }

  async componentDidMount () {
    this.getOrg()
  }

  async getOrg () {
    console.log('getOrg')
    try {
      let org = await getOrg(this.props.id)
      this.setState({
        org
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        org: null,
        loading: false
      })
    }
  }

  render () {
    const self = this

    if (!this.state.org) {
      return <article className='inner page'><div>Loading...</div></article>
    }

    return (
      <article className='inner page'>
        <section>
          <div className='page__heading'>
            <h1>{this.state.org.name}</h1>
          </div>
          <div className='page__heading'>
            <h2>New badge</h2>
          </div>

          <Formik
            initialValues={{ name: '', color: getRandomColor() }}
            onSubmit={async ({ name, color }) => {
              try {
                await apiClient.post(`/organizations/1/badges`, {
                  name,
                  color
                })
                Router.push(
                  join(URL, `/organizations/${self.props.id}`)
                )
              } catch (error) {
                console.log(error)
              }
            }}
            render={({
              status,
              isSubmitting,
              submitForm,
              values,
              errors,
              setFieldValue,
              setErrors,
              setStatus
            }) => {
              return (
                <Form>
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='name'>
                      Name<span className='form--required'>*</span>
                    </label>
                    <Field
                      type='text'
                      name='name'
                      value={values.name}
                      required
                      className={errors.name ? 'form--error' : ''}
                      validate={validateName}
                    />
                    {errors.name && renderError(errors.name)}
                  </div>
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='color'>Color: {values.color}</label>
                    <Field
                      type='color'
                      name='color'
                      value={values.color}
                      required
                    />
                    {errors.color && renderError(errors.color)}
                  </div>
                  <ButtonWrapper>
                    {status && status.errors && renderErrors(status.errors)}
                    <Button
                      disabled={isSubmitting}
                      variant='primary'
                      onClick={() => {
                        if (Object.keys(errors).length) {
                          setErrors(errors)
                          return setStatus({
                            errors
                          })
                        }
                        return submitForm()
                      }}
                      type='submit'
                      value='submit'
                    />
                    <Button
                      variant='disable small'
                      onClick={() => {
                        Router.push(
                          join(URL, `/organizations/${self.props.id}`)
                        )
                      }}
                      type='submit'
                      value='cancel'
                    />
                  </ButtonWrapper>
                </Form>
              )
            }}
          />
        </section>
      </article>
    )
  }
}
