import React from 'react'
import ReactDOM from 'react-dom'

import Header from '../components/header'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import List from '../components/list'
import Table from '../components/table'
import { TeamDetailSmall } from '../components/team'

// import globalStyles from '../styles/global.js'
import Layout from '../components/layout.js'

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

const teamColumns = [
  { key: 'id' },
  { key: 'name' },
  { key: 'hashtag' }
]

function Wrapper ({ title, description, children }) {
  return (
    <div className='inner'>
      <h2>{title}</h2>
      {description && (<p>{description}</p>)}
      <div>
        {children}
      </div>
      <style jsx>{`
        .inner {
          margin: 2rem 0;
        }
      `}
      </style>
    </div>
  )
}

class App extends React.Component {
  render () {
    return (
      <div className='page'>
        <Layout>
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

          <Wrapper title='SectionHeader' description='Create headers for sections of content'>
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
                    <h2 className='f5'>{title}</h2>
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

          <Wrapper title='Table'>
            <Table
              rows={teams}
              columns={teamColumns}
              onRowClick={(row, index) => {
                console.log('onRowClick', row, index)
              }}
            />
          </Wrapper>
        </Layout>
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
