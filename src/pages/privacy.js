import React from 'react'
import { Box, Container, Heading, List, ListItem, Text } from '@chakra-ui/react'
import InpageHeader from '../components/inpage-header'

export default function About() {
  return (
    <Box as='main' mb={8}>
      <InpageHeader>
        <Heading color='white' mb={2}>
          Privacy Policy
        </Heading>
      </InpageHeader>
      <Container maxW='container.xl' as='section'>
        <Box layerStyle={'shadowed'} overflow='visible'>
          <Heading as='h1'>OSM Teams Privacy Policy</Heading>

          <Text>
            OSM Teams is an open source tool of Development Seed (“Development
            Seed,” “we,” “us,” or “our”). Development Seed is committed to
            protecting the privacy of those who visit our websites and use our
            services. This Privacy Policy describes (1) the types of information
            we collect about you (sometimes called “personal information”) when
            you access or use OSM Teams, related websites, applications,
            products, services, and tools (collectively, the “Services”); (2)
            how we use the information we collect from you; and (3) your choices
            regarding how we use or share that information.
          </Text>
          <Text>
            We want to try to make this Privacy Policy as accessible and useful
            to our visitors as possible. With that in mind, we&apos;ve provided
            a high-level overview below to give you a general sense of what data
            we collect and how we use it. If you would like more details,
            however, we encourage you to keep reading past the overview. And if
            you have questions about our policies, you can contact us at
            info@developmentseed.org
          </Text>
          <Heading as='h2' size='md'>
            Overview
          </Heading>

          <Text>
            In general, we collect information about the actions that you take
            on the Services, and we use this information to provide the Services
            to you. We may use analytics to help us analyze data on website
            traffic and page views. We take steps to protect the personal
            information you provide us, such as by limiting access to the
            information to trained staff and designated volunteers, and only
            sharing your information as needed to provide the Services to you.
            We also provide you with certain choices regarding your personal
            information, and we aim to honor your preferences.
          </Text>
          <Heading as='h2' size='md'>
            Information We Collect From You and How We Collect It
          </Heading>

          <Text>
            Depending on how you use the Services and its features, we or third
            parties working on our behalf may collect information about you
            (sometimes referred to as “personal information”). The type of
            personal information we collect from or about you may include: name,
            address, country, email address, gender, social media account
            information, OpenStreetMap (“OSM”) account information, and any
            other information you choose to provide to us. We may also collect
            information about the device you are using, such as the device’s IP
            address.
          </Text>
          <List>
            <ListItem>We may collect this information when you:</ListItem>
            <ListItem>* Use the OSM Teams application;</ListItem>
            <ListItem>* Register an account with us;</ListItem>
            <ListItem>* Use various functions of the Services.</ListItem>
          </List>
          <Heading as='h3' size='sm'>
            Information Collected from Third Parties
          </Heading>

          <Text>
            We may also collect information about you from third parties. In
            particular, if you have an OSM account, we may receive your user ID,
            display name, profile picture for that account and information
            regarding your actions on OSM. Please see [OpenStreetMap privacy
            policy](https://wiki.osmfoundation.org/wiki/Terms_of_Use) for more
            information about the data it shares when you initiate these
            connections. We treat any personal information we receive from these
            third parties consistent with this Privacy Policy.
          </Text>
          <Heading as='h3' size='sm'>
            Cookies and Similar Technologies
          </Heading>

          <Text>
            When you use the Services, we, or third parties operating on our
            behalf, use cookies and similar technologies to collect information
            about the features that you access and use, and about the browser
            and computer or device you use to access the Services. A cookie is a
            tiny file that a website stores on a visitor&apos;s computer or
            device, and that the visitor&apos;s browser provides to the website
            each time the visitor returns. Development Seed uses cookies to help
            us understand and remember your preferences based on your previous
            or current site activity and make the Services more easily navigable
            and useful for you. We may use website analytics tools across the
            Services to help us collect the following information:
          </Text>
          <List>
            <ListItem>
              <strong>Log Information: </strong>information about visitors to
              the Services, including IP address, operating system, and browser
              ID.
            </ListItem>

            <ListItem>
              <strong>Usage Information:</strong> information about how visitors
              interact with the Services, including information about what
              webpages on the Services were visited and for how long, the
              website the visitor navigated to the Services from, and the
              actions taken while using the Services.
            </ListItem>
          </List>
          <Heading as='h3' size='sm'>
            How to Refuse the Use of Cookies
          </Heading>

          <Text>
            Most browsers include tools to help you manage cookies. For example,
            you should be able to choose to have your browser warn you each time
            a cookie is being sent, or you can choose to turn off (i.e., refuse
            to accept) all cookies. Each browser is different, however, so
            please consult your browser&apos;s “Help” menu to learn the correct
            way to modify how your browser handles cookies. You can find more
            information about cookies and how to disable cookies at
            <a href='http://www.allaboutcookies.org'>www.allaboutcookies.org</a>
            .
          </Text>
          <Text>
            Keep in mind that we need certain information in order for the
            Services to function properly. If you disable cookies, you may no
            longer be able to use or access some features of the Services.
          </Text>
          <Heading as='h2' size='md'>
            How And Why We Use the Information We Collect
          </Heading>

          <Heading as='h3' size='sm'>
            Purposes for Using Information
          </Heading>

          <Text>
            Development Seed may use your information in the following ways:
          </Text>
          <List>
            <ListItem>
              To provide the Services to you (for example, when you register an
              account with the OSM Teams, Development Seed uses your information
              to provide you the changeset data and the possibility to review
              changesets and post comments);
            </ListItem>

            <ListItem>
              To improve the Services in order to better serve you (for example,
              Development Seed may collect and analyze information on how
              visitors use various features of the Services, and use that data
              to make improvements to the Services);{' '}
            </ListItem>

            <ListItem>
              To communicate with you, respond to your communications with us,
              or to provide you with technical support;
            </ListItem>

            <ListItem>
              To enable to you to access certain features that require account
              authentication;{' '}
            </ListItem>

            <ListItem>
              To monitor and prevent any problems with the Services;{' '}
            </ListItem>

            <ListItem>
              To detect, investigate, and prevent activities that may violate
              our policies or be illegal;{' '}
            </ListItem>

            <ListItem>To serve our legitimate business purposes</ListItem>

            <ListItem>To comply with our legal obligations.</ListItem>
          </List>
          <Text>
            We may also maintain and use information in de-identified or
            aggregated forms that do not identify you. We will retain your
            information for no longer than is necessary for the purposes for
            which it is processed.
          </Text>
          <Heading as='h3' size='sm'>
            Legal Bases for Collecting and Using Information
          </Heading>

          <Text>
            For those visitors whose personal information is subject to EU data
            protection laws, the legal bases for processing your information as
            set out in this Privacy Policy are as follows: (1) The processing is
            necessary in order to fulfill our contractual commitments to you;
            (2) The processing is necessary for us to comply with a legal
            obligation; (3) We have a legitimate interest in processing your
            information &mdash; for example, to provide and update our Services,
            to improve our Services so that we can offer you an even better user
            experience, to safeguard our Services, to communicate with you, to
            measure, gauge, and improve the effectiveness of our services, and
            better understand user retention and attrition, to monitor and
            prevent any problems with our Services, and to personalize your
            experience; or (4) You have given us your consent &mdash; for
            example before we place certain cookies on your device and access
            and analyze them later on.
          </Text>
          <Heading as='h2' size='md'>
            How and When We Share Information
          </Heading>

          <Text>
            We may share information about you in limited circumstances for the
            purposes described in this Privacy Policy and with appropriate
            safeguards on your privacy and the security of your personal
            information. In particular:
          </Text>
          <List>
            <ListItem>
              <strong>Service admins or team managers:</strong> Depending on the
              Services used, administrators, project managers, or other
              authorized users, which may include Development Seed employees or
              designated volunteers working on Development Seed behalf, may have
              access to your username, or other personal information.
            </ListItem>

            <ListItem>
              <strong>Independent contractors or vendors:</strong> We may
              disclose information about you to independent contractors,
              vendors, and/or other third parties working on our behalf in
              connection with providing you the Services. We require all third
              parties that have access to your personal information to handle it
              consistent with this Privacy Policy.
            </ListItem>
            <ListItem>
              <strong>
                Partners, affiliates, or other third parties in connection with
                a merger, acquisition, or change in leadership:
              </strong>{' '}
              In the event Development Seed merges with or is acquired by
              another organization, or undergoes a restructuring, change in
              leadership or other similar significant organizational change, we
              may disclose and transfer your personal information to authorized
              third parties in connection with that event.
            </ListItem>
          </List>
          <Heading as='h2' size='md'>
            ## How We Protect Your Information
          </Heading>
          <Text>
            We use appropriate administrative, technical, and physical measures
            designed to prevent unauthorized access, improper use or disclosure,
            unauthorized modification or unlawful destruction or accidental loss
            of personal information.
          </Text>
          <Text>
            Although we exercise reasonable care in providing secure
            transmission of information and storage of the information provided
            through the Services, no method of transmission over the Internet,
            and no means of electronic or physical storage, is absolutely
            secure. Accordingly, we cannot ensure or warrant the security of any
            information you transmit to us.
          </Text>
          <Heading as='h2' size='md'>
            Your Choices Regarding Your Personal Information
          </Heading>
          <Text>
            Certain local laws establish rights for consumers who are subject to
            their protections. For example, the European Union&apos;s General
            Data Protection Regulation provides for the following rights for
            individuals whose data is collected in the EU:
          </Text>
          <List>
            <ListItem>Right to request access to your personal data;</ListItem>
            <ListItem>
              Right to request correction or deletion of your personal data;
            </ListItem>
            <ListItem>
              Right to object to our use and processing of your personal data;
            </ListItem>
            <ListItem>
              Right to request that we limit our use and processing of your
              personal data; and
            </ListItem>
            <ListItem>
              Right to request portability of your personal data.
            </ListItem>
          </List>
          <Text>
            While these rights are not absolute &mdash; _e.g._, we do not have
            to delete your data if we need the data for compliance with a legal
            obligation &mdash; and they are not legally required in every
            jurisdiction in which we collect data, Development Seed wants to
            make it easy and straightforward for _all_ our users to enjoy these
            rights, we provide you the ability to exercise certain controls
            regarding our collection, use, and sharing of your information.
          </Text>
          <Text>
            If you have any questions or otherwise would like to contact us
            about one of these rights, you can email
            <a href='mailto:info@developmentseed.org'>
              info@developmentseed.org
            </a>{' '}
            to ask a question or request to exercise one of your rights. We will
            consider all requests and provide our response within the time
            period stated by applicable law. We may request you provide us with
            information necessary to confirm your identity before responding to
            your request &mdash; this is solely to protect you, and we will not
            use any of the information you provide us to confirm your identity
            for anything other than confirming your identity. In some functions
            of the Services you may exercise these controls via your account
            settings in addition to contacting us at the email address above.
            However, not all of our Services allow you to access, correct, or
            delete your personal data within your account settings. If
            applicable, you can make a complaint to the government supervisory
            authority of your jurisdiction.
          </Text>
          <Heading as='h2' size='md'>
            Third-Party Websites and Services
          </Heading>

          <Text>
            The Services may include links to third-party websites and services
            that are not owned or controlled by us, such as Slack, YouTube,
            OpenStreetMap or social media platforms like Twitter, Facebook, and
            LinkedIn. We have no control over, and assume no responsibility for,
            the content, privacy policies, or practices of any third-party
            websites or services. If you choose to use any third-party websites
            or services, the collection, use, and disclosure of your information
            on those websites will be subject to the privacy policies of these
            websites and services.
          </Text>
          <Heading as='h3' size='sm'>
            Source code
          </Heading>

          <Text>
            If you choose to interact with the OSM Teams GitHub page (located at
            <a href='https://github.com/developmentseed/osm-teams'>
              https://github.com/developmentseed/osm-teams
            </a>
            ) or a related website hosted by GitHub, you do so in accordance
            <a href='https://help.github.com/en/articles/github-privacy-statement'>
              GitHub&apos;s Privacy Policy
            </a>
            . If you choose any other communications medium to contact the
            maintainers of the Services, that use is governed by the policies of
            those respective mediums. Development Seed may use any feedback you
            provide.
          </Text>
          <Heading as='h2' size='md'>
            Children&apos;s Privacy{' '}
          </Heading>

          <Text>
            We encourage youth to use the Services under the supervision of
            their parent or guardian, and are committed to protecting the
            privacy of children who use our Services. We do not knowingly
            collect personal information from children under 16. However,
            depending on how you use the Services, we may collect and use
            information about your child that you provide to us. Before we
            collect any such information, we will seek your permission. If we
            become aware we are processing the data of a child under the age of
            16 without parental consent, we will take reasonable steps to delete
            such information as required under applicable laws. If you believe
            we might have personal information from or about a child under 16,
            please contact us at
            <a href='mailto:info@developmentseed.org'>
              info@developmentseed.org
            </a>
          </Text>
          <Heading as='h2' size='md'>
            How to Contact Us
          </Heading>

          <Text>
            If you have a question about this Privacy Policy, please contact us
            at{' '}
            <a href='mailto:info@developmentseed.org'>
              info@developmentseed.org
            </a>
            .
          </Text>
          <Text>Modifications to This Privacy Policy</Text>
          <Text>
            We may modify this Privacy Policy from time to time. All such
            changes will be reflected on this page and the date of revision will
            be noted at the bottom of the Privacy Policy. Please check the
            Policy periodically for updates.
          </Text>
          <Heading as='h2' size='md'>
            Changelog{' '}
          </Heading>

          <Heading size='xs' as='h4'>
            May 3, 2023 &mdash; Initial version
          </Heading>
        </Box>
      </Container>
    </Box>
  )
}
