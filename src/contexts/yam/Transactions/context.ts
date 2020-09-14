/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react'
import { Transaction, TransactionsMap } from './types'

interface TransactionsContext {
  transactions: TransactionsMap
  onAddTransaction: (tx: Transaction) => void
}

export default createContext<TransactionsContext>({
  transactions: {},
  onAddTransaction: (tx: Transaction) => {}
})
