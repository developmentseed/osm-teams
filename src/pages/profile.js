import React from 'react'
import Router from 'next/router'
import join from 'url-join'
import { getSession, useSession } from 'next-auth/react'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/tables/table'
import { assoc, flatten, propEq, find } from 'ramda'
import { listMyOrganizations } from '../models/organization'
import TeamsTable from '../components/tables/teams'

const URL = process.env.APP_URL

function OrganizationsSection({ orgs }) {
  if (orgs.length === 0) {
    return <p className='inner page'>No orgs</p>
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
  // allOrgs.forEach(
  //   (org) => (org.role = <RoleLabel role={org.role}>{org.role}</RoleLabel>)
  // )

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
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      Router.push('/')
    },
  })

  if (status === 'loading') return null

  const hasOrgs = flatten(Object.values(orgs)).length > 0

  return (
    <div className='inner page'>
      <div className='page__heading'>
        <h1>Teams & Organizations</h1>
      </div>
      {hasOrgs ? (
        <Section>
          <SectionHeader>Your Organizations</SectionHeader>
          <OrganizationsSection orgs={orgs} />
        </Section>
      ) : null}
      <Section>
        <SectionHeader>Your Teams</SectionHeader>
        <TeamsTable type='my-teams' />
      </Section>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)
  const userId = session.user_id

  // Get orgs
  const orgs = await listMyOrganizations(userId)

  // Make sure response is JSON
  return JSON.parse(JSON.stringify({ props: { orgs } }))
}
