import React from 'react'
import Error from 'next/error'
import * as yup from 'yup'
import { getSession, signIn } from 'next-auth/react'
import * as TeamInvitation from '../../../../models/team-invitation'
import * as Team from '../../../../models/team'
import logger from '../../../../lib/logger'
import { Button } from '@chakra-ui/react'

const routeSchema = yup
  .object({
    id: yup.number().required().positive().integer(),
    invitationId: yup.string().uuid().required(),
  })
  .required()

export default function TeamInvitationPage({ errorCode, errorMessage }) {
  // Token is valid but user is not authorized
  if (errorCode === 401) {
    return (
      <article className='inner page'>
        <section>
          <h1>Please sign in</h1>
          <Button onClick={() => signIn('osm-teams')}>Sign in →</Button>
        </section>
      </article>
    )
  }

  // Another error occurred
  if (errorCode) {
    return <Error statusCode={errorCode} title={errorMessage} />
  }

  return (
    <article className='inner page'>
      <section>
        <h1>Invitation accepted successfully.</h1>
      </section>
    </article>
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
  const session = await getSession(ctx)

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

  return { props: {} }
}
