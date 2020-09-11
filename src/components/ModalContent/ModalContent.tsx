import React from 'react'
import styled from 'styled-components'

// eslint-disable-next-line react/prop-types
const ModalContent: React.FC = ({ children }) => {
  return <StyledModalContent>{children}</StyledModalContent>
}

const StyledModalContent = styled.div`
  padding: ${({ theme }) => theme.spacing[4]}px;
  @media (max-width: ${({ theme }) => theme.breakpointsMobile}px) {
    flex: 1;
    overflow: auto;
  }
`

export default ModalContent
