import { useEffect, useState } from 'react'

import { bnToDec, decToBn } from '../../utils/yam'
import { getScalingFactor } from '../../utils/yam/yamUtils'

import useYam from './useYam'

const useScalingFactor = () => {
  const [scalingFactor, setScalingFactor] = useState(decToBn(1))
  const yam = useYam()

  useEffect(() => {
    async function fetchScalingFactor() {
      const sf = await getScalingFactor(yam)
      setScalingFactor(sf)
    }
    if (yam) {
      fetchScalingFactor()
    }
  }, [yam])

  return bnToDec(scalingFactor)
}

export default useScalingFactor
