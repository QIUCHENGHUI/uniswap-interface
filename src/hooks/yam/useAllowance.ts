import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { Contract } from 'web3-eth-contract'

import { getAllowance } from '../../utils/yam/erc20'
import { useActiveWeb3React } from '..'

const useAllowance = (tokenContract: Contract, poolContract?: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account } = useActiveWeb3React()

  const fetchAllowance = useCallback(async () => {
    if (account) {
      const allowance = await getAllowance(tokenContract, poolContract, account)
      setAllowance(new BigNumber(allowance))
    }
  }, [account, poolContract, tokenContract])

  useEffect(() => {
    if (account && poolContract && tokenContract) {
      fetchAllowance()
    }
    const refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, fetchAllowance, poolContract, tokenContract])

  return allowance
}

export default useAllowance
