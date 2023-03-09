import React, { useState, useEffect } from 'react'
import join from 'url-join'
import {
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  useClipboard,
} from '@chakra-ui/react'
import {
  createTeamJoinInvitation,
  getTeamJoinInvitations,
} from '../lib/teams-api'
import { toast } from 'react-toastify'
import logger from '../lib/logger'
import { CopyIcon } from '@chakra-ui/icons'
const APP_URL = process.env.APP_URL

export default function JoinLink({ id }) {
  const [joinLink, setJoinLinks] = useState(null)
  const { onCopy, hasCopied } = useClipboard(joinLink)

  const getTeamJoinLink = async function () {
    try {
      const invitations = await getTeamJoinInvitations(id)
      if (invitations.length) {
        setJoinLinks(
          join(APP_URL, `teams/${id}/invitations/${invitations[0].id}`)
        )
      }
    } catch (e) {
      logger.error(e)
      toast.error(e)
    }
  }
  useEffect(() => {
    getTeamJoinLink()
  }, [])

  const createJoinLink = async function () {
    try {
      await createTeamJoinInvitation(id)
      getTeamJoinLink()
    } catch (e) {
      logger.error(e)
      toast.error(e)
    }
  }
  return (
    <div style={{ marginTop: '1rem' }}>
      {joinLink ? (
        <InputGroup size='sm'>
          <InputLeftAddon bg='brand.700' fontSize='xs' px={2}>
            Join Link:
          </InputLeftAddon>
          <Input
            readOnly
            textOverflow={'ellipsis'}
            value={joinLink}
            borderLeftColor='whiteAlpha.400'
          />
          <InputRightAddon p={0} bg={'brand.500'}>
            <Button
              variant='outline'
              color='white'
              size='sm'
              leftIcon={<CopyIcon />}
              onClick={onCopy}
            >
              {hasCopied ? 'Copied!' : 'Copy'}
            </Button>
          </InputRightAddon>
        </InputGroup>
      ) : (
        <Button size='sm' onClick={() => createJoinLink(id)}>
          Create Join Link
        </Button>
      )}
    </div>
  )
}
