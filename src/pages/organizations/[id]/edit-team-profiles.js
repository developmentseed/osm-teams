import React, { Component } from 'react'
import { assoc, isEmpty } from 'ramda'
import join from 'url-join'
import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react'
import ProfileAttributeForm from '../../../components/profile-attribute-form'
import Table from '../../../components/tables/table'
import {
  addOrgTeamAttributes,
  getOrgTeamAttributes,
  modifyAttribute,
  deleteAttribute,
} from '../../../lib/profiles-api'
import logger from '../../../lib/logger'
import Link from 'next/link'
import InpageHeader from '../../../components/inpage-header'

const APP_URL = process.env.APP_URL

export default class OrgEditTeamProfile extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        id: query.id,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      isAdding: false,
      isModifying: false,
      isDeleting: false,
      rowToModify: {},
      rowToDelete: {},
      loading: true,
      error: undefined,
    }

    this.renderActions = this.renderActions.bind(this)
  }

  async componentDidMount() {
    this.getAttributes()
  }

  renderActions(row) {
    return (
      <Menu>
        <MenuButton as={Button} size='sm' variant='outline'>
          Edit
        </MenuButton>
        <Portal>
          <MenuList>
            <MenuItem
              fontSize='sm'
              onClick={async () => {
                this.setState({
                  isModifying: true,
                  isAdding: false,
                  isDeleting: false,
                  rowToModify: assoc(
                    'required',
                    row.required === 'true' ? ['required'] : [],
                    row
                  ),
                })
              }}
            >
              Modify
            </MenuItem>
            <MenuItem
              fontSize='sm'
              onClick={async () => {
                this.setState({
                  isModifying: false,
                  isAdding: false,
                  isDeleting: true,
                  rowToDelete: row,
                })
              }}
            >
              Delete
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    )
  }

  async getAttributes() {
    const { id } = this.props
    try {
      let teamAttributes = await getOrgTeamAttributes(id)
      this.setState({
        orgId: id,
        teamAttributes,
        loading: false,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        orgId: null,
        teamAttributes: [],
        loading: false,
      })
    }
  }

  render() {
    const { teamAttributes, orgId } = this.state
    const columns = [
      { key: 'name' },
      { key: 'description' },
      { key: 'visibility' },
      { key: 'key_type', label: 'type' },
      { key: 'required' },
      { key: 'actions', render: this.renderActions },
    ]

    let rows = []
    if (teamAttributes) {
      rows = teamAttributes.map((attribute) => {
        let newAttribute = assoc('actions', this.renderActions, attribute)
        newAttribute.required = attribute.required.toString()
        return newAttribute
      })
    }

    const CancelButton = (
      <Button
        variant='outline'
        onClick={() =>
          this.setState({
            isModifying: false,
            isAdding: false,
            isDeleting: false,
          })
        }
      >
        Cancel
      </Button>
    )

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={join(APP_URL, `/organizations/${orgId}/edit`)}>
            ← Back to Edit Organization
          </Link>
          <Heading color='white'>Editing Organization Team Attributes</Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box layerStyle='shadowed' as='section'>
            <Heading variant='sectionHead' as='h2'>
              Current Attributes
            </Heading>
            <p>
              Teams of your organization will be able to add these attributes to
              their team details.
            </p>
            {teamAttributes && isEmpty(teamAttributes) ? (
              "You haven't added any attributes yet!"
            ) : (
              <Table rows={rows} columns={columns} />
            )}
          </Box>
          <Box layerStyle='shadowed' as='section'>
            {this.state.isModifying ? (
              <>
                <Heading as='h2' variant='sectionHead'>
                  Modify Attributes
                </Heading>
                <ProfileAttributeForm
                  formType='org'
                  initialValues={this.state.rowToModify}
                  onSubmit={async (attribute) => {
                    await modifyAttribute(attribute.id, attribute)
                    this.setState({ isModifying: false })
                    return this.getAttributes()
                  }}
                />
                {CancelButton}
              </>
            ) : (
              ''
            )}
            {this.state.isAdding ? (
              <>
                <Heading as='h3' variant='sectionHead'>
                  Add an attribute
                </Heading>
                <p>
                  Add an attribute to your organization&apos;s teams&apos;
                  details
                </p>
                <ProfileAttributeForm
                  formType='org'
                  onSubmit={async (attributes) => {
                    await addOrgTeamAttributes(orgId, attributes)
                    this.setState({ isAdding: false })
                    return this.getAttributes()
                  }}
                />
                {CancelButton}
              </>
            ) : (
              !(this.state.isModifying || this.state.isDeleting) && (
                <Button
                  onClick={() =>
                    this.setState({
                      isAdding: true,
                      isModifying: false,
                    })
                  }
                >
                  Add attribute
                </Button>
              )
            )}
            {this.state.isDeleting ? (
              <Flex gap={4}>
                <Button
                  colorScheme='red'
                  onClick={async () => {
                    await deleteAttribute(this.state.rowToDelete.id)
                    this.setState({ isDeleting: false })
                    return this.getAttributes()
                  }}
                >
                  Confirm Delete
                </Button>
                {CancelButton}
              </Flex>
            ) : (
              ''
            )}
          </Box>
        </Container>
      </Box>
    )
  }
}
