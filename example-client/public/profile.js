const h = React.createElement

const OsmoseFrame = function ({ places }) {
  const firstPlace = JSON.parse(places[0].center)
  const [center, setCenter] = React.useState(firstPlace)

  const placeButtons = places.map(place => {
    let center = JSON.parse(place.center)
    return h('li', { className: "dib mr3" }, h('button',
      {
        className: "yyb ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6",
        onClick: function (e) { 
          e.preventDefault()
          setCenter(center)
        }
      },
      `${center[0].toFixed(2)}, ${center[1].toFixed(2)}`))
  })

  return h('div', {},
    [
      h('ul', { className: 'list pl0' }, placeButtons),
      h('iframe',
        {
          width: "600px",
          height: "400px",
          src: `http://osmose.openstreetmap.fr/en/map/#zoom=15&lat=${center[0]}&lon=${center[1]}`
        }
      )
    ]
  )
}

class Profile extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true
    }
  }

  componentDidMount () {
    fetch('/profile').then(result => {
      if (result.ok) {
        return result.json()
      }
    }).then(data => {
      this.setState(Object.assign({ loading: false }, data))
    })
    .catch(err => {
      console.error(err)
    })
  }

  render () {
    if (this.state.loading) {
      return h('div', {}, 'Loading...')
    }
    const { places, username, picture } = this.state
    console.log(places)

    return h('article',
      {
        className: "mw7 pa4 mt5 center ba b--black-10 bg-white br1"
      },
      [
        h('h2', {
          className: "flex items-center bb b--black-10 pb3"
        },
          [
            h('img', {
              src: picture,
              key: "user-pic",
              className: "br2 h3 w3 dib"
            }),
            h('span', {
              key: "username",
              className: "pl3 flex-auto f2 black-70"
            }, username)
          ]
        ),
        h('p', { className: "measure-copy lh-copy"}, "Fix errors osmose has found in your places!"),
        h(OsmoseFrame, { places })
      ]
    )
  }
}

const domContainer = document.querySelector('#profile')
ReactDOM.render(h(Profile), domContainer)
