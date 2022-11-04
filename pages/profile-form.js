import React, { Component } from 'react'
import ProfileForm from '../components/profile-form'

export default class EditProfileForm extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        id: query.id,
        formType: query.formType,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
    }
  }

  render() {
    return <ProfileForm formType={this.props.formType} id={this.props.id} />
  }
}
