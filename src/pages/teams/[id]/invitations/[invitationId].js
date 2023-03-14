import React, { useEffect } from 'react'
import join from 'url-join'
import Error from 'next/error'
import { useRouter } from 'next/router'
import * as yup from 'yup'
import { signIn } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import * as TeamInvitation from '../../../../models/team-invitation'
import * as Team from '../../../../models/team'
import logger from '../../../../lib/logger'
import { Box, Button, ButtonGroup, Flex, Heading, Text } from '@chakra-ui/react'
import { authOptions } from '../../../api/auth/[...nextauth]'
import InpageHeader from '../../../../components/inpage-header'
import Link from 'next/link'

const APP_URL = process.env.APP_URL

const routeSchema = yup
  .object({
    id: yup.number().required().positive().integer(),
    invitationId: yup.string().uuid().required(),
  })
  .required()

export default function TeamInvitationPage({
  errorCode,
  errorMessage,
  teamId,
}) {
  const router = useRouter()
  useEffect(() => {
    // only redirect on successful invite acceptance
    if (!errorCode) {
      setTimeout(() => {
        router.push(join(APP_URL, `/teams/${teamId}/profile`))
      }, 5000)
    }
  }, [])

  // Token is valid but user is not authorized
  if (errorCode === 401) {
    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Heading color='white'>Please sign in</Heading>
          <Button onClick={() => signIn('osm-teams')}>Sign in →</Button>
        </InpageHeader>
      </Box>
    )
  }

  // Another error occurred
  if (errorCode) {
    return <Error statusCode={errorCode} title={errorMessage} />
  }

  return (
    <Box as='main'>
      <InpageHeader>
        <Heading color='white' data-cy='invite-accepted' size='3xl'>
          Invitation accepted successfully
        </Heading>
        <Text fontSize='lg'>Redirecting to your team profile...</Text>
        <Flex flexDirection={'column'} my={16} gap={4}>
          <Text fontSize='sm'>If you are not redirected, click to</Text>
          <ButtonGroup gap={2}>
            <Button
              variant='outline'
              colorScheme='white'
              as={Link}
              size='sm'
              href={`/teams/${teamId}/profile`}
            >
              Edit your team profile
            </Button>
            <Button
              variant='outline'
              colorScheme='white'
              as={Link}
              size='sm'
              href={`/teams/${teamId}`}
            >
              View team page
            </Button>
          </ButtonGroup>
        </Flex>
      </InpageHeader>
    </Box>
  )
}

export async function getServerSideProps(ctx) {
  // Validate route params
  let query
  try {
    query = await routeSchema.validate(ctx.query)
  } catch (error) {
    logger.error(error)
    return {
      props: { errorCode: 400, errorMessage: 'Invalid team invitation' },
    }
  }

  // Get params
  const { id: teamId, invitationId } = query

  // Get invitation
  let invitation = await TeamInvitation.get({
    teamId,
    id: invitationId,
  })

  // Return error if token not found
  if (!invitation) {
    return {
      props: { errorCode: 400, errorMessage: 'Invalid team invitation' },
    }
  }

  // Check expiration date
  if (invitation.expires_at && invitation.expires_at < Date.now()) {
    return {
      props: { errorCode: 400, errorMessage: 'Team invitation has expired' },
    }
  }

  // Check if user is authenticated
  const session = await getServerSession(ctx.req, ctx.res, authOptions)

  if (!session) {
    return {
      props: { errorCode: 401, errorMessage: 'Must be signed in' },
    }
  }

  // Add user to the team
  try {
    await Team.addMember(teamId, session.user_id)
  } catch (error) {
    return {
      props: {
        errorCode: 500,
        errorMessage: 'There was an error joining the team',
      },
    }
  }

  return { props: { teamId } }
}
