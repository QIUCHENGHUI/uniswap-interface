import React from 'react'
import styled from 'styled-components'

interface ModalTitleProps {
  text?: string
}

// eslint-disable-next-line react/prop-types
const ModalTitle: React.FC<ModalTitleProps> = ({ text }) => <StyledModalTitle>{text}</StyledModalTitle>

const StyledModalTitle = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.grey600};
  display: flex;
  font-size: 18px;
  font-weight: 700;
  height: ${({ theme }) => theme.topBarSize}px;
  justify-content: center;
`

export default ModalTitle
