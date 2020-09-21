import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import { yamv2 as yamV2Address } from '../../constants/yam/tokenAddresses'
import useTokenBalance from '../../hooks/yam/useTokenBalance'
import { getDisplayBalance } from '../../utils/yam/formatBalance'

import Button from '../YamButton'
import CardIcon from '../CardIcon'
import Label from '../Label'
import Modal, { ModalProps } from '../YamModal'
import ModalActions from '../ModalActions'
import ModalContent from '../ModalContent'
import ModalTitle from '../ModalTitle'
import Spacer from '../Spacer'
import Value from '../Value'

// eslint-disable-next-line react/prop-types
const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, reset } = useWallet()

  const handleSignOutClick = useCallback(() => {
    onDismiss?.()
    reset()
  }, [onDismiss, reset])

  const yamV2Balance = useTokenBalance(yamV2Address)

  return (
    <Modal>
      <ModalTitle text="My Account" />
      <ModalContent>
        <Spacer />

        <div style={{ display: 'flex' }}>
          <StyledBalanceWrapper>
            <CardIcon>
              <span>🍠</span>
            </CardIcon>
            <StyledBalance>
              <Value value={getDisplayBalance(yamV2Balance, 24)} />
              <Label text="YAMV2 Balance" />
            </StyledBalance>
          </StyledBalanceWrapper>
        </div>

        <Spacer />
        <Button href={`https://etherscan.io/address/${account}`} text="View on Etherscan" variant="secondary" />
        <Spacer />
        <Button onClick={handleSignOutClick} text="Sign out" variant="secondary" />
      </ModalContent>
      <ModalActions>
        <Button onClick={onDismiss} text="Cancel" />
      </ModalActions>
    </Modal>
  )
}

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing[4]}px;
`

export default AccountModal
