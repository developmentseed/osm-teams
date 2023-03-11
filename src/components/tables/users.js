import T from 'prop-types'
import Table from './table'
import Badge from '../badge'
import { useToken, Flex, Text } from '@chakra-ui/react'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import Pagination from '../pagination'
import qs from 'qs'
import SearchInput from './search-input'
import ExternalProfileButton from '../external-profile-button'
import { makeTitleCase } from '../../../app/lib/utils'

const SCOREBOARD_URL = process.env.SCOREBOARD_URL
const HDYC_URL = process.env.HDYC_URL

function UsersTable({ type, orgId, onRowClick, isSearchable }) {
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
          render: ({ name, id }) => (
            <Flex flexDir='column'>
              <Text fontWeight='bold' color='brand.600'>
                {name}
              </Text>
              <Text>{id}</Text>
            </Flex>
          ),
        },
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
      ]
      break
    case 'org-staff':
      apiBasePath = `/organizations/${orgId}/staff`
      emptyMessage = 'No staff found.'
      columns = [
        {
          key: 'name',
          sortable: true,
          render: ({ name, id }) => (
            <Flex flexDir='column'>
              <Text fontWeight='bold' color='brand.600'>
                {name}
              </Text>
              <Text>{id}</Text>
            </Flex>
          ),
        },
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
        onRowClick={onRowClick}
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
