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
import Image from 'next/image'

const Links = [
  { url: '/teams', name: 'Explore' },
  { url: '/about', name: 'About' },
  { url: '/developers', name: 'Developers' },
]

export default function PageHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <Box
      color='brand.600'
      bg='white'
      as='header'
      borderBottom={'2px'}
      borderColor='base.600'
    >
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
            variant='outline'
            mr={2}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <NavLink href='/' passHref legacyBehavior>
              <Heading
                color='brand.600'
                fontFamily='mono'
                size='sm'
                display='flex'
                alignItems='center'
                gap={1}
                as='a'
                _hover={{ textDecoration: 'none' }}
              >
                <Image
                  src='/static/osmteams_logo--pos.svg'
                  alt={'OSM Teams Logo'}
                  width='48'
                  height='48'
                />
                osm_teams
              </Heading>
            </NavLink>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
              {isAuthenticated && (
                <NavLink href={'/dashboard'} passHref legacyBehavior>
                  <Button
                    as='a'
                    variant='outline'
                    size='sm'
                    textTransform={'lowercase'}
                    _hover={{ background: 'brand.200', textDecoration: 'none' }}
                    sx={{
                      '.active&': {
                        bg: 'brand.500',
                        color: 'white',
                        borderColor: 'brand.500',
                      },
                    }}
                  >
                    My Dashboard
                  </Button>
                </NavLink>
              )}
              {Links.map((link) => (
                <NavLink href={link.url} passHref key={link.url} legacyBehavior>
                  <Button
                    as='a'
                    variant='outline'
                    textTransform={'lowercase'}
                    size='sm'
                    _hover={{ background: 'brand.200', textDecoration: 'none' }}
                    sx={{
                      '.active&': {
                        bg: 'brand.500',
                        color: 'white',
                        borderColor: 'brand.500',
                      },
                    }}
                  >
                    {link.name}
                  </Button>
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'} ml={'auto'}>
            {isAuthenticated ? (
              <>
                <Menu>
                  <MenuButton
                    as={Button}
                    variant='outline'
                    textTransform={'lowercase'}
                    _hover={{ background: 'brand.200', textDecoration: 'none' }}
                    size={'sm'}
                    mr={4}
                    leftIcon={<AddIcon />}
                  >
                    Add New
                  </MenuButton>
                  <MenuList zIndex={20} layerStyle='shadowed' px={0} py={1}>
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
                    <Avatar size={'sm'} src={session.user.image} />
                  </MenuButton>
                  <MenuList layerStyle='shadowed' px={0} py={1} zIndex={20}>
                    <MenuItem bg='inherit' _hover={{ cursor: 'default' }}>
                      <Avatar size={'xs'} mr={2} src={session.user.image} />
                      <Heading as='h4' size='sm' fontFamily='mono'>
                        {session.user.name}
                      </Heading>
                    </MenuItem>
                    <MenuDivider />

                    <MenuItem bg='inherit'>
                      <NavLink href='/dashboard'>
                        <span>My Dashboard</span>
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
            <DrawerContent color='brand.600' bg='white' zIndex='3000'>
              <DrawerCloseButton />
              <DrawerBody py={4}>
                <NavLink href='/' passHref legacyBehavior>
                  <Heading
                    color='brand.600'
                    fontFamily='mono'
                    size='sm'
                    display='flex'
                    alignItems='center'
                    gap={1}
                    as='a'
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Image
                      src='/static/osmteams_logo--pos.svg'
                      alt={'OSM Teams Logo'}
                      width='48'
                      height='48'
                    />
                    osm_teams
                  </Heading>
                </NavLink>
                <List spacing='8' mt={8}>
                  {isAuthenticated && (
                    <ListItem>
                      <NavLink href={'/dashboard'}>
                        <span>My Dashboard</span>
                      </NavLink>
                    </ListItem>
                  )}
                  {Links.map((link) => (
                    <ListItem key={link.url}>
                      <NavLink href={link.url}>
                        <span>{link.name}</span>
                      </NavLink>
                    </ListItem>
                  ))}
                </List>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : null}
      </Container>
    </Box>
  )
}
