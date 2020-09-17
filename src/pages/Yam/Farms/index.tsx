import React, { useEffect } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'

import farmer from '../../../assets/img/farmer.png'

import Page from '../../../components/Page'
import PageHeader from '../../../components/PageHeader'

import Farm from '../Farm'

import FarmCards from './components/FarmCards'

export default function Farms() {
  const { path } = useRouteMatch()
  const { connect } = useWallet()
  useEffect(() => {
    connect('injected')
  }, [connect])

  return (
    <Switch>
      <Page>
        <>
          <Route exact path={path}>
            <PageHeader
              icon={<img src={farmer} height="96" />}
              subtitle="Earn YAM tokens by providing liquidity."
              title="Select a farm."
            />
            <FarmCards />
          </Route>
          <Route path={`${path}/:farmId`}>
            <Farm />
          </Route>
        </>
      </Page>
    </Switch>
  )
}
