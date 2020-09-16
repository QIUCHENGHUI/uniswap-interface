import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Farms from './Farms'
import YamProvider from '../../contexts/yam/YamProvider'
import TransactionProvider from '../../contexts/yam/Transactions'
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
        <TransactionProvider>
          <FarmsProvider>
            <ModalsProvider>
              <Switch>
                <Route path="/yam/farms" component={Farms} />
              </Switch>
            </ModalsProvider>
          </FarmsProvider>
        </TransactionProvider>
      </YamProvider>
    </UseWalletProvider>
  )
}
