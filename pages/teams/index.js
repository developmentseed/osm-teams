import React, { Component } from 'react'

const temporaryTeams = [
  {
    id: 1,
    name: 'OpenPizzaMap',
    hashtag: '#openpizzamap',
    bio: 'Mapping all the pizza'
  },
  {
    id: 2,
    name: 'OpenPizzaMap',
    hashtag: '#openpizzamap',
    bio: 'Mapping all the pizza'
  },
  {
    id: 3,
    name: 'OpenPizzaMap',
    hashtag: '#openpizzamap',
    bio: 'Mapping all the pizza'
  },
  {
    id: 4,
    name: 'OpenPizzaMap',
    hashtag: '#openpizzamap',
    bio: 'Mapping all the pizza'
  },
  {
    id: 5,
    name: 'OpenPizzaMap',
    hashtag: '#openpizzamap',
    bio: 'Mapping all the pizza'
  }
]

export default class TeamList extends Component {
  static async getInitialProps () {}

  renderTeamList () {
    const renderTeam = ({ id, name, hashtag, bio }) => {
      return (
        <a
          key={`${hashtag}-${id}`}
          className='flex mb2 no-underline black nl2 pl2 pb3 hover-bg-light-gray'
          href={`/teams/[id]`}
          as={`/teams/${id}`}
        >
          <div className='flex-auto'>
            <h2 className='f5 tracked b'>{name}</h2>
            <div className='f6'>{bio}</div>
          </div>
        </a>
      )
    }

    return temporaryTeams.map(renderTeam)
  }

  render () {
    return (
      <div>
        <h2 className='flex items-center bb b--black-10 pb3'>
          Teams
        </h2>
        { this.renderTeamList() }
      </div>
    )
  }
}
