import React from 'react'
import styled from 'styled-components'

export interface IconProps {
  color?: string
  children?: React.ReactNode
  size?: number
}

// eslint-disable-next-line react/prop-types
const Icon: React.FC<IconProps> = ({ children, color, size = 24 }) => (
  <StyledIcon>
    {React.isValidElement(children) &&
      React.cloneElement(children, {
        color,
        size
      })}
  </StyledIcon>
)

const StyledIcon = styled.div``

export default Icon
