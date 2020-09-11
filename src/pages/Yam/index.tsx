import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Farms from './Farms'
import YamProvider from '../../contexts/yam/YamProvider'
import FarmsProvider from '../../contexts/yam/Farms'
import ModalsProvider from '../../contexts/yam/Modals'
import { UseWalletProvider } from 'use-wallet'

export default function YamRoute() {
  return (
    <UseWalletProvider
      chainId={1}
      connectors={{
        walletconnect: { rpcUrl: 'https://mainnet.eth.aragon.network/' }
      }}
    >
      <YamProvider>
        <FarmsProvider>
          <ModalsProvider>
            <Switch>
              <Route exact strict path="/yam/farms" component={Farms} />
            </Switch>
          </ModalsProvider>
        </FarmsProvider>
      </YamProvider>
    </UseWalletProvider>
  )
}
