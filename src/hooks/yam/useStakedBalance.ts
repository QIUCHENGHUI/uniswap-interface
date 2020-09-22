import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { Contract } from 'web3-eth-contract'

import { getStaked } from '../../utils/yam/yamUtils'
import useYam from './useYam'
import { useActiveWeb3React } from '..'

const useStakedBalance = (pool: Contract | undefined) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account } = useActiveWeb3React()
  const yam = useYam()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(yam, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, yam])

  useEffect(() => {
    if (account && pool && yam) {
      fetchBalance()
    }
  }, [account, fetchBalance, pool, setBalance, yam])

  return balance
}

export default useStakedBalance
