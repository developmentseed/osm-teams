import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { pick, split } from 'ramda'
import { getTeam, updateTeam, destroyTeam } from '../../../lib/teams-api'
import EditTeamForm from '../../../components/edit-team-form'
import { Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react'

import {
  getOrgTeamAttributes,
  getTeamAttributes,
  getTeamProfile,
} from '../../../lib/profiles-api'
import logger from '../../../lib/logger'
import Link from 'next/link'
import InpageHeader from '../../../components/inpage-header'

const APP_URL = process.env.APP_URL
export default class TeamEdit extends Component {
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
      let team = await getTeam(id)
      let teamAttributes = (await getTeamAttributes(id)) || []
      let orgTeamAttributes = []
      let profileValues = []
      profileValues = await getTeamProfile(id)
      if (team.org) {
        orgTeamAttributes = await getOrgTeamAttributes(team.org.organization_id)
      }
      this.setState({
        team,
        profileValues,
        teamAttributes,
        orgTeamAttributes,
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

  async deleteTeam() {
    const { id } = this.props
    try {
      const res = await destroyTeam(id)
      if (res.ok) {
        Router.push(join(APP_URL, `/teams`))
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
        onClick={() => {
          this.setState({
            deleteClickedOnce: true,
          })
        }}
      >
        Delete this team
      </Button>
    )

    if (this.state.deleteClickedOnce) {
      section = (
        <Flex gap={4}>
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
            onClick={() => {
              this.deleteTeam()
            }}
          >
            Really delete this team?
          </Button>
        </Flex>
      )
    }
    return section
  }

  render() {
    const { team, error, teamAttributes, orgTeamAttributes, profileValues } =
      this.state

    if (error) {
      if (error.status >= 400 && error.status < 500) {
        return (
          <InpageHeader>
            <Heading color='white'>Team not found</Heading>
          </InpageHeader>
        )
      } else if (error.status >= 500) {
        return (
          <InpageHeader>
            <Heading color='white'>Error Fetching Team</Heading>
          </InpageHeader>
        )
      }
    }

    if (!team) return null

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Flex
            direction={['column', 'row']}
            justifyContent={'space-between'}
            gap={4}
          >
            <Flex direction='column' gap={1}>
              <Link href={join(APP_URL, `/teams/${team.id}`)}>
                ← Back to Team Page
              </Link>
              <Heading color='white'>{team.name}</Heading>
              <Text fontFamily='mono' fontSize='sm' textTransform={'uppercase'}>
                Editing Team
              </Text>
            </Flex>
            <Button
              variant='outline'
              colorScheme='white'
              as={Link}
              href={`/teams/${team.id}/edit-profiles`}
            >
              Edit Team Profiles
            </Button>
          </Flex>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box as='article' layerStyle={'shadowed'}>
            <EditTeamForm
              initialValues={pick(
                [
                  'name',
                  'bio',
                  'hashtag',
                  'editing_policy',
                  'location',
                  'privacy',
                ],
                team
              )}
              profileValues={profileValues}
              teamTags={teamAttributes}
              orgTeamTags={orgTeamAttributes}
              onSubmit={async (values, actions) => {
                try {
                  let tags = Object.keys(values.tags).map((key) => {
                    return {
                      key_id: split('-', key)[1],
                      value: values.tags[key],
                    }
                  })

                  values.tags = tags

                  await updateTeam(team.id, values)
                  actions.setSubmitting(false)
                  Router.push(join(APP_URL, `/teams/${team.id}`))
                } catch (e) {
                  logger.error(e)
                  actions.setSubmitting(false)
                  // set the form errors actions.setErrors(e)
                  actions.setStatus(e.message)
                }
              }}
            />
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
            <Heading as='h2' variant='sectionHead' size='md' color='red'>
              Danger Zone
            </Heading>
            <p>
              Delete this team, team information and all memberships associated
              to this team
            </p>
            {this.renderDeleter()}
          </Box>
        </Container>
      </Box>
    )
  }
}
