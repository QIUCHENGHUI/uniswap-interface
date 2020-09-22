import { useCallback } from 'react'

import { Contract } from 'web3-eth-contract'
import { useActiveWeb3React } from '..'

import { redeem } from '../../utils/yam/yamUtils'

const useRedeem = (poolContract: Contract | undefined) => {
  const { account } = useActiveWeb3React()

  const handleRedeem = useCallback(async () => {
    const txHash = await redeem(poolContract, account)
    console.log(txHash)
    return txHash
  }, [account, poolContract])

  return { onRedeem: handleRedeem }
}

export default useRedeem
