import { useContext } from 'react'
import { Context } from '../../contexts/yam/YamProvider'

const useYam = () => {
  const { yam } = useContext(Context)
  return yam
}

export default useYam
