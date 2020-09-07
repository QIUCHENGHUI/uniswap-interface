import { Currency, Token } from '@uniswap/sdk'
import { ETHER as UniswapETHER } from "@uniswap/sdk"
import { UniswapZeroETHER } from './wrappedCurrency'
export function currencyId(currency: Currency): string {
  if (currency === UniswapETHER || currency === UniswapZeroETHER) return 'ETH'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
