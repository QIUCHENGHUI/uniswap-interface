import { useCallback } from 'react'

import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import { stake } from '../../utils/yam/yamUtils'

const useStake = (poolContract: Contract | undefined, tokenName: string) => {
  const { account } = useWallet()

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
