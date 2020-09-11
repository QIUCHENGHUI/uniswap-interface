import { useContext } from 'react'
import { Context as FarmsContext } from '../../contexts/yam/Farms'

const useFarms = () => {
  const { farms } = useContext(FarmsContext)
  return [farms]
}

export default useFarms
