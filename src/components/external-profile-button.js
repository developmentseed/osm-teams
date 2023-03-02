import join from 'url-join'
const URL = process.env.APP_URL
const BASE_PATH = process.env.BASE_PATH
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
      targetLink =
        BASE_PATH !== ''
          ? join(BASE_PATH, `/user/${userId}`)
          : `https://www.openstreetmap.org/user/${userId}`
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
    <a
      onClick={(e) => {
        e.stopPropagation()
      }}
      href={targetLink}
      rel='noopener noreferrer'
      target='_blank'
      flat
      className='button unstyled small'
      title={title}
    >
      <img
        src={`${join(URL, `/static/${logoImg}`)}`}
        alt={altText}
        width='16'
        height='16'
      />
      {label}
    </a>
  )
}

export default ExternalProfileButton
