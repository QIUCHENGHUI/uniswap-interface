import { Currency, Token, ETHER as UniswapETHER } from '@uniswap/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { UniswapZeroETHER } from '../../utils/wrappedCurrency'
import Logo from '../Logo'

const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const getTokenLogoURL1inch = (address: string) =>
  `https://1inch.exchange/assets/tokens/${address.toLowerCase()}.png`

// const BAD_URIS: { [tokenAddress: string]: true } = {}
// const FALLBACK_URIS: { [tokenAddress: string]: string } = {}

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === UniswapZeroETHER || currency === UniswapETHER) return []

    if (currency instanceof Token) {
      if (currency.address.toLowerCase() === '0x0000000000004946c0e9F43F4Dee607b0eF1fA1c'.toLowerCase()) {
        return [...uriLocations, getTokenLogoURL1inch(currency.address)]
      } else if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }

      return [getTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  if (currency === UniswapZeroETHER || currency === UniswapETHER) {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}