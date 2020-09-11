import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'

import { IconProps } from '../Icon'

// eslint-disable-next-line react/prop-types
const RemoveIcon: React.FC<IconProps> = ({ color, size = 18 }) => {
  const theme = useContext(ThemeContext)
  return (
    <svg viewBox="0 0 24 24" fill={color ? color : theme.grey400} width={size * 0.75} height={size * 0.75}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 13H5v-2h14v2z" />
    </svg>
  )
}

export default RemoveIcon
