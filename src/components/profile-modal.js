import React, { useRef } from 'react'
import { isEmpty } from 'ramda'
import {
  Avatar,
  Button,
  CloseButton,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Wrap,
} from '@chakra-ui/react'
import Badge from './badge'

function renderActions(actions) {
  return (
    <Menu>
      <MenuButton as={Button} size='sm' variant='outline'>
        Edit user access
      </MenuButton>
      <MenuList>
        {actions.map((action) => {
          return (
            <MenuItem onClick={() => action.onClick()} key={action.name}>
              {action.name}
            </MenuItem>
          )
        })}
      </MenuList>
    </Menu>
  )
}

function renderBadges(badges) {
  if (!badges || badges.length === 0) {
    return null
  }

  return (
    <Flex alignItems='flex-start' direction='column' gap={2}>
      <Heading size='xs'>User Badges</Heading>
      <Wrap>
        {badges.map((b) => (
          <Badge key={b.color} color={b.color} dot>
            {b.name}
          </Badge>
        ))}
      </Wrap>
    </Flex>
  )
}

export default function ProfileModal({
  user,
  attributes,
  badges,
  onClose,
  actions,
}) {
  actions = actions || []
  let profileContent = <dl>User does not have a profile</dl>
  if (!isEmpty(attributes)) {
    profileContent = (
      <Flex direction='column' gap={2} alignItems='flex-start'>
        {attributes &&
          attributes.map((attribute) => {
            if (attribute.value) {
              return (
                <Flex direction='column' gap={2} as='dl' key={attribute.name}>
                  <Text
                    as='dt'
                    fontFamily={'mono'}
                    fontWeight='bold'
                    letterSpacing={'0.5px'}
                    textTransform='uppercase'
                    fontSize='sm'
                  >
                    {attribute.name}:
                  </Text>
                  <Text as='dd'>{attribute.value}</Text>
                </Flex>
              )
            }
          })}
      </Flex>
    )
  }
  const ref = useRef()
  return (
    <Flex direction={'column'} as='article' gap={2} alignItems='flex-start'>
      <Flex
        alignItems='flex-start'
        justifyContent='space-between'
        position='sticky'
        top={-5}
        bg='white'
        py={4}
        mt={-4}
        w={'100%'}
        zIndex={15}
      >
        <Flex alignItems='center' gap={2}>
          <Avatar src={user.image} name={user.name} borderRadius='sm' />
          <Heading size='sm' as='h3'>
            {user.name}
          </Heading>
        </Flex>
        <CloseButton onClick={() => onClose()} />
      </Flex>
      {!isEmpty(actions) && renderActions(actions, ref)}
      {profileContent}
      {renderBadges(badges)}
    </Flex>
  )
}
