import React, { Component } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { Box, Container, Heading } from '@chakra-ui/react'
import EditOrgForm from '../../components/edit-org-form'
import InpageHeader from '../../components/inpage-header'
import { createOrg } from '../../lib/org-api'
import logger from '../../lib/logger'

const APP_URL = process.env.APP_URL

export default class OrgCreate extends Component {
  render() {
    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Heading color='white'>Create New Organization</Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box as='section' layerStyle='shadowed'>
            <EditOrgForm
              onSubmit={async (values, actions) => {
                try {
                  const org = await createOrg(values)
                  actions.setSubmitting(false)
                  Router.push(join(APP_URL, `organizations/${org.id}`))
                } catch (e) {
                  logger.error(e)
                  actions.setSubmitting(false)
                  // set the form errors actions.setErrors(e)
                  actions.setStatus(e.message)
                }
              }}
            />
          </Box>
        </Container>
      </Box>
    )
  }
}
