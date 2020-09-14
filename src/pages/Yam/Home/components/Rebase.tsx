import React from 'react'
import styled from 'styled-components'
import Countdown, { CountdownRenderProps } from 'react-countdown'

import Button from '../../../../components/YamButton'
import Card from '../../../../components/YamCard'
import CardContent from '../../../../components/CardContent'
import Dial from '../../../../components/Dial'
import Label from '../../../../components/Label'

interface RebaseProps {
  nextRebase?: number
}

// eslint-disable-next-line react/prop-types
const Rebase: React.FC<RebaseProps> = ({ nextRebase = 0 }) => {
  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span>
        {paddedHours}:{paddedMinutes}:{paddedSeconds}
      </span>
    )
  }

  const dialValue = (nextRebase / (1000 * 60 * 60 * 12)) * 100

  return (
    <StyledRebase>
      <Card>
        <CardContent>
          <StyledCountdownWrapper>
            <Dial disabled={!nextRebase} size={232} value={dialValue ? dialValue : 0}>
              <StyledCountdown>
                <StyledCountdownText>
                  {!nextRebase ? '--' : <Countdown date={new Date(Date.now() + nextRebase)} renderer={renderer} />}
                </StyledCountdownText>
                <Label text="Next rebase" />
              </StyledCountdown>
            </Dial>
          </StyledCountdownWrapper>
          <StyledSpacer />
          <Button disabled text="Rebase" />
        </CardContent>
      </Card>
    </StyledRebase>
  )
}

const StyledRebase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledCountdown = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCountdownText = styled.span`
  color: ${({ theme }) => theme.grey600};
  font-size: 36px;
  font-weight: 700;
`
const StyledCountdownWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const StyledSpacer = styled.div`
  height: ${({ theme }) => theme.spacing[4]}px;
`

export default Rebase
