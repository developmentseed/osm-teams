import React, { Component } from 'react'

export default class UhOh extends Component {
  render () {
    return (
      <article className='inner page'>
        <h1>Page not found</h1>
        <div>Sorry, the page you are looking for is not available.</div>
        <br />
        <div>Still having problems? Try logging out and back in or contacting a system administrator.</div>
      </article>
    )
  }
}
