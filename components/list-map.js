import React, { Component } from 'react'
import { Map, CircleMarker, TileLayer } from 'react-leaflet'

export default class ListMap extends Component {
  render () {
    const markers = this.props.markers.map(marker => (
      <CircleMarker key={marker.id} center={marker.center} color='blue' radius={2} />
    ))

    return (
      <Map center={[0.1, 0.1]} zoom={1} style={this.props.style}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        { markers }
      </Map>
    )
  }
}
