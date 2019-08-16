import React, { Component } from 'react'
import { Map, CircleMarker, TileLayer } from 'react-leaflet'
import { reverse } from 'ramda'
import Geocoder from 'leaflet-control-geocoder'

export default class FormMap extends Component {
  constructor (props) {
    super(props)
    this.map = React.createRef()
    this.state = {
      zoom: 15
    }
  }

  setZoom (zoom) {
    this.setState({ zoom })
  }

  componentDidMount () {
    if (this.map && !this.geocoder) {
      this.geocoder = new Geocoder({
        defaultMarkGeocode: false
      })

      this.geocoder.on('markgeocode', (e) => {
        const bbox = e.geocode.bbox
        this.map.current.leafletElement.fitBounds(bbox)
      })

      this.map.current.leafletElement.addControl(this.geocoder)
    }
  }

  render () {
    let centerGeojson = this.props.value || '{ "type": "Point", "coordinates": [-77.03637, 38.89511] }'
    let center = reverse(JSON.parse(centerGeojson).coordinates)

    return (
      <Map
        center={center}
        zoom={this.state.zoom}
        style={this.props.style}
        ref={this.map}
        onViewportChange={({ center, zoom }) => {
          let toGeojson = `{
          "type": "Point",
          "coordinates": [${center[1]},${center[0]}]
        }`
          this.setZoom(zoom)
          this.props.onChange(this.props.name, toGeojson)
        }}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <CircleMarker center={center} color='blue' radius={20} />
      </Map>
    )
  }
}
