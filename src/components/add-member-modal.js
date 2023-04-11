import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { AddMemberByIdForm, AddMemberByUsernameForm } from './add-member-form'

export function AddMemberModal({ isOpen, onClose, onSubmit }) {
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
          <Heading size='sm' as='h3'>
            Add Member
          </Heading>
          <Box>
            <Heading size='sm' as='h4'>
              OSM ID
            </Heading>
            <AddMemberByIdForm onSubmit={onSubmit} />
          </Box>
          <Box>
            <Heading size='sm' as='h4'>
              OSM Username
            </Heading>
            <AddMemberByUsernameForm onSubmit={onSubmit} />
          </Box>
          <ModalCloseButton onClick={() => onClose()} />
        </ModalHeader>
        <ModalBody></ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  )
}
