/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import numeral from 'numeral'

import Button from '../../../Home/components/Button'
import Card from '../../../Home/components/Card'
import CardIcon from '../../../../components/CardIcon'
import IconLoader from '../../../../components/IconLoader'
import Spacer from '../../../../components/Spacer'

import useFarms from '../../../../hooks/yam/useFarms'
import useYam from '../../../../hooks/yam/useYam'

import { Farm } from '../../../../contexts/yam/Farms'

import { bnToDec } from '../../../../utils/yam'
import { getEarned, getPoolStartTime } from '../../../../utils/yam/yamUtils'

const FarmCards: React.FC = () => {
  const [farms] = useFarms()
  const rows = farms.reduce<Farm[][]>(
    (farmRows, farm) => {
      const newFarmRows = [...farmRows]
      if (newFarmRows[newFarmRows.length - 1].length === 3) {
        newFarmRows.push([farm])
      } else {
        newFarmRows[newFarmRows.length - 1].push(farm)
      }
      return newFarmRows
    },
    [[]]
  )

  return (
    <StyledCards>
      {!!rows[0].length ? (
        rows.map((farmRow, i) => (
          <StyledRow key={i}>
            {farmRow.map((farm, j) => (
              <React.Fragment key={j}>
                <FarmCard farm={farm} />
                {(j === 0 || j === 1) && <StyledSpacer />}
              </React.Fragment>
            ))}
          </StyledRow>
        ))
      ) : (
        <StyledLoadingWrapper>
          <IconLoader text="Loading farms" />
        </StyledLoadingWrapper>
      )}
    </StyledCards>
  )
}

interface FarmCardProps {
  farm: Farm
}

const FarmCard: React.FC<FarmCardProps> = ({ farm }) => {
  const [startTime, setStartTime] = useState(0)
  const [harvestable, setHarvestable] = useState(0)

  const { contract } = farm
  const { account } = useWallet()
  const yam = useYam()

  const getStartTime = useCallback(async () => {
    const startTime = await getPoolStartTime(farm.contract)
    setStartTime(startTime)
  }, [farm, setStartTime])

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span style={{ width: '100%' }}>
        {paddedHours}:{paddedMinutes}:{paddedSeconds}
      </span>
    )
  }

  useEffect(() => {
    if (farm && farm.id === 'ycrv_yam_uni_lp') {
      getStartTime()
    }
  }, [farm, getStartTime])

  useEffect(() => {
    async function fetchEarned() {
      const earned = await getEarned(yam, contract, account)
      setHarvestable(bnToDec(earned))
    }
    if (yam && account) {
      fetchEarned()
    }
  }, [yam, contract, account, setHarvestable])

  const poolActive = startTime * 1000 - Date.now() <= 0
  return (
    <StyledCardWrapper>
      {farm.id === 'ycrv_yam_uni_lp' && <StyledCardAccent />}
      <Card>
        <CardContent>
          <StyledContent>
            <CardIcon>{farm.icon}</CardIcon>
            <StyledTitle>{farm.name}</StyledTitle>
            <StyledDetails>
              <StyledDetail>Deposit {farm.depositToken.toUpperCase()}</StyledDetail>
              <StyledDetail>Earn {farm.earnToken.toUpperCase()}</StyledDetail>
            </StyledDetails>
            <Spacer />
            <StyledHarvestable>
              {harvestable ? `${numeral(harvestable).format('0.00a')} YAMs ready to harvest.` : undefined}
            </StyledHarvestable>
            <Button disabled={!poolActive} text={poolActive ? 'Select' : undefined} to={`/farms/${farm.id}`}>
              {!poolActive && <Countdown date={new Date(startTime * 1000)} renderer={renderer} />}
            </Button>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  )
}

// eslint-disable-next-line react/prop-types
const CardContent: React.FC = ({ children }) => <StyledCardContent>{children}</StyledCardContent>

const StyledCardContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${props => props.theme.spacing[4]}px;
`

const StyledCardAccent = styled.div`
  background: linear-gradient(
      45deg,
      rgb(255, 0, 0) 0%,
      rgb(255, 154, 0) 10%,
      rgb(208, 222, 33) 20%,
      rgb(79, 220, 74) 30%,
      rgb(63, 218, 216) 40%,
      rgb(47, 201, 226) 50%,
      rgb(28, 127, 238) 60%,
      rgb(95, 21, 242) 70%,
      rgb(186, 12, 248) 80%,
      rgb(251, 7, 217) 90%,
      rgb(255, 0, 0) 100%
    )
    0% 0% / 300% 300%;
  border-radius: 12px;
  filter: blur(6px);
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
  animation: 2s linear 0s infinite normal none running breath;
  @keyframes breath {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`

const StyledCards = styled.div`
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing[4]}px;
  flex-flow: row wrap;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${props => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
`

const StyledTitle = styled.h4`
  color: ${({ theme }) => theme.grey600};
  font-size: 24px;
  font-weight: 700;
  margin: ${({ theme }) => theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledSpacer = styled.div`
  height: ${({ theme }) => theme.spacing[4]}px;
  width: ${({ theme }) => theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  margin-top: ${({ theme }) => theme.spacing[2]}px;
  text-align: center;
`

const StyledDetail = styled.div`
  color: ${({ theme }) => theme.grey500};
`

const StyledHarvestable = styled.div`
  color: ${({ theme }) => theme.secondaryMain};
  font-size: 16px;
  height: 48px;
  text-align: center;
`

export default FarmCards
