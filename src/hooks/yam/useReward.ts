import { useCallback } from 'react'

import { Contract } from 'web3-eth-contract'
import { useActiveWeb3React } from '..'

import { harvest } from '../../utils/yam/yamUtils'

const useReward = (poolContract: Contract | undefined) => {
  const { account } = useActiveWeb3React()

  const handleReward = useCallback(async () => {
    const txHash = await harvest(poolContract, account)
    console.log(txHash)
    return txHash
  }, [account, poolContract])

  return { onReward: handleReward }
}

export default useReward
