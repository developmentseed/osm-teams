import React, { Component} from 'react'
import Button from './button';
import Map from 'pigeon-maps'
import Marker from './marker'

class NewPlaceForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      center: [38.89511, -77.03637],
      zoom: 10
    }

    this.onSave = this.onSave.bind(this)
    this.onMove = this.onMove.bind(this)
  }

  onSave () {
    // Do something when you save a location
    this.props.savePlace(this.state.center)
  }

  // Do something when the map moves
  onMove({ center, zoom, bounds }) {
    this.setState({ center, zoom, bounds })
  }

  render () {
    const { center, zoom }  = this.state
    return (
      <div className="flex mt3 mb5">
        <Map center={center} zoom={zoom} width={300} height={200} onBoundsChanged={this.onMove}>
          <Marker anchor={center} payload={1} />
        </Map>
        <div className="ml3 flex-auto">
          <p className="f6 mw4 flex-auto">
            Drag the map to find a location and hit "Save"
        </p>
        <Button onClick={this.onSave}>Save</Button>
        </div>
      </div>
    )
  }
}

export default class Places extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isEditing: false,
      loading: true,
      places: []
    }

    this.addPlace = this.addPlace.bind(this)
    this.savePlace = this.savePlace.bind(this)
    this.getPlaces = this.getPlaces.bind(this)
    this.refreshPlaces = this.refreshPlaces.bind(this)
  }

  addPlace () {
    this.setState({
      isEditing: true
    })
  }

  async savePlace (center) {
    let res = await fetch(`/api/places`, {
      method: 'POST',
      body: JSON.stringify({
        center
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    if (res.status != 200) {
      throw new Error('Could not create place')
    }
    this.setState({ isEditing: false })
    await this.refreshPlaces()
  }

  async getPlaces () {
    let res = await fetch('/api/places')
    if (res.status == 200) {
      return await res.json()
    }
    else {
      throw new Error('Could not retrieve places')
    }
  }

  async deletePlace(id) {
    await fetch(`/api/places/${id}`, { method: 'DELETE' })
    await this.refreshPlaces()
  }

  async refreshPlaces () {
    try {
      let { places } = await this.getPlaces() 
      this.setState({
        places,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        places: [],
        loading: false
      })
    }
  }

  componentDidMount () {
    this.refreshPlaces()
  }

  render() {
    let { places } = this.state

    return (
      <section>
        <h2 className="mt4">🌎 Your places</h2>
        <p>Add places that you want to keep track of or would like to map!</p>
        <br />
        {
          places.map(place => {
            let center = JSON.parse(place.center)
            return (
              <div className="mt3 mb3">
                <Map center={center} zoom={10} width={300} height={200} key={place.id} mouseEvents={false} touchEvents={false} >
                  <Marker anchor={center} payload={1} />
                </Map>
                <div className="mt2">
                  <Button small danger onClick={() => this.deletePlace(place.id)}>Delete</Button>
                </div>
              </div>
            )
          })
        }
        <br />
        {
          this.state.isEditing 
          ? <NewPlaceForm savePlace={this.savePlace} /> 
          : <Button onClick={this.addPlace}>Add a new place</Button>
        }
      </section>
    )
  }
}