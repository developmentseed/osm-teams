import React from 'react'
import join from 'url-join'
import Router from 'next/router'
import { createTeam, createOrgTeam } from '../../lib/teams-api'
import { dissoc } from 'ramda'
import EditTeamForm from '../../components/edit-team-form'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'
import { getOrgStaff } from '../../models/organization'
import logger from '../../lib/logger'
import { Box, Container, Heading } from '@chakra-ui/react'
import InpageHeader from '../../components/inpage-header'

const APP_URL = process.env.APP_URL

export default function TeamCreate({ staff }) {
  return (
    <Box as='main' mb={16}>
      <InpageHeader>
        <Heading color='white'>Create New Team</Heading>
      </InpageHeader>
      <Container maxW='container.xl' as='section'>
        <Box as='section' layerStyle='shadowed'>
          <EditTeamForm
            initialValues={{
              location: undefined,
            }}
            isCreateForm
            staff={staff}
            onSubmit={async (values, actions) => {
              try {
                let team
                if (values.organization) {
                  team = await createOrgTeam(
                    values.organization,
                    dissoc('organization', values)
                  )
                } else {
                  team = await createTeam(values)
                }
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
      </Container>
    </Box>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)

  // Get organizations the user is part of
  const staff = await getOrgStaff({ osmId: session.user_id })

  return { props: { staff } }
}
