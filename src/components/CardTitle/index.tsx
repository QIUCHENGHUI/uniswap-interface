import React from 'react'
import styled from 'styled-components'

interface CardTitleProps {
  text?: string
}

// eslint-disable-next-line react/prop-types
const CardTitle: React.FC<CardTitleProps> = ({ text }) => <StyledCardTitle>{text}</StyledCardTitle>

const StyledCardTitle = styled.div`
  color: ${({ theme }) => theme.grey600};
  font-size: 18px;
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing[4]}px;
  text-align: center;
`

export default CardTitle
