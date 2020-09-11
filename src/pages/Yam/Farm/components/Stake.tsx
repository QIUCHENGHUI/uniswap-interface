import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { Contract } from 'web3-eth-contract'

import Button from '../../../../components/YamButton'
import Card from '../../../../components/YamCard'
import CardContent from '../../../../components/CardContent'
import CardIcon from '../../../../components/CardIcon'
import { AddIcon } from '../../../../components/icons'
import IconButton from '../../../../components/IconButton'
import Label from '../../../../components/Label'
import Value from '../../../../components/Value'

import useAllowance from '../../../../hooks/yam/useAllowance'
import useApprove from '../../../../hooks/yam/useApprove'
import useModal from '../../../../hooks/yam/useModal'
import useStake from '../../../../hooks/yam/useStake'
import useStakedBalance from '../../../../hooks/yam/useStakedBalance'
import useTokenBalance from '../../../../hooks/yam/useTokenBalance'
import useUnstake from '../../../../hooks/yam/useUnstake'

import { getDisplayBalance } from '../../../../utils/yam/formatBalance'

import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'

interface StakeProps {
  poolContract: Contract | undefined
  tokenContract: Contract
  tokenName: string
}

// eslint-disable-next-line react/prop-types
const Stake: React.FC<StakeProps> = ({ poolContract, tokenContract, tokenName }) => {
  const [requestedApproval, setRequestedApproval] = useState(false)

  const allowance = useAllowance(tokenContract, poolContract)
  const { onApprove } = useApprove(tokenContract, poolContract)

  // eslint-disable-next-line react/prop-types
  const tokenBalance = useTokenBalance(tokenContract?.options.address)
  const stakedBalance = useStakedBalance(poolContract)

  const { onStake } = useStake(poolContract, tokenName)
  const { onUnstake } = useUnstake(poolContract)

  const [onPresentDeposit] = useModal(<DepositModal max={tokenBalance} onConfirm={onStake} tokenName={tokenName} />)

  const [onPresentWithdraw] = useModal(
    <WithdrawModal max={stakedBalance} onConfirm={onUnstake} tokenName={tokenName} />
  )

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      const txHash = await onApprove()
      // user rejected tx or didn't go thru
      if (!txHash) {
        setRequestedApproval(false)
      }
    } catch (e) {
      console.log(e)
    }
  }, [onApprove, setRequestedApproval])

  return (
    <Card>
      <CardContent>
        <StyledCardContentInner>
          <StyledCardHeader>
            <CardIcon>🌱</CardIcon>
            <Value value={getDisplayBalance(stakedBalance)} />
            <Label text={`${tokenName} Staked`} />
          </StyledCardHeader>
          <StyledCardActions>
            {!allowance.toNumber() ? (
              <Button disabled={requestedApproval} onClick={handleApprove} text={`Approve ${tokenName}`} />
            ) : (
              <>
                <Button text="Unstake" onClick={onPresentWithdraw} />
                <StyledActionSpacer />
                {false && (
                  <IconButton onClick={onPresentDeposit}>
                    <AddIcon />
                  </IconButton>
                )}
              </>
            )}
          </StyledCardActions>
        </StyledCardContentInner>
      </CardContent>
    </Card>
  )
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${props => props.theme.spacing[6]}px;
  width: 100%;
`

const StyledActionSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`

export default Stake
