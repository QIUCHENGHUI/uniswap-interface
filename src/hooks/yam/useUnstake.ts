import { useCallback } from 'react'

import { Contract } from 'web3-eth-contract'
import { useActiveWeb3React } from '..'

import { unstake } from '../../utils/yam/yamUtils'

const useUnstake = (poolContract: Contract | undefined) => {
  const { account } = useActiveWeb3React()

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await unstake(poolContract, amount, account)
      console.log(txHash)
    },
    [account, poolContract]
  )

  return { onUnstake: handleUnstake }
}

export default useUnstake
