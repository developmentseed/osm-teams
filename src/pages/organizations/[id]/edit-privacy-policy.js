import React, { Component } from 'react'
import join from 'url-join'
import { prop } from 'ramda'
import Router from 'next/router'
import { getOrg, updateOrgPrivacyPolicy } from '../../../lib/org-api'
import PrivacyPolicyForm from '../../../components/privacy-policy-form'
import logger from '../../../lib/logger'
import Link from 'next/link'
import { Box, Container, Heading } from '@chakra-ui/react'
import InpageHeader from '../../../components/inpage-header'

const APP_URL = process.env.APP_URL

export default class OrgPrivacyPolicy extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        // Organization id
        id: query.id,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
    }

    this.getProfileForm = this.getProfileForm.bind(this)
  }

  async componentDidMount() {
    this.getProfileForm()
  }

  async getProfileForm() {
    const { id } = this.props
    try {
      let org = await getOrg(id)
      let privacyPolicy = prop('privacy_policy', org)
      this.setState({
        orgId: id,
        privacyPolicy,
        loading: false,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        orgId: null,
        profileForm: [],
        loading: false,
      })
    }
  }

  render() {
    const { privacyPolicy, orgId } = this.state
    if (!orgId) return null

    const defaultValues = {
      body: 'OSM Teams has the ability to collect additional information on registered users of OpenStreetMap. Exactly which types of information are collected is determined by Organization and/or Team moderators. OSM Teams will never sell or share user information directly from the database. The use of any information submitted by a member of a team or organization is at the full discretion of the team or organization moderator.',
      consentText:
        'I understand the associated risks of using and entering my information on OSM Teams.',
    }

    let initialValues = privacyPolicy || defaultValues

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={join(APP_URL, `/organizations/${orgId}/edit`)}>
            ← Back to Edit Organization
          </Link>
          <Heading color='white'>Editing Organization Privacy Policy</Heading>
        </InpageHeader>
        <Container maxW={'container.xl'} as='section'>
          <Box layerStyle={'shadowed'} as='article'>
            <PrivacyPolicyForm
              initialValues={initialValues}
              onSubmit={async (values, actions) => {
                try {
                  await updateOrgPrivacyPolicy(orgId, values)
                  actions.setSubmitting(false)
                  Router.push(join(APP_URL, `/organizations/${orgId}/edit`))
                } catch (e) {
                  logger.error(e)
                  actions.setSubmitting(false)
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
