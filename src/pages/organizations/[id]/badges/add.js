import React, { Component } from 'react'
import join from 'url-join'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../lib/api-client'
import { getOrg } from '../../../../lib/org-api'
import { Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react'
import Router from 'next/router'
import { getRandomColor } from '../../../../lib/utils'
import { toast } from 'react-toastify'
import logger from '../../../../lib/logger'
import Link from 'next/link'
import InpageHeader from '../../../../components/inpage-header'

const URL = process.env.APP_URL

const apiClient = new APIClient()

function validateName(value) {
  if (!value) return 'Name field is required'
}

function renderError(text) {
  return <div className='form--error'>{text}</div>
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
        <InpageHeader>
          <Heading color='white'>Loading</Heading>
        </InpageHeader>
      )
    }

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={join(URL, `/organizations/${orgId}`)}>
            ← Back to Organization
          </Link>
          <Heading color='white'>New Badge</Heading>
          <Text variant='overline'>{this.state.org.name}</Text>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box as='article' layerStyle={'shadowed'}>
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
                    <Flex gap={4}>
                      <Button
                        isDisabled={isSubmitting}
                        type='submit'
                        value='submit'
                      >
                        Submit
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => {
                          Router.push(join(URL, `/organizations/${orgId}`))
                        }}
                        type='submit'
                      >
                        Cancel
                      </Button>
                    </Flex>
                  </Form>
                )
              }}
            />
          </Box>
        </Container>
      </Box>
    )
  }
}
