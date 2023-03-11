import React from 'react'
import {
  Box,
  Container,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  Flex,
} from '@chakra-ui/react'
import { SiGithub } from 'react-icons/si'
import InpageHeader from '../components/inpage-header'
import Image from 'next/image'

export default function About() {
  return (
    <Box as='main' mb={8}>
      <InpageHeader>
        <Heading color='white' mb={2}>
          About OSM Teams
        </Heading>
      </InpageHeader>
      <Container maxW='container.xl' as='section'>
        <Box layerStyle={'shadowed'}>
          <Container
            maxW='container.md'
            mx={0}
            p={0}
            display='flex'
            flexDirection='column'
            gap={8}
            as='article'
          >
            <Flex direction='column' gap={4}>
              <Heading size='md'>What is OSM Teams?</Heading>
              <Text>
                OSM Teams is an independent authentication API that has a
                framework for creating teams and roles in the OpenStreetMap
                ecosystem. It allows for management of groups and communities to
                organize around existing tools like{' '}
                <a
                  href='https://tasks.hotosm.org/'
                  target='_blank'
                  rel='noreferrer'
                >
                  Tasking Manager
                </a>
                ,{' '}
                <a href='https://osmcha.org' target='_blank' rel='noreferrer'>
                  OSMCha
                </a>
                , or{' '}
                <a
                  href='https://www.openstreetmap.org/edit'
                  target='_blank'
                  rel='noreferrer'
                >
                  iD
                </a>
                , and improves collaboration.
              </Text>
              <Text>
                OSM Teams provides an easier way to connect across platforms,
                find mappers working in a similar domain, manage coordinated
                campaigns and tasks, and organize around shared goals. As an
                independent API, Teams is a lightweight “glue” service to create
                and manage team membership, which developers can integrate into
                their platforms to provide a unified team experience for users.
              </Text>
              <Text>
                OSM Teams provides an OSM-native community organization tool,
                allowing users to sign in with their OSM profile, and connect
                and use their teams in any OSM ecosystem applications. OSM Teams
                sits between OSM OAuth and your apps to give an interface to
                create, share and manage your team.
              </Text>
            </Flex>
            <Flex direction='column' gap={4}>
              <Heading size='md'>Get Involved</Heading>
              <List>
                <ListItem>
                  <a
                    href='https://github.com/developmentseed/osm-teams'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <ListIcon as={SiGithub} color='brand.500' />
                    See the code on Github
                  </a>
                </ListItem>
              </List>
            </Flex>
            <Flex direction='column' gap={4}>
              <Heading size='md'>Community</Heading>
              <Text variant={'overline'}>Created by</Text>
              <a
                href='https://developmentseed.org'
                target='_blank'
                rel='noreferrer'
              >
                <Image
                  src='/static/ds-logo-pos.svg'
                  alt='Development Seed logo'
                  width='280'
                  height='280'
                />
                <Text display='none'>Development Seed</Text>
              </a>
              <Text variant={'overline'}>With Support From</Text>
              <a
                href='https://www.youthmappers.org'
                target='_blank'
                rel='noreferrer'
              >
                <Image
                  src='/static/youthmappers-logo.jpeg'
                  alt='YouthMappers logo'
                  quality={100}
                  width='280'
                  height='60'
                />
                <Text display='none'>YouthMappers</Text>
              </a>
            </Flex>
          </Container>
        </Box>
      </Container>
    </Box>
  )
}
