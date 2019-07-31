import React, { Component } from 'react'
import Map from 'pigeon-maps'
import { reverse } from 'ramda'
import Marker from './marker'

export class FormikMap extends Component {
  render () {
    let centerGeojson = this.props.value || '{ "type": "Point", "coordinates": [-77.03637, 38.89511] }'
    console.log('value', centerGeojson)
    let center = reverse(JSON.parse(centerGeojson).coordinates)

    return (
      <Map center={center} zoom={10} width={300} height={200} onBoundsChanged={({ center }) => {
        let toGeojson = `{ 
          "type": "Point", 
          "coordinates": [${reverse(center)}]
        }`
        this.props.onChange(this.props.name, toGeojson)
      }} >
        <Marker anchor={center} payload={1} />
      </Map>
    )
  }
}
