import { useCallback } from 'react'

import { Contract } from 'web3-eth-contract'
import { useActiveWeb3React } from '..'

import { approve } from '../../utils/yam/yamUtils'

const useApprove = (tokenContract: Contract, poolContract: Contract | undefined) => {
  const { account } = useActiveWeb3React()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(tokenContract, poolContract, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, tokenContract, poolContract])

  return { onApprove: handleApprove }
}

export default useApprove
