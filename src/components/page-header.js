import {
  Box,
  Container,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  List,
  ListItem,
  Heading,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons'
import NavLink from '../components/Link'

const Links = [
  { url: '/teams', name: 'Explore' },
  { url: '/developers', name: 'About' },
]

export default function PageHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <Box bg='white' as='header' borderBottom={'2px'} borderColor='base.600'>
      <Container
        color='brand.600'
        px={4}
        maxW='container.xl'
        position='relative'
        zIndex='100'
      >
        <Flex
          as='nav'
          h={16}
          alignItems={'center'}
          justifyContent={[null, 'flex-start', 'space-between']}
        >
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            mr={2}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <NavLink
              href='/'
              color='brand.600'
              fontFamily='mono'
              _hover={{ textDecoration: 'none' }}
            >
              osm_teams
            </NavLink>
            <HStack
              as={'nav'}
              spacing={8}
              display={{ base: 'none', md: 'flex' }}
            >
              {Links.map((link) => (
                <Button
                  href={link.url}
                  key={link.url}
                  as={NavLink}
                  size='md'
                  variant='outline'
                  activeProps={{
                    background: 'brand.500 !important',
                    color: 'white !important',
                    border:
                      '1px solid var(--chakra-colors-brand-500) !important',
                  }}
                >
                  {link.name}
                </Button>
              ))}
              {isAuthenticated && (
                <Button
                  href={'/profile'}
                  as={NavLink}
                  size='md'
                  variant='outline'
                  activeProps={{
                    background: 'brand.500 !important',
                    color: 'white !important',
                    border:
                      '1px solid var(--chakra-colors-brand-500) !important',
                  }}
                >
                  Dashboard
                </Button>
              )}
            </HStack>
          </HStack>
          <Flex alignItems={'center'} ml={'auto'}>
            {isAuthenticated ? (
              <>
                <Menu>
                  <MenuButton
                    as={Button}
                    variant='outline'
                    color='brand.600'
                    textTransform={'lowercase'}
                    _hover={{ background: 'brand.600', textDecoration: 'none' }}
                    size={'sm'}
                    mr={4}
                    leftIcon={<AddIcon />}
                  >
                    Add New
                  </MenuButton>
                  <MenuList bg='brand.600' color='white' zIndex={20}>
                    <MenuItem bg='inherit'>
                      <NavLink href='/teams/create'>
                        <span>New Team</span>
                      </NavLink>
                    </MenuItem>
                    <MenuItem bg='inherit'>
                      <NavLink href='/organizations/create'>
                        <span>New Organization</span>
                      </NavLink>
                    </MenuItem>
                  </MenuList>
                </Menu>
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                    border={'2px'}
                    borderColor='base.600'
                  >
                    <Avatar
                      size={'sm'}
                      src={session.user.image}
                      name={session.user.name}
                    />
                  </MenuButton>
                  <MenuList
                    bg='brand.600'
                    color='white'
                    zIndex={20}
                    borderRadius={0}
                  >
                    <MenuItem bg='inherit' _hover={{ cursor: 'default' }}>
                      <Avatar size={'xs'} mr={2} src={session.user.image} />
                      <Heading color='white' as='h4' size='sm'>
                        {session.user.name}
                      </Heading>
                    </MenuItem>
                    <MenuDivider />

                    <MenuItem bg='inherit'>
                      <NavLink href='/dashboard'>
                        <span>Dashboard</span>
                      </NavLink>
                    </MenuItem>
                    <MenuItem bg='inherit'>
                      <NavLink href='/profile'>
                        <span>Profile</span>
                      </NavLink>
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                      as={Button}
                      colorScheme='red'
                      onClick={signOut}
                      bg='inherit'
                    >
                      Log Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <Button
                className='global-menu__link login'
                onClick={() => signIn('osm-teams')}
              >
                Sign in
              </Button>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Drawer isOpen={isOpen} placement='left' onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent bg='brand.500' color='white' zIndex='3000'>
              <DrawerCloseButton />
              <DrawerBody py={4}>
                <NavLink href='/'>osm_teams</NavLink>
                <List spacing='8' mt={16}>
                  {Links.map((link) => (
                    <ListItem key={link.url}>
                      <NavLink href={link.url}>
                        <span>{link.name}</span>
                      </NavLink>
                    </ListItem>
                  ))}
                  {isAuthenticated && (
                    <ListItem>
                      <NavLink href={'/profile'}>
                        <span>Dashboard</span>
                      </NavLink>
                    </ListItem>
                  )}
                </List>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : null}
      </Container>
    </Box>
  )
}
