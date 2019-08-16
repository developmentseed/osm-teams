import React, { Component } from 'react'
import { map, objOf, prop } from 'ramda'
import ReactTags from 'react-tag-autocomplete'

const toFormat = map(objOf('name')) // [ x, ] => [{'name': x},]
const fromFormat = map(prop('name')) // [{'name': x},] => [ x, ]

export default class TagForm extends Component {
  handleDelete (i) {
    const tags = this.props.tags.slice(0)
    tags.splice(i, 1)
    this.props.updateTags(fromFormat(tags))
  }

  handleAddition (tag) {
    const tags = [].concat(this.props.tags, tag)
    this.props.updateTags(fromFormat(tags))
  }

  render () {
    const { tags, suggestions } = this.props

    return <ReactTags
      placeholder='Add tags to categorize your team...'
      allowNew
      tags={toFormat(tags)}
      suggestions={toFormat(suggestions)}
      handleDelete={this.handleDelete.bind(this)}
      handleAddition={this.handleAddition.bind(this)}
    />
  }
}
