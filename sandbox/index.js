import React from 'react'
import ReactDOM from 'react-dom'

import Header from '../components/header'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import List from '../components/list'
import { TeamDetailSmall } from '../components/team'

const teams = [
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

function Wrapper ({ title, description, children }) {
  return (
    <div className=''>
      <h2>{title}</h2>
      {description && (<p>{description}</p>)}
      <div className='code mw8 pa3 mb5 center bg-white'>
        {children}
      </div>
    </div>
  )
}

class App extends React.Component {
  render () {
    return (
      <div className=''>
        <Wrapper title='Header' description='Used as header of the app'>
          <Header
            user='someusername'
            picture='https://caputobrotherscreamery.com/wp-content/uploads/Wood-fired-pizza.jpg'
          />
        </Wrapper>

        <Wrapper title='Section' description='Create sections of content'>
          <Section>
            <p>Example content</p>
          </Section>
        </Wrapper>

        <Wrapper title='Section' description='Create sections of content'>
          <SectionHeader>
            Example header
          </SectionHeader>
        </Wrapper>

        <Wrapper title='List' description='Create lists of content'>
          <List items={[
            { title: 'hi', description: 'ok' },
            { title: 'hey', description: 'wat' },
            { title: 'bye', description: 'cool' }
          ]}>
            {({ title, description }) => {
              return (
                <div className='flex-auto'>
                  <h2 className='f5 tracked b'>{title}</h2>
                  <div className='f6'>{description}</div>
                </div>
              )
            }}
          </List>
        </Wrapper>

        <Wrapper title='TeamDetailSmall'>
          <TeamDetailSmall {...teams[0]} />
        </Wrapper>

        <Wrapper title='Section, SectionHeader, List, & TeamDetailSmall'>
          <Section>
            <SectionHeader>Teams</SectionHeader>
            <List items={teams}>
              {(team) => {
                return (<TeamDetailSmall {...team} />)
              }}
            </List>
          </Section>
        </Wrapper>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))

/*
<ComponentWrapper
  title={}
  description={}
>

</ComponentWrapper>
*/
