import React from 'react'
import styled from 'styled-components'

import Spacer from '../Spacer'

// eslint-disable-next-line react/prop-types
const ModalActions: React.FC = ({ children }) => {
  const l = React.Children.toArray(children).length
  return (
    <StyledModalActions>
      {React.Children.map(children, (child, i) => (
        <>
          <StyledModalAction>{child}</StyledModalAction>
          {i < l - 1 && <Spacer />}
        </>
      ))}
    </StyledModalActions>
  )
}

const StyledModalActions = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.grey100}00;
  display: flex;
  margin: 0;
  padding: ${({ theme }) => theme.spacing[4]}px;
`

const StyledModalAction = styled.div`
  flex: 1;
`

export default ModalActions
