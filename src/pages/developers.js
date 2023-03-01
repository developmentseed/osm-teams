import React, { Component } from 'react'
import { Container, Heading, List, ListItem, Text } from '@chakra-ui/react'

const URL = process.env.APP_URL

class Developers extends Component {
  render() {
    return (
      <Container maxW='container.xl' py={8}>
        <Heading color='brand.600' mb={2}>
          OSM Teams API Guide
        </Heading>
        <Text>
          OSM Teams API builds a second authentication layer on top of the OSM
          id, providing OAuth2 access to a user’s teams. A user signs in through
          your app and clicks a “Connect Teams” button that will start the OAuth
          flow, sending them to our API site to grant access to their teams,
          returning with an access token your app can use to authenticate with
          the API
        </Text>
        <Heading size='lg'>Resources</Heading>
        <List color='brand.600'>
          <ListItem>
            <a href={`${URL}/docs/api`}>API Docs</a>
          </ListItem>
          <ListItem>
            <a href={`${URL}/clients`}>Connect a new application</a>
          </ListItem>
          <ListItem>
            <a href='https://github.com/developmentseed/osm-teams-node-example'>
              Example Node Integration
            </a>
          </ListItem>
          <ListItem>
            <a href='https://github.com/thadk/osm-teams-python-example'>
              Example Python Integration
            </a>
          </ListItem>
        </List>
      </Container>
    )
  }
}

export default Developers
