import React, { useState, Component, createRef } from 'react'
import { Map, CircleMarker, TileLayer } from 'react-leaflet'
import { reverse } from 'ramda'

export default class FormikMap extends Component {
  constructor (props) {
    super(props)
    this.state = {
      zoom: 15
    }
  }

  setZoom (zoom) {
    this.setState({ zoom })
  }

  render () {
    let centerGeojson = this.props.value || '{ "type": "Point", "coordinates": [-77.03637, 38.89511] }'
    let center = reverse(JSON.parse(centerGeojson).coordinates)

    return (
      <Map center={center} zoom={this.state.zoom} style={this.props.style}
        onViewportChange={({ center, zoom }) => {
          let toGeojson = `{ 
          "type": "Point", 
          "coordinates": [${center[1]},${center[0]}]
        }`
          this.setZoom(zoom)
          this.props.onChange(this.props.name, toGeojson)
        }} >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <CircleMarker center={center} color='blue' radius={20} />
      </Map>
    )
  }
}
