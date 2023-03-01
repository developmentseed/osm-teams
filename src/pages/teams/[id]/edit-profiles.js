import React, { Component } from 'react'
import { assoc, isEmpty } from 'ramda'
import Popup from 'reactjs-popup'

import ProfileAttributeForm from '../../../components/profile-attribute-form'
import { Button } from '@chakra-ui/react'
import Table from '../../../components/tables/table'
import {
  addTeamMemberAttributes,
  getTeamMemberAttributes,
  modifyAttribute,
  deleteAttribute,
} from '../../../lib/profiles-api'
import theme from '../../../styles/theme'
import logger from '../../../lib/logger'
import Link from 'next/link'

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
        <style jsx>
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
        </style>
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
      <article className='inner page'>
        <Link href={`/teams/${teamId}/edit`}>← Back to Edit Team</Link>
        <section>
          <h2>Current Attributes</h2>
          <p>
            Members of your team will be able to add these attributes to their
            profile.
          </p>
          {memberAttributes && isEmpty(memberAttributes) ? (
            "You haven't added any attributes yet!"
          ) : (
            <Table rows={rows} columns={columns} />
          )}
        </section>
        <section>
          {this.state.isModifying ? (
            <>
              <h2>Modify attribute</h2>
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
              <h2>Add an attribute</h2>
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
            <>
              <Button
                variant='danger'
                onClick={async () => {
                  await deleteAttribute(this.state.rowToDelete.id)
                  this.setState({ isDeleting: false })
                  return this.getAttributes()
                }}
              >
                Confirm Delete
              </Button>
              <span style={{ marginLeft: '1rem' }}>{CancelButton}</span>
            </>
          ) : (
            ''
          )}
        </section>
      </article>
    )
  }
}
