import React from 'react'
// import { useRouteMatch } from 'react-router-dom'
import farmer from '../../../assets/img/farmer.png'

import Page from '../../../components/Page'
import PageHeader from '../../../components/PageHeader'

import FarmCards from './components/FarmCards'

export default function Farms() {
  // const { path } = useRouteMatch()
  return (
    <Page>
      <>
        <PageHeader
          icon={<img src={farmer} height="96" />}
          subtitle="Earn YAM tokens by providing liquidity."
          title="Select a farm."
        />
        <FarmCards />
      </>
    </Page>
  )
}
