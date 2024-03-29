import React, { Component } from 'react'
import { Box, Container, Heading, List, ListItem, Text } from '@chakra-ui/react'
import InpageHeader from '../components/inpage-header'
import Link from 'next/link'

const URL = process.env.APP_URL

class Developers extends Component {
  render() {
    return (
      <Box as='main' mb={8}>
        <InpageHeader>
          <Heading color='white' mb={2}>
            OSM Teams Developers Guide
          </Heading>
        </InpageHeader>
        <Container maxW='container.xl'>
          <Box layerStyle={'shadowed'}>
            <Text>
              OSM Teams API builds a second authentication layer on top of the
              OSM id, providing OAuth2 access to a user’s teams. A user signs in
              through your app and clicks a “Connect Teams” button that will
              start the OAuth flow, sending them to our API site to grant access
              to their teams, returning with an access token your app can use to
              authenticate with the API
            </Text>
            <Heading size='lg'>Resources</Heading>
            <List>
              <ListItem>
                <Link href={`${URL}/docs/api`}>API Docs</Link>
              </ListItem>
              <ListItem>
                <a
                  href='https://github.com/developmentseed/osm-teams-node-example'
                  target='_blank'
                  rel='noreferrer'
                >
                  Example Node Integration
                </a>
              </ListItem>
              <ListItem>
                <a
                  href='https://github.com/developmentseed/osm-teams-python-example'
                  target='_blank'
                  rel='noreferrer'
                >
                  Example Python Integration
                </a>
              </ListItem>
            </List>
          </Box>
        </Container>
      </Box>
    )
  }
}

export default Developers
