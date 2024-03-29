import React from 'react'
import { isEmpty } from 'ramda'
import {
  Avatar,
  Flex,
  Heading,
  Text,
  Wrap,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  Modal,
  ModalFooter,
} from '@chakra-ui/react'
import Badge from './badge'

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
  isOpen,
}) {
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
                    variant='overline'
                    fontWeight='bold'
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
  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior={'inside'}
    >
      <ModalOverlay />
      <ModalContent
        direction={'column'}
        as='article'
        gap={2}
        alignItems='flex-start'
      >
        <ModalHeader gap={4} display='flex' flexDir={'column'}>
          <Flex alignItems='center' gap={2}>
            <Avatar
              src={user?.image}
              name={user?.name}
              size='sm'
              borderRadius='sm'
            />
            <Heading size='sm' as='h3'>
              {user?.name}
            </Heading>
          </Flex>
          <ModalCloseButton onClick={() => onClose()} />
        </ModalHeader>
        <ModalBody>{profileContent}</ModalBody>
        <ModalFooter>{renderBadges(badges)}</ModalFooter>
      </ModalContent>
    </Modal>
  )
}
