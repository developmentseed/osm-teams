import React, { Component } from 'react'
import { assoc, isEmpty } from 'ramda'
import Popup from 'reactjs-popup'

import ProfileAttributeForm from '../../../components/profile-attribute-form'
import { Box, Button, Container, Flex, Heading } from '@chakra-ui/react'
import Table from '../../../components/tables/table'
import {
  addTeamMemberAttributes,
  getTeamMemberAttributes,
  modifyAttribute,
  deleteAttribute,
} from '../../../lib/profiles-api'

import logger from '../../../lib/logger'
import Link from 'next/link'
import InpageHeader from '../../../components/inpage-header'

export default class TeamEditProfile extends Component {
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
      <Popup
        trigger={<span>⚙️</span>}
        position='left top'
        on='click'
        closeOnDocumentClick
        contentStyle={{ padding: '10px', border: 'none' }}
      >
        <ul>
          <li
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
          </li>
          <li
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
          </li>
        </ul>
        {/* <style jsx>
          {`
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            li {
              padding-left: 0.5rem;
            }

            li:hover {
              color: ${theme.colors.secondaryColor};
            }
          `}
        </style> */}
      </Popup>
    )
  }

  async getAttributes() {
    const { id } = this.props
    try {
      let memberAttributes = await getTeamMemberAttributes(id)
      this.setState({
        teamId: id,
        memberAttributes,
        loading: false,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        teamId: null,
        memberAttributes: [],
        loading: false,
      })
    }
  }

  render() {
    const { memberAttributes, teamId } = this.state
    const columns = [
      { key: 'name' },
      { key: 'description' },
      { key: 'visibility' },
      { key: 'key_type', header: 'type' },
      { key: 'required' },
      { key: 'actions' },
    ]

    let rows = []
    if (memberAttributes) {
      rows = memberAttributes.map((attribute) => {
        let newAttribute = assoc('actions', this.renderActions, attribute)
        newAttribute.required = attribute.required.toString()
        return newAttribute
      })
    }

    const CancelButton = (
      <Button
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
          <Link href={`/teams/${teamId}/edit`}>← Back to Edit Team</Link>
          <Heading color='white'>Editing Team Attributes</Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box layerStyle='shadowed' as='article'>
            <Heading as='h2' size='md'>
              Current Attributes
            </Heading>
            <p>
              Members of your team will be able to add these attributes to their
              profile.
            </p>
            {memberAttributes && isEmpty(memberAttributes) ? (
              "You haven't added any attributes yet!"
            ) : (
              <Table rows={rows} columns={columns} />
            )}
          </Box>
          <Box layerStyle={'shadowed'} as='section'>
            {this.state.isModifying ? (
              <>
                <Heading size='md' as='h3'>
                  Modify attribute
                </Heading>
                <ProfileAttributeForm
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
                <Heading size='md' as='h3'>
                  Add an attribute
                </Heading>
                <p>Add an attribute to your team member&apos;s profile</p>
                <ProfileAttributeForm
                  onSubmit={async (attributes) => {
                    await addTeamMemberAttributes(teamId, attributes)
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
