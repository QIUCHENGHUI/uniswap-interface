import React from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: string
}

// eslint-disable-next-line react/prop-types
const Label: React.FC<LabelProps> = ({ text }) => <StyledLabel>{text}</StyledLabel>

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.grey400};
`

export default Label
