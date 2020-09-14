import React from 'react'
import styled from 'styled-components'

import Card from '../../../../components/YamCard'
import CardContent from '../../../../components/CardContent'
import Label from '../../../../components/Label'

import { getDisplayBalance } from '../../../../utils/yam/formatBalance'
import BigNumber from 'bignumber.js'

interface StatsProps {
  curPrice?: number
  scalingFactor?: number
  targetPrice?: number
}
// eslint-disable-next-line react/prop-types
const Stats: React.FC<StatsProps> = ({ curPrice, scalingFactor, targetPrice }) => {
  return (
    <StyledStats>
      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{curPrice ? `$${getDisplayBalance(new BigNumber(curPrice))}` : '--'}</StyledValue>
            <Label text="Current Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{targetPrice ? `$${targetPrice}` : '--'}</StyledValue>
            <Label text="Target Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{scalingFactor ? scalingFactor + 'x' : '--'}</StyledValue>
            <Label text="Scaling Factor" />
          </StyledStat>
        </CardContent>
      </Card>
    </StyledStats>
  )
}

const StyledStats = styled.div`
  flex: 1;
`

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledValue = styled.span`
  color: ${({ theme }) => theme.grey600};
  font-size: 36px;
  font-weight: 700;
`

const StyledSpacer = styled.div`
  height: ${({ theme }) => theme.spacing[4]}px;
`

export default Stats
