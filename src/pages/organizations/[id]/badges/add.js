import React, { Component } from 'react'
import join from 'url-join'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../lib/api-client'
import { getOrg } from '../../../../lib/org-api'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  VStack,
  Text,
} from '@chakra-ui/react'
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
  return <FormErrorMessage>{text}</FormErrorMessage>
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
          <Text fontFamily='mono' fontSize='sm' textTransform={'uppercase'}>
            {this.state.org.name}
          </Text>
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
                  <VStack as={Form} gap={2} alignItems='flex-start'>
                    <FormControl isRequired isInvalid={errors.name}>
                      <FormLabel htmlFor='name'>Name</FormLabel>
                      <Field
                        as={Input}
                        type='text'
                        name='name'
                        id='name'
                        value={values.name}
                        required
                        className={errors.name ? 'form--error' : ''}
                        validate={validateName}
                      />
                      {errors.name && renderError(errors.name)}
                    </FormControl>
                    <FormControl isRequired isInvalid={errors.color}>
                      <FormLabel htmlFor='color'>
                        Color: {values.color}
                      </FormLabel>
                      <Field
                        type='color'
                        name='color'
                        id='color'
                        value={values.color}
                        required
                      />
                      {errors.color && renderError(errors.color)}
                    </FormControl>
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
                  </VStack>
                )
              }}
            />
          </Box>
        </Container>
      </Box>
    )
  }
}
