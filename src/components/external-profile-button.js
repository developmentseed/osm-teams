import { Button } from '@chakra-ui/react'
import join from 'url-join'
const URL = process.env.APP_URL
const OSM_DOMAIN = process.env.OSM_DOMAIN
const OSMCHA_URL = process.env.OSMCHA_URL
const SCOREBOARD_URL = process.env.SCOREBOARD_URL
const HDYC_URL = process.env.HDYC_URL

const ExternalProfileButton = ({ type, userId }) => {
  let targetLink
  let title
  let label
  let altText
  let logoImg

  switch (type) {
    case 'osm-profile':
      targetLink = join(OSM_DOMAIN, `/user/${userId}`)
      title = 'View profile on OSM'
      label = 'OSM'
      altText = 'OSM Logo'
      logoImg = 'osm_logo.png'
      break
    case 'hdyc':
      targetLink = join(HDYC_URL, `/?${userId}`)
      title = 'View profile on HDYC'
      label = 'HDYC'
      altText = 'How Do You Contribute Logo'
      logoImg = 'neis-one-logo.png'
      break
    case 'scoreboard':
      targetLink = join(SCOREBOARD_URL, `/users/${userId}`)
      title = 'View user profile on Scoreboard'
      label = 'Scoreboard'
      altText = 'Scoreboard Logo'
      logoImg = 'scoreboard-logo.svg'
      break
    case 'osmcha':
      targetLink = join(
        OSMCHA_URL,
        `/?filters={"users":[{"label":"${userId}","value":"${userId}"}]}`
      )
      title = 'View profile on OSMCha'
      label = 'OSMCha'
      altText = 'OSMCha Logo'
      logoImg = 'icon-osmcha-logo.svg'
      break
    default:
      return null
  }

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation()
      }}
      as='a'
      href={targetLink}
      rel='noopener noreferrer'
      target='_blank'
      title={title}
      size='sm'
      bg='white'
      variant='ghost'
    >
      <img
        src={`${join(URL, `/static/${logoImg}`)}`}
        alt={altText}
        width='16'
        height='16'
      />
      {label}
    </Button>
  )
}

export default ExternalProfileButton
