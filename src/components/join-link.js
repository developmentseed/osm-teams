import React from 'react'
import {
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  useClipboard,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'

export default function JoinLink({ joinLink, createJoinLink }) {
  const { onCopy, hasCopied } = useClipboard(joinLink)
  return (
    <div style={{ marginTop: '1rem' }}>
      {joinLink ? (
        <InputGroup size='sm'>
          <InputLeftAddon bg='brand.600' fontSize='xs'>
            Join Link:
          </InputLeftAddon>
          <Input readOnly noOfLines={1} value={joinLink} />
          <InputRightAddon p={0}>
            <Button size='sm' leftIcon={<CopyIcon />} onClick={onCopy}>
              {hasCopied ? 'Copied!' : 'Copy'}
            </Button>
          </InputRightAddon>
        </InputGroup>
      ) : (
        <Button size='sm' onClick={() => createJoinLink()}>
          Create Invitation Link
        </Button>
      )}
    </div>
  )
}
