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
  Text,
} from '@chakra-ui/react'
import { AtSignIcon, AddIcon } from '@chakra-ui/icons'
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
          <Flex
            as={Form}
            alignItems='center'
            justifyContent='space-between'
            width={'100%'}
            gap={2}
          >
            <Field
              as={Input}
              type='text'
              name='osmId'
              id='osmId'
              placeholder='OSM ID'
              value={values.osmId}
              flex={1}
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
        setSearchResult(data.users)
        setStatus('successSearch')
      } else {
        setSearchResult([])
        setStatus('noResults')
      }
    } else {
      setSearchResult([])
      setStatus('noResults')
    }
  }
  const submit = async (uid, username, actions) => {
    actions.setSubmitting(true)

    try {
      await onSubmit({ osmId: uid, username })
      actions.setSubmitting(false)
      actions.resetForm({ username: '' })
      setSearchResult([])
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
            <Flex
              as={Form}
              alignItems='center'
              justifyContent='space-between'
              width={'100%'}
              gap={2}
            >
              <Field
                as={Input}
                type='text'
                name='username'
                id='username'
                placeholder='Search OSM Username'
                value={values.username}
                flex={1}
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
            <Box display='flex' justifyContent='stretch' py={3} px={1}>
              <List spacing={5} fontSize='sm' width={'100%'}>
                {searchResult?.length &&
                  searchResult.map((result) => (
                    <ListItem
                      key={result.id}
                      display='flex'
                      alignItems='center'
                      justifyContent='space-between'
                      marginTop='1rem'
                    >
                      <ListIcon as={AtSignIcon} color='brand.600' />
                      <Link
                        href={join(OSM_DOMAIN, '/user', result.name)}
                        isExternal
                      >
                        {result.name}
                      </Link>
                      <Code ml={2}>{result.id}</Code>
                      <Button
                        ml='auto'
                        textTransform='lowercase'
                        onClick={async () =>
                          submit(result.id, result.name, {
                            setStatus,
                            setSubmitting,
                            resetForm,
                          })
                        }
                        size='sm'
                        isLoading={isSubmitting}
                        loadingText='Adding'
                        isDisabled={isSubmitting}
                        leftIcon={<AddIcon />}
                      >
                        Add
                      </Button>
                    </ListItem>
                  ))}
                {status === 'noResults' && (
                  <Text as='b'>
                    No results found. Try typing the exact OSM username.
                  </Text>
                )}
              </List>
            </Box>
          </>
        )
      }}
    />
  )
}
