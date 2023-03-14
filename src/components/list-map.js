import React, { Component, createRef } from 'react'
import { Map, CircleMarker, TileLayer, Tooltip } from 'react-leaflet'
import Router from 'next/router'
import join from 'url-join'

const APP_URL = process.env.APP_URL

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
        color='var(--chakra-colors-brand-500)'
        radius={2}
        onclick={() => {
          Router.push(join(APP_URL, `/teams/${marker.id}`))
        }}
      >
        <Tooltip>{marker.name}</Tooltip>
      </CircleMarker>
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
