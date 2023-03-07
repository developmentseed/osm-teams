import React, { Component } from 'react'
import { Box, Button, Container, Heading } from '@chakra-ui/react'
import Link from 'next/link'

const OSM_NAME = process.env.OSM_NAME
class Login extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        challenge: query.challenge,
      }
    }
  }

  render() {
    return (
      <Box>
        <Container maxW='container.xl'>
          <Heading>Login</Heading>
          <p>
            Teams uses {OSM_NAME} as your login, connect your {OSM_NAME}{' '}
            account!
          </p>
          <br />
          <Button
            as={Link}
            layerStyle={'shadowButton'}
            _hover={{
              boxShadow: 'none',
              textDecoration: 'none',
            }}
            href={`/oauth/openstreetmap?login_challenge=${this.props.challenge}`}
          >
            Login with {OSM_NAME}
          </Button>
        </Container>
      </Box>
    )
  }
}

export default Login
