import React from 'react'
import Router from 'next/router'
import join from 'url-join'
import { getSession, useSession } from 'next-auth/react'
import getConfig from 'next/config'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/table'
import { assoc, flatten, propEq, find } from 'ramda'
import { listMyOrganizations } from '../models/organization'
import team from '../models/team'
import { teamsMembersModeratorsHelper } from '../../app/manage/utils'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

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

  return (
    <Table
      rows={allOrgs}
      columns={[{ key: 'id' }, { key: 'name' }, { key: 'role' }]}
      onRowClick={(row) => {
        Router.push(
          join(URL, `/organizations?id=${row.id}`),
          join(URL, `/organizations/${row.id}`)
        )
      }}
    />
  )
}

function TeamsSection({ teams }) {
  if (teams.length === 0) {
    return <p className='inner page'>No teams</p>
  }

  return (
    <Table
      rows={teams}
      columns={[{ key: 'id' }, { key: 'name' }, { key: 'hashtag' }]}
      onRowClick={(row) => {
        Router.push(
          join(URL, `/team?id=${row.id}`),
          join(URL, `/teams/${row.id}`)
        )
      }}
    />
  )
}

export default function Profile({ orgs, teams }) {
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
        {<TeamsSection teams={teams} />}
      </Section>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)
  const userId = session.user_id

  // Get orgs
  const orgs = await listMyOrganizations(userId)

  // Get user teams (mimic API call)
  const data = await team.list({ osmId: userId })
  const teams = await teamsMembersModeratorsHelper(data)

  // Make sure response is JSON
  return JSON.parse(JSON.stringify({ props: { orgs, teams } }))
}
