import React from 'react'
import Router from 'next/router'
import { Box, Heading, Container } from '@chakra-ui/react'
import join from 'url-join'
import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'

import Table from '../components/tables/table'
import { assoc, flatten, propEq, find } from 'ramda'
import { listMyOrganizations } from '../models/organization'
import TeamsTable from '../components/tables/teams'
import { authOptions } from './api/auth/[...nextauth]'
import InpageHeader from '../components/inpage-header'

const URL = process.env.APP_URL

function OrganizationsSection({ orgs }) {
  if (orgs.length === 0) {
    return <p>No orgs</p>
  }

  const memberOrgs = orgs.memberOrgs.map(assoc('role', 'member'))
  const managerOrgs = orgs.managerOrgs.map(assoc('role', 'manager'))
  const ownerOrgs = orgs.ownerOrgs.map(assoc('role', 'owner'))

  let allOrgs = ownerOrgs
  managerOrgs.forEach((org) => {
    if (!find(propEq('id', org.id))(allOrgs)) {
      allOrgs.push(org)
    }
  })
  memberOrgs.forEach((org) => {
    if (!find(propEq('id', org.id))(allOrgs)) {
      allOrgs.push(org)
    }
  })

  return (
    <Table
      rows={allOrgs}
      columns={[{ key: 'name' }, { key: 'id' }, { key: 'role' }]}
      onRowClick={(row) => {
        Router.push(
          join(URL, `/organizations?id=${row.id}`),
          join(URL, `/organizations/${row.id}`)
        )
      }}
    />
  )
}

export default function Profile({ orgs }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      Router.push('/')
    },
  })

  if (status === 'loading') return null

  const hasOrgs = flatten(Object.values(orgs)).length > 0

  return (
    <Box as='main' mb={8}>
      <InpageHeader>
        <Heading size='lg' color='white'>
          Welcome, {session?.user.name}
        </Heading>
      </InpageHeader>
      <Container maxW='container.xl'>
        <Box as='section' layerStyle={'shadowed'}>
          <Heading variant='sectionHead'>My Teams</Heading>
          <TeamsTable type='my-teams' />
        </Box>
        {hasOrgs ? (
          <Box as='section' layerStyle={'shadowed'} mt={8}>
            <Heading variant='sectionHead'>My Organizations</Heading>
            <OrganizationsSection orgs={orgs} />
          </Box>
        ) : null}
      </Container>
    </Box>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  const userId = session.user_id

  // Get orgs
  const orgs = await listMyOrganizations(userId)

  // Make sure response is JSON
  return JSON.parse(JSON.stringify({ props: { orgs } }))
}
