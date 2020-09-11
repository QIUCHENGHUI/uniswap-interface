import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { getBalance } from '../../utils/yam/erc20'

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account, ethereum }: { account: string | null; ethereum: provider } = useWallet()

  const fetchBalance = useCallback(async () => {
    const balance = await getBalance(ethereum, tokenAddress, account)
    setBalance(new BigNumber(balance))
  }, [account, ethereum, tokenAddress])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalance()
      const refreshInterval = setInterval(fetchBalance, 10000)
      return () => clearInterval(refreshInterval)
    }
    return
  }, [account, ethereum, fetchBalance, setBalance, tokenAddress])

  return balance
}

export default useTokenBalance
