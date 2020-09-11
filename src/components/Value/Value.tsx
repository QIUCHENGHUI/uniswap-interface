import React from 'react'

import styled from 'styled-components'

interface ValueProps {
  value: string
}

// eslint-disable-next-line react/prop-types
const Value: React.FC<ValueProps> = ({ value }) => {
  return <StyledValue>{value}</StyledValue>
}

const StyledValue = styled.div`
  color: ${({ theme }) => theme.grey600};
  font-size: 36px;
  font-weight: 700;
`

export default Value
