import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { getBalance } from '../../utils/yam/erc20'
import { useActiveWeb3React } from '..'

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { ethereum }: { ethereum: provider } = useWallet()
  const { account } = useActiveWeb3React()

  const fetchBalance = useCallback(async () => {
    if (account) {
      const balance = await getBalance(ethereum, tokenAddress, account)
      setBalance(new BigNumber(balance))
    }
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
