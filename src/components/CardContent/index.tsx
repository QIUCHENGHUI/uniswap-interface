import React from 'react'
import styled from 'styled-components'

// eslint-disable-next-line react/prop-types
const CardContent: React.FC = ({ children }) => <StyledCardContent>{children}</StyledCardContent>

const StyledCardContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[4]}px;
`

export default CardContent
