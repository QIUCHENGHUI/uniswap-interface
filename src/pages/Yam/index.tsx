import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Farms from './Farms'

export default function YamRoute() {
  return (
    <Switch>
      <Route exact strict path="/yam/farms" component={Farms} />
    </Switch>
  )
}
