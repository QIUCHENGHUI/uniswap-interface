import { useCallback } from 'react'

import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import { redeem } from '../../utils/yam/yamUtils'

const useRedeem = (poolContract: Contract | undefined) => {
  const { account } = useWallet()

  const handleRedeem = useCallback(async () => {
    const txHash = await redeem(poolContract, account)
    console.log(txHash)
    return txHash
  }, [account, poolContract])

  return { onRedeem: handleRedeem }
}

export default useRedeem
