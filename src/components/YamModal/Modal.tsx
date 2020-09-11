import React from 'react'
import styled, { keyframes } from 'styled-components'

export interface ModalProps {
  onDismiss?: () => void
}

// eslint-disable-next-line react/prop-types
const Modal: React.FC = ({ children }) => {
  return (
    <StyledResponsiveWrapper>
      <StyledModal>{children}</StyledModal>
    </StyledResponsiveWrapper>
  )
}

const mobileKeyframes = keyframes`
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
`

const StyledResponsiveWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  width: 100%;
  max-width: 512px;
  @media (max-width: ${({ theme }) => theme.breakpointsMobile}px) {
    flex: 1;
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    max-height: calc(100% - ${({ theme }) => theme.spacing[4]}px);
    animation: ${mobileKeyframes} 0.3s forwards ease-out;
  }
`

const StyledModal = styled.div`
  background: ${({ theme }) => theme.grey200};
  border: 1px solid ${({ theme }) => theme.grey300}ff;
  border-radius: 12px;
  box-shadow: inset 1px 1px 0px ${({ theme }) => theme.grey100};
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: 0;
`

export default Modal
