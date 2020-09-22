import { useCallback } from 'react'

import { Contract } from 'web3-eth-contract'
import { useActiveWeb3React } from '..'

import { stake } from '../../utils/yam/yamUtils'

const useStake = (poolContract: Contract | undefined, tokenName: string) => {
  const { account } = useActiveWeb3React()

  const handleStake = useCallback(
    async (amount: string) => {
      const txHash = await stake(poolContract, amount, account, tokenName)
      console.log(txHash)
    },
    [account, poolContract, tokenName]
  )

  return { onStake: handleStake }
}

export default useStake
