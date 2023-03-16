import T from 'prop-types'
import join from 'url-join'
import Table from './table'
import Badge from '../badge'
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToken,
  IconButton,
} from '@chakra-ui/react'
import { IoEllipsisHorizontal } from 'react-icons/io5'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import { contains, append } from 'ramda'
import Pagination from '../pagination'
import qs from 'qs'
import SearchInput from './search-input'
import ExternalProfileButton from '../external-profile-button'
import { makeTitleCase } from '../../../app/lib/utils'
import { useRouter } from 'next/router'

const SCOREBOARD_URL = process.env.SCOREBOARD_URL
const HDYC_URL = process.env.HDYC_URL
const URL = process.env.APP_URL

function UsersTable({
  type,
  orgId,
  requesterId,
  onUsernameClick,
  isSearchable,
  addOwner,
  removeOwner,
  addManager,
  removeManager,
  isRequesterOwner,
  managerIds,
  ownerIds,
  onAction,
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
    'red.600',
    'red.700',
    'blue.400',
  ])

  const MAX_BADGES_COLUMN = 3
  const roleBgColor = {
    member: brand500,
    moderator: red600,
    manager: brand700,
    owner: red700,
    undefined: blue400,
  }
  let apiBasePath
  let emptyMessage
  let columns

  const querystring = qs.stringify({
    search,
    page,
    sort: sort.key,
    order: sort.direction,
  })

  switch (type) {
    case 'org-members':
      apiBasePath = `/organizations/${orgId}/members`
      emptyMessage = 'No members yet.'
      columns = [
        {
          key: 'name',
          sortable: true,
          render: (user) => (
            <Button
              size='md'
              variant='link'
              onClick={() => onUsernameClick(user)}
            >
              {user.name}
            </Button>
          ),
        },
        { key: 'id', label: 'OSM ID', sortable: true },
        {
          key: 'badges',
          render: ({ badges }) => (
            <>
              {badges?.length > 0 &&
                badges.slice(0, MAX_BADGES_COLUMN).map((b) => (
                  <Badge dot color={b.color} key={b.id}>
                    {b.name}
                  </Badge>
                ))}
              {badges?.length > MAX_BADGES_COLUMN && (
                <Badge color='#222'>
                  +{badges.slice(MAX_BADGES_COLUMN).length}
                </Badge>
              )}
            </>
          ),
        },
        {
          key: 'External Profiles',
          render: ({ id, name }) => (
            <>
              <ExternalProfileButton type='osm-profile' userId={name} />
              {SCOREBOARD_URL && (
                <ExternalProfileButton type='scoreboard' userId={id} />
              )}
              {HDYC_URL && <ExternalProfileButton type='hdyc' userId={name} />}
              <ExternalProfileButton type='osmcha' userId={name} />
            </>
          ),
        },
      ]
      break
    case 'org-staff':
      apiBasePath = `/organizations/${orgId}/staff`
      emptyMessage = 'No staff found.'
      columns = [
        {
          key: 'name',
          sortable: true,
          render: (user) => (
            <Button
              size='md'
              variant='link'
              onClick={() => onUsernameClick(user)}
            >
              {user.name}
            </Button>
          ),
        },
        { key: 'id', label: 'OSM ID', sortable: true },
        {
          key: 'type',
          label: 'role',
          sortable: true,
          render: ({ type }) => (
            <Badge color={roleBgColor[type.toLowerCase()]}>
              {makeTitleCase(type)}
            </Badge>
          ),
        },
        {
          key: 'External Profiles',
          render: ({ id, name }) => (
            <>
              <ExternalProfileButton type='osm-profile' userId={name} />
              {SCOREBOARD_URL && (
                <ExternalProfileButton type='scoreboard' userId={id} />
              )}
              {HDYC_URL && <ExternalProfileButton type='hdyc' userId={name} />}
              <ExternalProfileButton type='osmcha' userId={name} />
            </>
          ),
        },
      ]
      break
    default:
      break
  }

  const {
    result: { data, pagination },
    isLoading,
  } = useFetchList(`${apiBasePath}?${querystring}`)

  if (!isLoading && search?.length > 0) {
    emptyMessage = 'Search returned no results.'
  }

  if (isRequesterOwner) {
    columns = append(
      {
        key: 'actions',
        render: (user) => {
          let actions = []
          const profileId = +user.id
          const isProfileManager = contains(profileId, managerIds)
          const isProfileOwner = contains(profileId, ownerIds)

          actions.push({
            name: 'Assign a Badge',
            onClick: () =>
              router.push(
                join(URL, `/organizations/${orgId}/badges/assign/${profileId}`)
              ),
          })

          if (
            profileId !== requesterId &&
            isProfileOwner &&
            ownerIds.length > 1
          ) {
            actions.push({
              name: 'Remove owner',
              onClick: async () => {
                await removeOwner(orgId, profileId)
                onAction()
              },
            })
          }
          if (profileId !== requesterId && isProfileManager) {
            if (!isProfileOwner) {
              actions.push({
                name: 'Promote to owner',
                onClick: async () => {
                  await addOwner(orgId, profileId)
                  onAction()
                },
              })
              actions.push({
                name: 'Remove manager',
                onClick: async () => {
                  await removeManager(orgId, profileId)
                  onAction()
                },
              })
            }
          }
          if (!isProfileManager && !isProfileOwner) {
            actions.push({
              name: 'Add manager',
              onClick: async () => {
                await addManager(orgId, profileId)
                onAction()
              },
            })
          }
          return (
            <Menu>
              <MenuButton
                as={IconButton}
                size='sm'
                variant='ghost'
                aria-label='User actions menu'
                title={
                  actions?.length > 0
                    ? 'Display user actions menu'
                    : 'No actions for this user'
                }
                isDisabled={actions?.length === 0}
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
      },
      columns
    )
  }

  return (
    <>
      {isSearchable && (
        <SearchInput
          data-cy={`${type}-table`}
          onSearch={(search) => {
            // Reset to page 1 and search
            setPage(1)
            setSearch(search)
          }}
          placeholder='Search by username'
        />
      )}
      <Table
        sort={sort}
        setSort={setSort}
        data-cy={`${type}-table`}
        rows={data}
        columns={columns}
        emptyPlaceHolder={isLoading ? 'Loading...' : emptyMessage}
      />
      {pagination?.total > 0 && (
        <Pagination
          data-cy={`${type}-table-pagination`}
          pagination={pagination}
          setPage={setPage}
        />
      )}
    </>
  )
}

UsersTable.propTypes = {
  type: T.oneOf(['org-members', 'org-staff']).isRequired,
  orgId: T.number,
}

export default UsersTable
