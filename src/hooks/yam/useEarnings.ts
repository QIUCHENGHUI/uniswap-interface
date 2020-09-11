import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import { getEarned } from '../../utils/yam/yamUtils'
import useYam from './useYam'

const useEarnings = (pool: Contract | undefined) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string | null } = useWallet()
  const yam = useYam()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(yam, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, yam])

  useEffect(() => {
    if (account && pool && yam) {
      fetchBalance()
    }
  }, [account, fetchBalance, pool, setBalance, yam])

  return balance
}

export default useEarnings
