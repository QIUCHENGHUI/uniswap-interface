import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Swap from '../Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from '../Swap/redirects'
import Pool from '../Pool'
import PoolFinder from '../PoolFinder'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from '../AddLiquidity/redirects'
import AddLiquidity from '../AddLiquidity'
import RemoveV1Exchange from '../MigrateV1/RemoveV1Exchange'
import { RedirectOldRemoveLiquidityPathStructure } from '../RemoveLiquidity/redirects'
import RemoveLiquidity from '../RemoveLiquidity'
import MigrateV1 from '../MigrateV1'
import MigrateV1Exchange from '../MigrateV1/MigrateV1Exchange'

export default function UniswapRoute() {
  return (
    <Switch>
      <Route exact strict path="/uniswap/swap" component={Swap} />
      <Route exact strict path="/uniswap/swap/:outputCurrency" component={RedirectToSwap} />
      <Route exact strict path="/uniswap/send" component={RedirectPathToSwapOnly} />
      <Route exact strict path="/uniswap/find" component={PoolFinder} />
      <Route exact strict path="/uniswap/pool" component={Pool} />
      <Route exact strict path="/uniswap/create" component={RedirectToAddLiquidity} />
      <Route exact path="/uniswap/add" component={AddLiquidity} />
      <Route exact path="/uniswap/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
      <Route exact path="/uniswap/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
      <Route exact strict path="/uniswap/remove/v1/:address" component={RemoveV1Exchange} />
      <Route exact strict path="/uniswap/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
      <Route exact strict path="/uniswap/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
      <Route exact strict path="/uniswap/migrate/v1" component={MigrateV1} />
      <Route exact strict path="/uniswap/migrate/v1/:address" component={MigrateV1Exchange} />
    </Switch>
  )
}
