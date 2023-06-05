import React from 'react'
import {
  Box,
  Container,
  Heading,
  List,
  ListItem,
  Text,
  Flex,
} from '@chakra-ui/react'
import InpageHeader from '../components/inpage-header'
import Image from 'next/image'

export default function About() {
  return (
    <Box as='main' mb={8}>
      <InpageHeader>
        <Heading color='white' mb={2}>
          User Guide
        </Heading>
      </InpageHeader>
      <Container maxW='container.xl' as='section'>
        <Box layerStyle={'shadowed'} overflow='visible'>
          <Container
            mx={0}
            p={0}
            display='flex'
            flexDirection={['column', null, 'row']}
            gap={8}
            as='article'
            maxW='none'
            overflow='visible'
            position='relative'
          >
            <List
              flex={1}
              as='nav'
              display='flex'
              flexDirection='column'
              position='sticky'
              maxH='100vh'
              alignSelf='flex-start'
              top={2}
              overscrollBehavior='contain'
              fontSize='sm'
            >
              <ListItem
                textTransform={'uppercase'}
                fontWeight={'bold'}
                color='blackAlpha.600'
              >
                User Guide
              </ListItem>
              <ListItem
                as='a'
                textTransform={'uppercase'}
                fontWeight={'bold'}
                href='#dashboard'
              >
                Dashboard
              </ListItem>
              <br />
              <ListItem
                as='a'
                textTransform={'uppercase'}
                fontWeight={'bold'}
                href='#teams'
              >
                Teams
              </ListItem>
              <ListItem as='a' href='#explore'>
                Explore all teams
              </ListItem>
              <ListItem as='a' href='#new-team'>
                Create Team
              </ListItem>
              <ListItem as='a' href='#add-members'>
                Add team members
              </ListItem>
              <ListItem as='a' href='#edit-team'>
                Edit Team
              </ListItem>
              <ListItem as='a' href='#edit-access'>
                Edit Team Member Access
              </ListItem>
              <ListItem as='a' href='#edit-team-members'>
                Team Member Attributes
              </ListItem>
              <ListItem as='a' href='#add-profile'>
                Update Team Profile
              </ListItem>
              <ListItem as='a' href='#view-profiles'>
                View Team Profiles
              </ListItem>
              <ListItem as='a' href='#join-link'>
                Create Join Link
              </ListItem>
              <ListItem as='a' href='#delete-team'>
                Delete Team
              </ListItem>
              <br />
              <ListItem
                as='a'
                textTransform={'uppercase'}
                fontWeight={'bold'}
                href='#organizations'
              >
                Organizations
              </ListItem>
              <ListItem as='a' href='#new-org'>
                Create Organization
              </ListItem>
              <ListItem as='a' href='#add-org-team'>
                Add Organization Team
              </ListItem>
              <ListItem as='a' href='#add-org-staff'>
                Add Organization Staff
              </ListItem>
              <ListItem as='a' href='#edit-org'>
                Edit Organization
              </ListItem>
              <ListItem as='a' href='#edit-org-members'>
                Organization Member Attributes
              </ListItem>
              <ListItem as='a' href='#edit-org-teams'>
                Organization Team Attributes
              </ListItem>
              <ListItem as='a' href='#edit-org-privacy'>
                Organization Privacy Policy
              </ListItem>
              <br />
              <ListItem
                as='a'
                textTransform={'uppercase'}
                fontWeight={'bold'}
                href='#badges'
              >
                Badges
              </ListItem>
              <ListItem as='a' href='#new-badge'>
                Create New Badge
              </ListItem>
              <ListItem as='a' href='#assign-badge'>
                Assign Badge
              </ListItem>
              <ListItem as='a' href='#edit-badge'>
                Edit Badge
              </ListItem>
              <ListItem as='a' href='#badge-assignment'>
                Badge Assignment
              </ListItem>
            </List>
            <Flex direction='column' gap={4} flex={3}>
              <Heading size='lg' as='h1'>
                OSM Teams V2.2.1
              </Heading>

              <Text>OSM Teams v2.2.1 was released 5/26/23.</Text>
              <Text>
                API documentation for OSM Teams can be found at{' '}
                <a href='https://mapping.team/docs/api'>
                  https://mapping.team/docs/api
                </a>
              </Text>
              <Heading size='md' as='h3' id='dashboard'>
                Dashboard
              </Heading>

              <Text>
                The “dashboard” page provides users with a view of the
                organizations and teams which they are members of. From the
                dashboard page users can see the number of members in each team,
                see their roles within an organization and visit the listed
                teams and organizations.
              </Text>

              <Image
                src='/static/guide/dashboard.png'
                width='650'
                height='400'
                alt='OSM Teams dashboard'
                title='OSM Teams dashboard'
              />
              <Heading size='md' as='h3' id='teams'>
                Teams
              </Heading>

              <Text>
                Each OSM Teams team is a collection of OSM user ID’s. Teams are
                created with a name, hashtag, description and location. Teams
                may include a link to an Organized Editing Policy, and teams may
                be public or private.
              </Text>
              <Heading size='sm' as='h4' id='explore'>
                Explore All Teams
              </Heading>

              <Image
                src='/static/guide/explore.png'
                width='650'
                height='400'
                alt='OSM Teams explore all teams page'
                title='OSM Teams explore all teams page'
              />
              <Text>
                All public teams are visible at the /teams URL, accessible by
                visiting the link “Explore Teams”.
              </Text>
              <Text>
                Teams can be filtered by your current map viewport by clicking
                the checkbox “Filter teams by map.”
              </Text>
              <Heading size='sm' as='h4' id='new-team'>
                Create New Team
              </Heading>

              <Image
                src='/static/guide/new_team.png'
                width='650'
                height='400'
                alt='Create new team'
                title='Create new team'
              />
              <Text>
                To create a new team, first click <strong>Make New Team</strong>{' '}
                from the sidebar. The Team Creation page provides form fields
                for the team name, hashtag, description, organized editing
                policy, visibility and location.
              </Text>
              <Text>
                Teams may optionally also be indicated as belonging to an
                organization.
              </Text>
              <Text>
                Team location is optional. Select the team location from the map
                by zooming and panning to the correct point.
              </Text>
              <Heading size='sm' as='h4' id='add-members'>
                Add members to a team
              </Heading>

              <Image
                src='/static/guide/team-page.png'
                width='650'
                height='400'
                alt='OSM Teams Page'
                title='OSM Teams Page'
              />
              <Text>
                To add a member to a team, navigate to the “TEAM MEMBERS”
                section of the team page, and click “+ Add members.”
              </Text>
              <Image
                src='/static/guide/team_add-member.png'
                width='650'
                height='400'
                alt='Adding members to a team on OSM Teams'
                title='Adding members to a team on OSM Teams'
              />

              <Text>
                A user can be added to a team either viaOSM ID, or by username.
                To find an OSM User&apos;s ID, search the OSM User Names
                Database at{' '}
                <a href='http://whosthat.osmz.ru/'>http://whosthat.osmz.ru</a>.
                Search directly for OSM Username from within OSM Teams
              </Text>
              <Text>
                Once added to your team, the team member&apos;s username will be
                displayed in the table along with their OSM ID and links to
                additional OSM Profiles.
              </Text>
              <Heading size='sm' as='h4' id='edit-team'>
                Edit Team
              </Heading>

              <Image
                src='/static/guide/team-edit.png'
                width='650'
                height='400'
                alt='Edit team'
                title='Edit team'
              />
              <Text>
                Click “Edit” in the main Team Details section of a team page to
                update a team&apos;s details, location, and visibility
              </Text>
              <Heading size='sm' as='h4' id='edit-access'>
                Team member actions: Edit Access & Assign A Badge
              </Heading>

              <Image
                src='/static/guide/team-member-actions.png'
                width='650'
                height='400'
                alt='Team Member Actions'
                title='Team Member Actions'
              />
              <Text>
                To update team member access, click on the ellipsis icon in the
                “ACTIONS” column of the team members table. The actions drop
                down displays the following available options:
              </Text>
              <List>
                <ListItem>Remove team member</ListItem>

                <ListItem>Promote team member to team moderator</ListItem>

                <ListItem>Demote team moderator to team member</ListItem>

                <ListItem>
                  Assign a badge (available for teams which are part of an
                  organization)
                </ListItem>
              </List>
              <Heading size='sm' as='h4' id='edit-team-members'>
                Add/Edit Team Member Attributes
              </Heading>

              <Text>
                Team moderators may request additional details for team member
                profiles, which members can then update on their team-specific
                profile. These attributes provide more information for the team
                on the members, and allow team moderators to ask questions or
                seek supplementary profile information from team members outside
                of the OSM standard profile information.
              </Text>

              <Image
                src='/static/guide/team-member-attributes.png'
                width='650'
                height='400'
                alt='Add and edit team member attributes'
                title='Add and edit team member attributes'
              />
              <Text>
                To add attributes, click “EDIT” on the team page, and then click
                “EDIT TEAM PROFILES.” If no attributes have been created yet,
                click “ADD ATTRIBUTE” and provide the requested information.
                Each attribute can have a name, description, visibility
                settings, type, and be required or optional. Attribute types can
                include text, number, email, URL, date, telephone, color, and
                gender. When filling in their individual team profiles, team
                members will be presented with the appropriate html input
                corresponding to each attribute type. Attributes may be visible
                only to other team members, or may be public.
              </Text>
              <Heading size='sm' as='h4' id='add-profile'>
                Update Own Team Profile
              </Heading>

              <Text>
                Team members can answer questions or fill additional requested
                information on their profile on each individual team page. Click
                “EDIT YOUR PROFILE” from the team page to fill in the attributes
                that have been requested by the team.
              </Text>

              <Image
                src='/static/guide/team-own-profile.png'
                width='650'
                height='400'
                alt='Edit own team profile'
                title='Edit own team profile'
              />
              <Heading size='sm' as='h4' id='view-profiles'>
                View Team Member Profiles
              </Heading>

              <Image
                src='/static/guide/team-member-profile.png'
                width='650'
                height='400'
                alt='View team member profile'
                title='View team member profile'
              />
              <Text>
                To view the information submitted by team members on the
                individual team profile, click the user name in the Team Members
                table on the team page to see the User Profile modal.
              </Text>
              <Heading size='sm' as='h4' id='join-link'>
                Create Join Link
              </Heading>

              <Image
                src='/static/guide/team-join-link.png'
                width='650'
                height='400'
                alt='Team join link'
                title='Team join link'
              />
              <Text>
                Team moderators may provide a Join Link rather than manually
                inviting all team members by OSM User ID. To create a join link
                as a moderator, visit the team page and click “Create Join
                Link.” The link generated can be shared with any member via
                email, message, etc. Recipients will be able to paste the link
                into their browser. If they are not already registered on OSM,
                they will first need to create an OSM user account. Following
                the creation of an OSM user account, they may re-visit the
                invite link and authenticate the OSM Teams application via the
                OSM auth login. Once they have successfully logged into OSM
                Teams, the invitation to the team will be automatically
                accepted.
              </Text>
              <Heading size='sm' as='h4' id='delete-team'>
                Delete Team
              </Heading>

              <Image
                src='/static/guide/team-delete.png'
                width='650'
                height='400'
                alt='Delete team'
                title='Delete team'
              />
              <Text>
                On the “Edit Team” page, click “DELETE THIS TEAM” in the “Danger
                Zone” section at the bottom of the page.
              </Text>
              <Heading size='md' as='h3' id='organizations'>
                Organizations{' '}
              </Heading>

              <Text>
                Organizations are “Teams of teams.” They allow a parent level
                grouping of teams. Within an organization, users may have an
                organization owner or organization manager role. Teams may
                optionally belong to an organization.
              </Text>
              <List>
                <ListItem>
                  <strong>Organization Teams</strong> - all organizations
                  associated with an organization
                </ListItem>

                <ListItem>
                  <strong>Organization Members - </strong> all members of the
                  teams associated with the organization.
                </ListItem>

                <ListItem>
                  <strong>Organization Staff - </strong>the users with the
                  designated “owner” or “manager” role for that organization.
                  Only organization staff can add new teams to an organization.
                </ListItem>

                <ListItem>
                  <strong>Organization Details - </strong>the name, description
                  for an organization
                </ListItem>

                <ListItem>
                  <strong>Organization Badges - </strong>manually created and
                  assigned badges for organization members
                </ListItem>
              </List>

              <Image
                src='/static/guide/org-page.png'
                width='650'
                height='400'
                alt='Organization page'
                title='Organization page'
              />
              <Heading size='sm' as='h4' id='new-org'>
                Create an Organization
              </Heading>

              <Image
                src='/static/guide/new_org.png'
                width='650'
                height='400'
                alt='Create new organization'
                title='Create new organization'
              />
              <Text>
                Click “New Organization” from the “+ add new” button in the top
                navigation bar of the application to create a new organization.
                Organizations may be private or public. Organizations can also
                set a privacy setting for teams that overrides the privacy
                setting of all teams within the organization. Creators of
                organization are automatically the owner of that organization.
              </Text>
              <Heading size='sm' as='h4' id='add-org-team'>
                Add a Team to an Organization
              </Heading>

              <Image
                src='/static/guide/new_org-team.png'
                width='650'
                height='400'
                alt='New organization team'
                title='New organization team'
              />
              <Text>
                To add a team to an organization, check the box “This team
                belongs to an organization” when creating a new team. The list
                of organizations you <strong>own </strong>or{' '}
                <strong>manage</strong> are then displayed, allowing you to
                select the applicable organization.
              </Text>
              <Heading size='sm' as='h4' id='add-org-staff'>
                Add Staff to Organization
              </Heading>

              <Image
                src='/static/guide/org-staff.png'
                width='650'
                height='400'
                alt='Add organization staff'
                title='Add organization staff'
              />
              <Text>
                To add a staff member to an organization, navigate to the “
                <strong>STAFF MEMBERS</strong>” section of the team page, and
                enter a user&apos;s OSM ID into the “Add member” input field.
                Once added to your team, the staff member&apos;s username will
                be displayed in the table along with their OSM ID, role and
                links to additional OSM Profiles. <strong>Owners </strong>may
                create teams for an organization, update other staff
                members&apos; roles, and update organizational information.{' '}
                <strong>Managers</strong> may create teams for an organization,
                but may not update other staff roles or organizational
                information.
              </Text>
              <Text>
                To find an OSM User&apos;s ID, search the OSM User Names
                Database at{' '}
                <a href='http://whosthat.osmz.ru/'>http://whosthat.osmz.ru</a>.
              </Text>
              <Heading size='sm' as='h4' id='edit-org'>
                Edit Organization
              </Heading>

              <Image
                src='/static/guide/org-edit.png'
                width='650'
                height='400'
                alt='Edit organization'
                title='Edit organization'
              />
              <Text>
                Click “<strong>EDIT</strong>” in the main Organization Details
                section of an organization page to update an organization&apos;s
                details, policies, attributes and visibility.
              </Text>
              <Heading size='sm' as='h4' id='edit-org-members'>
                Add/Edit Member Attributes
              </Heading>

              <Image
                src='/static/guide/org-edit-members.png'
                width='650'
                height='400'
                alt='Edit organization member attributes'
                title='Edit organization member attributes'
              />
              <Text>
                From the “<strong>EDIT</strong>” organization page, click “EDIT
                MEMBER ATTRIBUTES.” Member attributes set at the organization
                level are available for members in any team within the
                organization. In addition to the settings available for
                team-level member attributes, organization-level attributes can
                also be set to be visible to the public, only to organization
                members and staff, or only to organization staff.
              </Text>
              <Heading size='sm' as='h4' id='edit-org-teams'>
                Add/Edit Team Attributes
              </Heading>

              <Image
                src='/static/guide/org-edit-teams.png'
                width='650'
                height='400'
                alt='Edit organization team attributes'
                title='Edit organization team attributes'
              />
              <Text>
                From the “<strong>EDIT</strong>” organization page, click “EDIT
                TEAM ATTRIBUTES.” Team attributes set at the organization level
                are available for any team within the organization. When a new
                team is created within an organization, team managers can fill
                in the additional requested details for the team. Similarly to
                team-level member attributes, organization team attributes can
                also be set to be visible to the public, only to organization
                members and staff, or only to organization staff.
              </Text>
              <Heading size='sm' as='h4' id='edit-org-privacy'>
                Add/Edit Privacy Policy
              </Heading>

              <Image
                src='/static/guide/org-edit-privacy.png'
                width='650'
                height='400'
                alt='Edit organization privacy policy'
                title='Edit organization privacy policy'
              />
              <Text>
                From the organization “<strong>EDIT” </strong>page, click “
                <strong>EDIT PRIVACY POLICY”</strong> to create a custom privacy
                policy for the teams within the organization.
              </Text>
              <Heading size='md' as='h3' id='badges'>
                Organization Badges
              </Heading>

              <Heading size='sm' as='h4' id='new-badge'>
                Create New Badge
              </Heading>

              <Text>
                Badges can be created to signify significant user roles or
                achievements. Badges are created via the{' '}
                <strong>BADGES </strong>section on the organization page. Click
                the “ADD” button above the badges table, and then add a name and
                color for the badge in the badge creation screen
              </Text>

              <Image
                src='/static/guide/new_badge.png'
                width='650'
                height='400'
                alt='Create new badge'
                title='Create new badge'
              />
              <Heading size='sm' as='h4' id='assign-badge'>
                Assign A Badge
              </Heading>

              <Text>
                To grant or assign a team member a badge, click on the ellipsis
                icon in the “ACTIONS” column of the organization members table
                and click “Assign a badge.” The badge assignment page displays
                the selected user&apos;s OSM ID, and permits selection of any
                badge created on the organization level. The assigned date may
                be changed to an earlier or later date if desired; it is set
                automatically to the current day&apos;s date. If desired, a
                badge expiration date may also be added for time-limited badges.
                The badge will now appear in the “Badges” column for the
                selected user within the organization members table. Badges may
                also be assigned from the team members table of a team page,
                when the team is a part of an organization.
              </Text>

              <Image
                src='/static/guide/badge-assign.png'
                width='650'
                height='400'
                alt='Assign a badge to a member'
                title='Assign a badge to a member'
              />
              <Heading size='sm' as='h4' id='edit-badge'>
                Edit a Badge
              </Heading>

              <Image
                src='/static/guide/badge-edit.png'
                width='650'
                height='400'
                alt='Edit badge'
                title='Edit badge'
              />
              <Text>
                From the BADGES table on the organization page, click a badge to
                edit the badge settings and view the list of assigned users.
                From the <strong>Edit Badge</strong> page you may update a badge
                name and color, and delete a badge.
              </Text>
              <Heading size='sm' as='h4' id='badge-assignment'>
                Edit a Badge Assignment
              </Heading>

              <Image
                src='/static/guide/badge-assignment.png'
                width='650'
                height='400'
                alt='Edit badge assignment'
                title='Edit badge assignment'
              />
              <Text>
                To edit the badge assignment for an individual user on a badge,
                visit the <strong>Edit Badge </strong>page and then click on a
                user within the Assigned Members page. From the{' '}
                <strong>Badge Assignment </strong>page you may change the badge
                assignment and expiration date, or unassign a badge from the
                selected user.
              </Text>
            </Flex>
          </Container>
        </Box>
      </Container>
    </Box>
  )
}
