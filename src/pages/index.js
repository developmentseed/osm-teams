import React from 'react'
import {
  Box,
  Button,
  Card,
  Grid,
  Text,
  UnorderedList,
  ListItem,
  keyframes,
  Code,
} from '@chakra-ui/react'
import join from 'url-join'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

const OSM_NAME = process.env.OSM_NAME
const APP_URL = process.env.APP_URL

const title = String.raw`
   ____  _____ __  ___   _______________    __  ________
  / __ \/ ___//  |/  /  /_  __/ ____/   |  /  |/  / ___/
 / / / /\__ \/ /|_/ /    / / / __/ / /| | / /|_/ /\__ \
/ /_/ /___/ / /  / /    / / / /___/ ___ |/ /  / /___/ /
\____//____/_/  /_/    /_/ /_____/_/  |_/_/  /_//____/
`
const VHS = keyframes`
  0% {
    text-shadow: -4px -1px 1px blue, 4px 1px 1px red;
  }
  10% {
    text-shadow: -2px 0 blue, 2px 0 red;
  }
  100% {
    text-shadow: -1px 0 red, 1px 0 blue;
  }
`
const Links = [
  { url: '/dashboard', name: 'My Dashboard' },
  { url: '/teams', name: 'Explore all teams' },
  { url: '/teams/create', name: 'Create new team' },
]

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <Grid
      as='main'
      placeContent={'center'}
      bg='brand.700'
      backgroundImage='radial-gradient(white 5%, transparent 0)'
      backgroundRepeat='repeat'
      backgroundSize='30px 30px'
      fontFamily='mono'
      position='relative'
      overflow='inherit'
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        opacity: '0.8',
        zIndex: '0',
        background: `url(${join(APP_URL, '/static/grid-map.svg')})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        overflow: 'hidden',
      }}
    >
      <Card
        bg={'rgba(25, 51, 130, 0.9)'}
        color='white'
        border={'4px'}
        borderColor='white'
        boxShadow='12px 12px 0 var(--chakra-colors-brand-700), 12px 12px 0 3px white'
        display='flex'
        flexFlow='column wrap'
        textAlign='left'
        maxWidth='48rem'
        padding={8}
        position='relative'
        zIndex='10'
        animation={`${VHS} 2s cubic-bezier(0, 1.21, 0.84, 1.04) 5 alternate`}
        fontWeight={'bold'}
      >
        <Code
          width='100%'
          fontFamily='mono'
          marginBottom='1rem'
          lineHeight={1}
          transition={'text-shadow 0.5s ease'}
          variant='outline'
          colorScheme={'white'}
          fontSize={['0.75rem', '0.8rem', '1rem', '1.25rem']}
          whiteSpace='pre'
        >
          {title}
        </Code>
        <Text pb='8' fontFamily='mono'>
          Create teams of {OSM_NAME} users and import them into your apps.
          Making maps better, together. Enable teams in OpenStreetMap
          applications, or build your team here. It’s dangerous to map alone!
        </Text>
        {status === 'authenticated' ? (
          <Box border='1px' borderStyle={'dashed'} borderWidth={2} p={8}>
            <Code
              fontSize='xl'
              fontFamily='mono'
              marginBottom='1rem'
              colorScheme={'white'}
              whiteSpace='pre'
            >
              Welcome, {session?.user?.name || 'mapper'}
            </Code>
            <UnorderedList
              display='flex'
              flexDir='column'
              listStyleType='none'
              textTransform='uppercase'
              py='2'
              m={0}
              spacing={2}
              color='white'
            >
              {Links.map((link) => {
                return (
                  <ListItem
                    key={link.name}
                    _before={{
                      content: '"--"',
                      lineHeight: 1,
                      marginRight: '10px',
                      color: 'red.500',
                    }}
                  >
                    <Link style={{ color: 'white ' }} href={link.url}>
                      {link.name}
                    </Link>
                  </ListItem>
                )
              })}
            </UnorderedList>
          </Box>
        ) : (
          <Button onClick={() => signIn('osm-teams')}>Sign in →</Button>
        )}
      </Card>
      <div className='map-bg' />
    </Grid>
  )
}
