import T from 'prop-types'
import { useRouter } from 'next/router'
import Table from './table'
import join from 'url-join'
import { useState } from 'react'
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToken,
  Text,
  IconButton,
} from '@chakra-ui/react'

import Pagination from '../pagination'
import qs from 'qs'
import SearchInput from './search-input'
import { useFetchList } from '../../hooks/use-fetch-list'
import ExternalProfileButton from '../external-profile-button'
import Badge from '../badge'
import { makeTitleCase } from '../../../app/lib/utils'
import { includes, map, prop, insert, append, contains } from 'ramda'
import { IoEllipsisHorizontal } from 'react-icons/io5'
import { InfoOutlineIcon } from '@chakra-ui/icons'

const SCOREBOARD_URL = process.env.SCOREBOARD_URL
const HDYC_URL = process.env.HDYC_URL
const APP_URL = process.env.APP_URL

function MembersTable({
  teamId,
  moderators,
  onUsernameClick,
  displayBadges,
  requesterId,
  organizationId,
  removeMember,
  addModerator,
  removeModerator,
  isRequesterModerator,
  isRequesterOrgOwner,
}) {
  const router = useRouter()
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
      render: (user) => (
        <Flex flexDir='column'>
          <Text
            fontWeight='bold'
            fontFamily={'body'}
            as='a'
            display='flex'
            gap={1}
            onClick={() => onUsernameClick(user)}
            _hover={{ cursor: 'pointer' }}
            title='Display user profile'
            data-component-name='username'
          >
            {user.name}
            <InfoOutlineIcon
              opacity={0}
              transition='opacity 0.12s ease-in'
              sx={{
                '[data-component-name="username"]:hover &': {
                  opacity: 'initial',
                },
              }}
              alignSelf='center'
            />
          </Text>
          <Text color='blackAlpha.600'>{user.id}</Text>
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
        <Flex gap={1} justifyContent='center'>
          <ExternalProfileButton
            type='osm-profile'
            userId={name}
            title='Visit OSM profile'
          />
          {SCOREBOARD_URL && (
            <ExternalProfileButton
              type='scoreboard'
              userId={id}
              title='Visit Scoreboard profile'
            />
          )}
          {HDYC_URL && (
            <ExternalProfileButton
              type='hdyc'
              userId={name}
              title='Visit HDYC profile'
            />
          )}
          <ExternalProfileButton
            type='osmcha'
            userId={name}
            title='Visit OSMCha profile'
          />
        </Flex>
      ),
      alignment: 'center',
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

  let actionsColumn = {
    key: 'Actions',
    render: (user) => {
      let actions = []

      if (Number(user.id) !== Number(requesterId)) {
        actions.push({
          name: 'Remove team member',
          onClick: async () => {
            removeMember(user.id)
          },
        })
      }
      if (
        !contains(
          Number(user.id),
          moderators.map((m) => Number(m.osm_id))
        )
      ) {
        actions.push({
          name: 'Promote to moderator',
          onClick: async () => {
            addModerator(user.id)
          },
        })
      } else {
        actions.push({
          name: 'Remove moderator',
          onClick: async () => {
            removeModerator(user.id)
          },
        })
      }

      if (organizationId && isRequesterOrgOwner) {
        actions.push({
          name: 'Assign a badge',
          onClick: () =>
            router.push(
              join(
                APP_URL,
                `/organizations/${organizationId}/badges/assign/${user.id}`
              )
            ),
        })
      }
      return (
        <Menu>
          <MenuButton
            as={IconButton}
            size='sm'
            variant='ghost'
            aria-label='User actions menu'
            title='Display user actions menu'
            icon={<IoEllipsisHorizontal />}
          />
          <MenuList>
            {actions.map((action) => {
              return (
                <MenuItem
                  fontSize='sm'
                  onClick={() => action.onClick()}
                  key={action.name}
                >
                  {action.name}
                </MenuItem>
              )
            })}
          </MenuList>
        </Menu>
      )
    },
    alignment: 'center',
  }

  if (displayBadges) {
    columns = insert(2, badgesColumn, columns)
  }

  if (isRequesterModerator) {
    columns = append(actionsColumn, columns)
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
