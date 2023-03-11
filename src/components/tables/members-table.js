import T from 'prop-types'
import Table from './table'
import { useState } from 'react'

import Pagination from '../pagination'
import qs from 'qs'
import SearchInput from './search-input'
import { useFetchList } from '../../hooks/use-fetch-list'
import ExternalProfileButton from '../external-profile-button'
import Badge from '../badge'
import { makeTitleCase } from '../../../app/lib/utils'
import { Flex, useToken, Text } from '@chakra-ui/react'
import { includes, map, prop, insert } from 'ramda'
import { Button } from '@chakra-ui/react'
const SCOREBOARD_URL = process.env.SCOREBOARD_URL
const HDYC_URL = process.env.HDYC_URL

function MembersTable({ teamId, moderators, onActionsClick, displayBadges }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(null)
  const [sort, setSort] = useState({
    key: 'name',
    direction: 'asc',
  })

  const [brand500, brand700, red600, red700, blue400] = useToken('colors', [
    'brand.500',
    'brand.700',
    'red.500',
    'red.700',
    'blue.400',
  ])

  const roleBgColor = {
    member: brand500,
    moderator: red600,
    manager: brand700,
    owner: red700,
    undefined: blue400,
  }

  const MAX_BADGES_COLUMN = 3
  const querystring = qs.stringify({
    search,
    page,
    sort: sort.key,
    order: sort.direction,
    fields: 'badges',
  })

  const { result, isLoading } = useFetchList(
    `/teams/${teamId}/members?${querystring}`
  )

  const { members } = result
  if (!members) {
    return
  }
  const { data, pagination } = members

  const moderatorIds = map(prop('osm_id'), moderators)
  const memberData = data.map((member) => {
    const isModerator = includes(member.id, moderatorIds)
    return {
      ...member,
      role: isModerator ? 'moderator' : 'member',
    }
  })
  let emptyTableMessage = 'This team has no members.'

  if (!isLoading && search?.length > 0) {
    emptyTableMessage = 'Search returned no results.'
  }

  let columns = [
    {
      key: 'name',
      sortable: true,
      render: ({ name, id }) => (
        <Flex flexDir='column'>
          <Text fontWeight='bold'>{name}</Text>
          <Text>{id}</Text>
        </Flex>
      ),
    },
    {
      key: 'role',
      label: 'role',
      render: ({ role }) => (
        <Badge color={roleBgColor[role.toLowerCase()]}>
          {makeTitleCase(role)}
        </Badge>
      ),
    },
    {
      key: 'External Profiles',
      render: ({ id, name }) => (
        <Flex gap={1}>
          <ExternalProfileButton type='osm-profile' userId={name} />
          {SCOREBOARD_URL && (
            <ExternalProfileButton type='scoreboard' userId={id} />
          )}
          {HDYC_URL && <ExternalProfileButton type='hdyc' userId={name} />}
          <ExternalProfileButton type='osmcha' userId={name} />
        </Flex>
      ),
    },
    {
      key: 'Profile',
      render: (user) => (
        <Button size='md' variant='ghost' onClick={() => onActionsClick(user)}>
          ⋮
        </Button>
      ),
    },
  ]

  let badgesColumn = {
    key: 'badges',
    render: ({ badges }) => (
      <>
        {badges?.length > 0 &&
          badges.slice(0, MAX_BADGES_COLUMN).map((b) => (
            <Badge dot color={b.color} key={b.name}>
              {b.name}
            </Badge>
          ))}
        {badges?.length > MAX_BADGES_COLUMN && (
          <Badge color='#222'>+{badges.slice(MAX_BADGES_COLUMN).length}</Badge>
        )}
      </>
    ),
  }

  if (displayBadges) {
    columns = insert(2, badgesColumn, columns)
  }

  return (
    <>
      <SearchInput
        data-cy='team-members-table'
        placeholder='Search by username'
        onSearch={(search) => {
          // Reset to page 1 and search
          setPage(1)
          setSearch(search)
        }}
      />
      <Table
        data-cy='team-members-table'
        columns={columns}
        emptyPlaceHolder={isLoading ? 'Loading...' : emptyTableMessage}
        showRowNumbers
        rows={memberData}
        sort={sort}
        setSort={setSort}
      />
      {pagination?.total > 0 && (
        <Pagination
          pagination={pagination}
          data-cy='team-members-table-pagination'
          setPage={setPage}
        />
      )}
    </>
  )
}

MembersTable.defaultProps = {
  rows: [],
}

MembersTable.propTypes = {
  rows: T.array.isRequired,
  onRowClick: T.func,
}

export default MembersTable
