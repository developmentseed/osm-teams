import React, { useState } from 'react'
import { Formik, Field, Form, FormErrorMessage } from 'formik'
import {
  Box,
  Button,
  Flex,
  Input,
  List,
  ListItem,
  ListIcon,
  Link,
  Code,
} from '@chakra-ui/react'
import { AtSignIcon } from '@chakra-ui/icons'
import join from 'url-join'

import logger from '../lib/logger'

const APP_URL = process.env.APP_URL
const OSM_DOMAIN = process.env.OSM_DOMAIN

export function AddMemberByIdForm({ onSubmit }) {
  return (
    <Formik
      initialValues={{ osmId: '' }}
      onSubmit={async (data, actions) => {
        actions.setSubmitting(true)

        try {
          await onSubmit(data)
          actions.setSubmitting(false)
          actions.resetForm({ osmId: '' })
        } catch (e) {
          logger.error(e)
          actions.setSubmitting(false)
          actions.setStatus(e.message)
        }
      }}
      render={({ status, isSubmitting, values }) => {
        const addMemberText = `Add Member ${isSubmitting ? ' 🕙' : ''}`

        return (
          <Flex as={Form} alignItems='center'>
            <Field
              as={Input}
              type='text'
              name='osmId'
              id='osmId'
              placeholder='OSM ID'
              value={values.osmId}
              style={{ width: '6rem', marginRight: '0.5rem' }}
            />
            {status && status.msg && (
              <FormErrorMessage>{status.msg}</FormErrorMessage>
            )}
            <Button
              textTransform={'lowercase'}
              type='submit'
              variant='outline'
              isLoading={isSubmitting}
              loadingText='Adding'
              isDisabled={isSubmitting}
            >
              {addMemberText}
            </Button>
          </Flex>
        )
      }}
    />
  )
}

export function AddMemberByUsernameForm({ onSubmit }) {
  const [searchResult, setSearchResult] = useState()
  const searchUsername = async (data, setStatus) => {
    setStatus('searching')
    let res = await fetch(join(APP_URL, `/api/users?search=${data.username}`))
    if (res.status === 200) {
      const data = await res.json()
      if (data?.users.length) {
        setSearchResult(data.users[0])
        setStatus('successSearch')
      } else {
        setSearchResult({})
        setStatus('noResults')
      }
    } else {
      setSearchResult({})
      setStatus('noResults')
    }
  }
  const submit = async (uid, actions) => {
    actions.setSubmitting(true)

    try {
      await onSubmit({ osmId: uid })
      actions.setSubmitting(false)
      actions.resetForm({ username: '' })
      setSearchResult({})
    } catch (e) {
      logger.error(e)
      actions.setSubmitting(false)
      actions.setStatus(e.message)
    }
  }
  return (
    <Formik
      initialValues={{ username: '' }}
      render={({
        status,
        setStatus,
        isSubmitting,
        values,
        setSubmitting,
        resetForm,
      }) => {
        return (
          <>
            <Flex as={Form} alignItems='center'>
              <Field
                as={Input}
                type='text'
                name='username'
                id='username'
                placeholder='OSM Username'
                value={values.username}
                style={{ width: '6rem', marginRight: '0.5rem' }}
              />
              {status && status.msg && (
                <FormErrorMessage>{status.msg}</FormErrorMessage>
              )}
              <Button
                textTransform={'lowercase'}
                onClick={() => searchUsername(values, setStatus)}
                variant='outline'
                isLoading={status === 'searching'}
                loadingText='Searching'
                isDisabled={status === 'searching' || !values.username}
              >
                Search
              </Button>
            </Flex>
            <Box display='flex' alignItems='baseline' padding='0.75rem 0.5rem'>
              {searchResult?.id && (
                <List spacing={5} fontSize='sm'>
                  <ListItem>
                    <ListIcon as={AtSignIcon} color='brand.600' />
                    <Link
                      href={join(OSM_DOMAIN, '/user', searchResult.name)}
                      isExternal
                    >
                      {searchResult.name}
                    </Link>
                    <Code margin='0rem 0.5rem'>{searchResult.id}</Code>
                    <Button
                      textTransform='lowercase'
                      onClick={async () =>
                        submit(searchResult.id, {
                          setStatus,
                          setSubmitting,
                          resetForm,
                        })
                      }
                      size='sm'
                      isLoading={isSubmitting}
                      loadingText='Adding'
                      isDisabled={isSubmitting}
                    >
                      Add
                    </Button>
                  </ListItem>
                </List>
              )}
              {status === 'noResults' && <p>No results found</p>}
            </Box>
          </>
        )
      }}
    />
  )
}
