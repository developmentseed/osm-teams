import React, { Component, createRef } from 'react'
import { Map, CircleMarker, TileLayer } from 'react-leaflet'

export default class ListMap extends Component {
  constructor(props) {
    super(props)

    this.map = createRef()
  }
  render() {
    const markers = this.props.markers.map((marker) => (
      <CircleMarker
        key={marker.id}
        center={marker.center}
        color='blue'
        radius={2}
      />
    ))

    return (
      <Map
        ref={this.map}
        center={[0.1, 0.1]}
        zoom={1}
        style={this.props.style}
        onViewportChange={() => {
          const bounds = this.map.current.leafletElement.getBounds()
          const { _southWest: sw, _northEast: ne } = bounds
          this.props.onBoundsChange([sw.lng, sw.lat, ne.lng, ne.lat]) // xmin, ymin, xmax, ymax
        }}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {markers}
      </Map>
    )
  }
}
