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
      <ModalContent flexDirection={'column'} as='article' gap={2}>
        <ModalHeader gap={4} display='flex' flexDir={'column'}>
          <Heading size='sm' as='h3'>
            Add Member
          </Heading>
          <ModalCloseButton onClick={() => onClose()} />
        </ModalHeader>
        <ModalBody display='flex' flexDirection={'column'} gap={2}>
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
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  )
}
