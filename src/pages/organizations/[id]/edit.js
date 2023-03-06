import React, { Component, Fragment } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { pick } from 'ramda'
import { getOrg, updateOrg, destroyOrg } from '../../../lib/org-api'
import EditOrgForm from '../../../components/edit-org-form'
import InpageHeader from '../../../components/inpage-header'
import { Button, Box, Container, Heading, Flex, Text } from '@chakra-ui/react'
import logger from '../../../lib/logger'
import Link from 'next/link'

const APP_URL = process.env.APP_URL

export default class OrgEdit extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        id: query.id,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      deleteClickedOnce: false,
    }
  }

  async componentDidMount() {
    const { id } = this.props
    try {
      let org = await getOrg(id)
      this.setState({
        org,
        loading: false,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false,
      })
    }
  }

  async deleteOrg() {
    const { id } = this.props
    try {
      const res = await destroyOrg(id)
      if (res.ok) {
        Router.push(join(APP_URL, `/profile`))
      } else {
        throw new Error('Could not delete team')
      }
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
      })
    }
  }

  renderDeleter() {
    let section = (
      <Button
        colorScheme={'red'}
        variant='outline'
        onClick={() => {
          this.setState({
            deleteClickedOnce: true,
          })
        }}
      >
        Delete this organization
      </Button>
    )

    if (this.state.deleteClickedOnce) {
      section = (
        <Fragment>
          <Button
            onClick={() => {
              this.setState({
                deleteClickedOnce: false,
              })
            }}
          >
            Cancel
          </Button>
          <Button
            colorScheme={'red'}
            variant='outline'
            onClick={() => {
              this.deleteOrg()
            }}
          >
            Really delete this team organization?
          </Button>
        </Fragment>
      )
    }
    return section
  }

  render() {
    const { org, error } = this.state

    if (error) {
      if (error.status >= 400 && error.status < 500) {
        return (
          <InpageHeader>
            <Heading color='white'>Organization not found</Heading>
          </InpageHeader>
        )
      } else if (error.status >= 500) {
        return (
          <InpageHeader>
            <Heading color='white'>Error Fetching Organization</Heading>
          </InpageHeader>
        )
      }
    }

    if (!org) return null

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={join(APP_URL, `/organizations/${org.id}`)}>
            ← Back to Organization
          </Link>
          <Heading color='white'>{org.name}</Heading>
          <Text variant='overline'>Editing Organization</Text>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box as='article' layerStyle={'shadowed'}>
            <EditOrgForm
              initialValues={pick(
                ['name', 'description', 'privacy', 'teams_can_be_public'],
                org
              )}
              onSubmit={async (values, actions) => {
                try {
                  await updateOrg(org.id, values)
                  actions.setSubmitting(false)
                  Router.push(join(APP_URL, `/organizations/${org.id}`))
                } catch (e) {
                  logger.error(e)
                  actions.setSubmitting(false)
                  // set the form errors actions.setErrors(e)
                  actions.setStatus(e.message)
                }
              }}
            />
          </Box>
          <Box layerStyle='shadowed'>
            <Heading variant='sectionHead' as='h2'>
              Organization Attributes
            </Heading>
            <Flex gap={4}>
              <Button
                as={Link}
                variant='outline'
                href={`/organizations/${org.id}/edit-profiles`}
              >
                Edit Member Attributes
              </Button>

              <Button
                as={Link}
                variant='outline'
                href={`/organizations/${org.id}/edit-team-profiles`}
              >
                Edit Team Attributes
              </Button>

              <Button
                as={Link}
                variant='outline'
                href={`/organizations/${org.id}/edit-privacy-policy`}
              >
                Edit Privacy Policy
              </Button>
            </Flex>
          </Box>
          <Box
            layerStyle='shadowed'
            as='section'
            borderColor='red.500'
            boxShadow='4px 4px 0 0 var(--chakra-colors-red-500)'
            display='flex'
            flexDirection={'column'}
            alignItems='flex-start'
            gap={2}
          >
            <Heading variant='sectionHead' as='h2' size='md' color='red'>
              Danger Zone
            </Heading>
            <p>
              Delete this organization, organization information and all
              memberships associated with this organization
            </p>
            {this.renderDeleter()}
          </Box>
        </Container>
      </Box>
    )
  }
}
