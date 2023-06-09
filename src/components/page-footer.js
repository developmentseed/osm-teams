import { Box, Container, Flex, Text } from '@chakra-ui/react'

import NavLink from '../components/Link'

const Links = [
  { url: '/about', name: 'About' },
  { url: '/guide', name: 'User guide' },
  { url: '/developers', name: 'Developers' },
  { url: '/privacy', name: 'Privacy Policy' },
]

export default function PageFooter() {
  return (
    <Box bg='brand.700' color='white' as='footer'>
      <Container
        color='white'
        maxW='container.xl'
        position='relative'
        display='flex'
        justifyContent={['center', null, 'space-between']}
        flexDirection={['column', null, 'row']}
      >
        <Flex
          as='nav'
          alignItems={'center'}
          gap={[0, null, 8]}
          flexDirection={['column', null, 'row']}
        >
          <Text color='white' fontSize='xs' fontFamily='mono'>
            osm_teams
          </Text>
          {Links.map((link) => (
            <NavLink key={link.url} href={link.url} passHref color='white'>
              <Text color='white' fontSize='xs' textTransform='uppercase'>
                {link.name}
              </Text>
            </NavLink>
          ))}
        </Flex>
        <Text
          color='white'
          fontSize='xs'
          fontFamily='mono'
          lineHeight='2rem'
          textAlign='center'
        >
          <a href='https://developmentseed.org' style={{ color: 'white' }}>
            &copy; Development Seed {new Date().getFullYear()}
          </a>
        </Text>
      </Container>
    </Box>
  )
}
