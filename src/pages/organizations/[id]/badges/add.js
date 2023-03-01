import React, { Component } from 'react'
import join from 'url-join'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../lib/api-client'
import { getOrg } from '../../../../lib/org-api'
import { Button } from '@chakra-ui/react'
import Router from 'next/router'
import { getRandomColor } from '../../../../lib/utils'
import { toast } from 'react-toastify'
import logger from '../../../../lib/logger'
import Link from 'next/link'

const URL = process.env.APP_URL

const apiClient = new APIClient()

function validateName(value) {
  if (!value) return 'Name field is required'
}

function renderError(text) {
  return <div className='form--error'>{text}</div>
}

function ButtonWrapper({ children }) {
  return (
    <div>
      {children}
      <style jsx global>{`
      .button {
        margin-right: 10px;
      }
    }`}</style>
    </div>
  )
}

export default class AddBadge extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        orgId: query.id,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {}

    this.getOrg = this.getOrg.bind(this)
  }

  async componentDidMount() {
    this.getOrg()
  }

  async getOrg() {
    try {
      let org = await getOrg(this.props.orgId)
      this.setState({
        org,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        org: null,
        loading: false,
      })
    }
  }

  render() {
    const { orgId } = this.props

    if (!this.state.org) {
      return (
        <article className='inner page'>
          <div>Loading...</div>
        </article>
      )
    }

    return (
      <article className='inner page'>
        <Link href={join(URL, `/organizations/${orgId}`)}>
          ← Back to Organization Page
        </Link>
        <section>
          <h3>{this.state.org.name}</h3>
          <div className='page__heading'>
            <h1>New badge</h1>
          </div>

          <Formik
            initialValues={{ name: '', color: getRandomColor() }}
            onSubmit={async ({ name, color }, actions) => {
              actions.setSubmitting(true)
              try {
                await apiClient.post(`/organizations/${orgId}/badges`, {
                  name,
                  color,
                })
                Router.push(join(URL, `/organizations/${orgId}`))
              } catch (error) {
                logger.error(error)
                toast.error(
                  `There was an error creating badge '${name}'. Please try again later.`
                )
              } finally {
                actions.setSubmitting(false)
              }
            }}
            render={({ isSubmitting, values, errors }) => {
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
                    <Button
                      disabled={isSubmitting}
                      variant='primary'
                      type='submit'
                      value='submit'
                    />
                    <Button
                      variant='disable small'
                      onClick={() => {
                        Router.push(join(URL, `/organizations/${orgId}`))
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
