import React from 'react'

import Button from '../../../components/YamButton'
import Container from '../../../components/Container'
import Page from '../../../components/Page'
import PageHeader from '../../../components/PageHeader'
import Spacer from '../../../components/Spacer'

import Balances from './components/Balances'

const Home: React.FC = () => {
  return (
    <Page>
      <PageHeader icon="🗣" subtitle="Vote on the future of the YAM protocol." title="YAMV2 governance is live." />
      <Container>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Button href="https://snapshot.page/#/yam" text="View Proposals" />
          <Spacer />
          <Button href="https://forum.yam.finance" text="Governance Forum" />
        </div>
        <Spacer size="lg" />
        <Balances />
      </Container>
      <Spacer size="lg" />
      <div
        style={{
          margin: '0 auto'
        }}
      >
        <Button size="sm" text="View V1 Farms" to="/yam/farms" variant="secondary" />
      </div>
    </Page>
  )
}

export default Home
