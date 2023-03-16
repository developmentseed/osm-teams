import React, { Component } from 'react'
import { Map, CircleMarker, TileLayer } from 'react-leaflet'
import 'leaflet-gesture-handling'

export default class TeamMap extends Component {
  render() {
    return (
      <Map
        center={this.props.marker.center}
        zoom={10}
        style={this.props.style}
        gestureHandling={true}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <CircleMarker
          center={this.props.marker.center}
          color='blue'
          radius={5}
        />
      </Map>
    )
  }
}
