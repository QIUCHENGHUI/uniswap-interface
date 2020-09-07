import { ChainId, Currency, CurrencyAmount, Token, TokenAmount, WETH, ETHER as UniswapETHER } from '@uniswap/sdk'
import { ZERO_ADDRESS } from '../constants/one-split'
export const UniswapZeroETHER = new Token(ChainId.MAINNET, ZERO_ADDRESS, 18, 'ETH', 'Ethereum')

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === UniswapETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined
}

export function wrappedUniswapZeroCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === (UniswapETHER || UniswapZeroETHER) ? UniswapZeroETHER : currency instanceof Token ? currency : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function wrappedMooniswapCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedUniswapZeroCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token: Token): Currency {
  if (token.equals(UniswapZeroETHER)) return UniswapZeroETHER
  return token
}
