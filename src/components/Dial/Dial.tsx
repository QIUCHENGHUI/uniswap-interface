import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

interface DialProps {
  children?: React.ReactNode
  color?: 'primary' | 'secondary'
  disabled?: boolean
  size?: number
  value: number
}

// eslint-disable-next-line react/prop-types
const Dial: React.FC<DialProps> = ({ children, color, disabled, size = 256, value }) => {
  const theme = useContext(ThemeContext)
  let pathColor = theme.secondaryMain
  if (color === 'primary') {
    pathColor = theme.primaryMain
  }

  return (
    <StyledDial size={size}>
      <StyledOuter>
        <CircularProgressbar
          value={value}
          styles={buildStyles({
            strokeLinecap: 'round',
            pathColor: !disabled ? pathColor : theme.grey400,
            pathTransitionDuration: 1
          })}
        />
      </StyledOuter>
      <StyledInner size={size}>{children}</StyledInner>
    </StyledDial>
  )
}

interface StyledInnerProps {
  size: number
}

const StyledDial = styled.div<StyledInnerProps>`
  padding: calc(${({ size }) => size}px * 24 / 256);
  position: relative;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`

const StyledInner = styled.div<StyledInnerProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.grey200};
  border-radius: ${({ size }) => size}px;
  display: flex;
  justify-content: center;
  position: relative;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`

const StyledOuter = styled.div`
  background-color: ${({ theme }) => theme.grey300};
  border-radius: 10000px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

export default Dial
