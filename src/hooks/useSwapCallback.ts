import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TokenAmount } from '@uniswap/sdk'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@uniswap/sdk'
import { getAddress } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { BIPS_BASE, DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE, REFERRAL_ADDRESS_STORAGE_KEY } from '../constants'
import { FLAG_DISABLE_ALL_SPLIT_SOURCES, FLAG_DISABLE_ALL_WRAP_SOURCES, FLAG_DISABLE_MOONISWAP_ALL, FLAG_ENABLE_CHI_BURN, FLAG_ENABLE_CHI_BURN_BY_ORIGIN } from '../constants/one-split'
import { useMooniSwapPool } from '../data/Reserves'
import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, getMooniswapContract, getOneSplit, getRouterContract, isAddress, isUseOneSplitContract, shortenAddress } from '../utils'
import isZero from '../utils/isZero'
import v1SwapArguments from '../utils/v1SwapArguments'
import { wrappedMooniswapCurrencyAmount } from '../utils/wrappedCurrency'
import { useActiveWeb3React } from './index'
import { useV1ExchangeContract } from './useContract'
import useENS from './useENS'
import { Version } from './useToggledVersion'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

const bitwiseOrOnJSBI = (...items: JSBI[]): JSBI => {
  return items.reduce((acc, val) => {
    return JSBI.bitwiseOr(acc, val)
  }, JSBI.BigInt(0x0))
}

export type SwapCallback = null | (() => Promise<string>);
export type EstimateCallback = null | (() => Promise<Array<number | undefined> | undefined>);

export type useSwapResult = [
  boolean,
  SwapCallback,
  EstimateCallback
]

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true)

  return useMemo(() => {
    const tradeVersion = getTradeVersion(trade)
    if (!trade || !recipient || !library || !account || !tradeVersion || !chainId) return []

    const contract: Contract | null =
      tradeVersion === Version.v2 ? getRouterContract(chainId, library, account) : v1Exchange
    if (!contract) {
      return []
    }

    const swapMethods = []

    switch (tradeVersion) {
      case Version.v2:
        swapMethods.push(
          Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            ttl: deadline
          })
        )

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          swapMethods.push(
            Router.swapCallParameters(trade, {
              feeOnTransfer: true,
              allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
              recipient,
              ttl: deadline
            })
          )
        }
        break
      case Version.v1:
        swapMethods.push(
          v1SwapArguments(trade, {
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            ttl: deadline
          })
        )
        break
    }
    return swapMethods.map(parameters => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade, v1Exchange])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, deadline, recipientAddressOrName)

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    const tradeVersion = getTradeVersion(trade)

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(call => {
            const {
              parameters: { methodName, args, value },
              contract
            } = call
            const options = !value || isZero(value) ? {} : { value }

            return contract.estimateGas[methodName](...args, options)
              .then(gasEstimate => {
                return {
                  call,
                  gasEstimate
                }
              })
              .catch(gasError => {
                console.debug('Gas estimate failed, trying eth_call to extract error', call)

                return contract.callStatic[methodName](...args, options)
                  .then(result => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch(callError => {
                    console.debug('Call threw error', call, callError)
                    let errorMessage: string
                    switch (callError.reason) {
                      case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                        break
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
                    }
                    return { call, error: new Error(errorMessage) }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value }
          },
          gasEstimate
        } = successfulEstimation

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(value && !isZero(value) ? { value, from: account } : { from: account })
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = trade.outputAmount.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName)
                      : recipientAddressOrName
                  }`

            const withVersion =
              tradeVersion === Version.v2 ? withRecipient : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`

            addTransaction(response, {
              summary: withVersion
            })

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCalls, addTransaction])
}

// moniswap

export function useMooniSwap(
  chainId: number | undefined,
  fromAmount: TokenAmount | undefined,
  trade: Trade | undefined, // trade to execute, required
  distribution: BigNumber[] | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE // in bips
): useSwapResult {


  const isOneSplit = isUseOneSplitContract(distribution)
  // const [isChiApproved] = useIsChiApproved(chainId || 0)
  // const hasEnoughChi = useHasChi(MIN_CHI_BALANCE)

  // TODO: Get from storage as well
  const applyChi = false
  // const applyChi = !!(isOneSplit && (isChiApproved === ApprovalState.APPROVED) && hasEnoughChi)

  const estimate = useMooniSwapEstimateCallback(fromAmount, trade, distribution, allowedSlippage, isOneSplit)
  const swapCallback = useMooniSwapCallback(fromAmount, trade, distribution, allowedSlippage, isOneSplit,
    //applyChi
  )

  return [applyChi, swapCallback, estimate]
}

export function useMooniSwapEstimateCallback(
  fromAmount: TokenAmount | undefined,
  trade: Trade | undefined, // trade to execute, required
  distribution: BigNumber[] | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips,
  isOneSplit: boolean
): EstimateCallback {


  const { account, chainId, library } = useActiveWeb3React()
  const recipient = account

  const tradeVersion = getTradeVersion(trade)

  return useMemo(() => {

    if (!trade || !recipient || !library || !account || !tradeVersion || !chainId || !distribution || !fromAmount)
      return () => Promise.resolve(undefined)

    const contract: Contract | null = getOneSplit(chainId, library, account)
    if (!isOneSplit) {
      return () => Promise.resolve(undefined)
    }

    let value: BigNumber | undefined
    
    if (wrappedMooniswapCurrencyAmount(trade.inputAmount, chainId)?.token.symbol === 'ETH') {
      value = BigNumber.from(fromAmount.raw.toString())
    }

    const estimateWithFlags = (flags: JSBI): Promise<number | undefined> => {
      const args: any[] = [
        wrappedMooniswapCurrencyAmount(trade.inputAmount, chainId)?.token.address,
        wrappedMooniswapCurrencyAmount(trade.outputAmount, chainId)?.token.address,
        fromAmount?.raw.toString(),
        fromAmount.multiply(String(10000 - allowedSlippage)).divide(String(10000)).toFixed(0),
        distribution.map(x => x.toString()),
        //
        flags.toString()
      ]

      // estimate
      return contract.estimateGas['swap'](
        ...args,
        value && !value.isZero()
          ? { value, from: account }
          : { from: account }
      )
        .then((gas) => {
          const x = calculateGasMargin(gas)
          return x.toNumber()
        })
        .catch(error => {
          console.error(`estimateGas failed for ${'swap'}`, error)
          return undefined
        })
    }

    const flags = [
      FLAG_DISABLE_ALL_WRAP_SOURCES,
      FLAG_DISABLE_ALL_SPLIT_SOURCES,
      FLAG_DISABLE_MOONISWAP_ALL
    ]

    const regularFlags = bitwiseOrOnJSBI(...flags)

    const chiFlags = bitwiseOrOnJSBI(
      ...flags,
      ...[
        FLAG_ENABLE_CHI_BURN,
        FLAG_ENABLE_CHI_BURN_BY_ORIGIN
      ]
    )

    // console.log(`chi=`, chiFlags.toString(16));

    return () => {
      return Promise.all([
        estimateWithFlags(regularFlags),
        estimateWithFlags(chiFlags)
      ])
    }
  }, [
    trade,
    recipient,
    library,
    account,
    tradeVersion,
    chainId,
    allowedSlippage,
    distribution,
    fromAmount,
    isOneSplit])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useMooniSwapCallback(
  fromAmount: TokenAmount | undefined,
  trade: Trade | undefined, // trade to execute, required
  distribution: BigNumber[] | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips,
  isOneSplit: boolean,
  // TODO: should be taked into consideration
  //useChi: boolean | undefined
): SwapCallback {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const recipient = account

  const tradeVersion = getTradeVersion(trade)

  const poolAddress = useMooniSwapPool(wrappedMooniswapCurrencyAmount(trade?.inputAmount, chainId)?.token, wrappedMooniswapCurrencyAmount(trade?.outputAmount, chainId)?.token)

  // const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true)
  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !tradeVersion || !chainId || !distribution || !fromAmount) return null
    
    return async function onSwap() {

      const contract: Contract | null = isOneSplit
        ? getOneSplit(chainId, library, account)
        : getMooniswapContract(chainId, library, poolAddress, account)
      //trade.route.pairs[0].poolAddress

      if (!contract) {
        throw new Error('Failed to get a swap contract')
      }

      let value: BigNumber | undefined
      if (wrappedMooniswapCurrencyAmount(trade.inputAmount, chainId)?.token.symbol === 'ETH') {
        value = BigNumber.from(fromAmount.raw.toString())
      }

      const estimateSwap = (args: any[]) => {
        return contract.estimateGas['swap'](
          ...args,
          value && !value.isZero()
            ? { value, from: account }
            : { from: account }
        )
          .then((gas) => {
            const x = calculateGasMargin(gas)
            return x.toNumber()
          })
          .catch(error => {
            console.error(`estimateGas failed for ${'swap'}`, error)
            return undefined
          })
      }

      const onSuccess = (response: any): string => {
        const inputSymbol = wrappedMooniswapCurrencyAmount(trade.inputAmount, chainId)?.token.symbol
        const outputSymbol = wrappedMooniswapCurrencyAmount(trade.outputAmount, chainId)?.token.symbol
        const inputAmount = wrappedMooniswapCurrencyAmount(trade.inputAmount, chainId)?.toSignificant(3)
        const outputAmount = wrappedMooniswapCurrencyAmount(trade.outputAmount, chainId)?.toSignificant(3)

        const withRecipient = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`

        const withVersion =
          tradeVersion === Version.v2 ? withRecipient : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`

        addTransaction(response, {
          summary: withVersion
        })

        return response.hash
      }

      const onError = (error: any) => {
        // if the user rejected the tx, pass this along
        if (error?.code === 4001) {
          throw error
        }
        // otherwise, the error was unexpected and we need to convey that
        else {
          // console.error(`Swap failed`, error, 'swap', args, value)
          throw Error('An error occurred while swapping. Please contact support.')
        }
      }

      if (isOneSplit) {

        const flags = [
          FLAG_DISABLE_ALL_WRAP_SOURCES,
          FLAG_DISABLE_ALL_SPLIT_SOURCES,
          FLAG_DISABLE_MOONISWAP_ALL
        ]

        // First attempt to estimate when CHI is set
        const args = [
          wrappedMooniswapCurrencyAmount(trade.inputAmount, chainId)?.token.address,
          wrappedMooniswapCurrencyAmount(trade.outputAmount, chainId)?.token.address,
          fromAmount?.raw.toString(),
          fromAmount.multiply(String(10000 - allowedSlippage)).divide(String(10000)).toFixed(0),
          distribution.map(x => x.toString()),
          bitwiseOrOnJSBI(
            ...flags,
            FLAG_ENABLE_CHI_BURN,
            FLAG_ENABLE_CHI_BURN_BY_ORIGIN
          ).toString()
        ]

        return estimateSwap(args).then((result) => {

          if (!result) {
            // If we aren't then estimate without CHI, change args
            args[5] = bitwiseOrOnJSBI(...flags).toString()
            return estimateSwap(args).then((result) => {
                const gasLimit = calculateGasMargin(BigNumber.from(result))
                return contract['swap'](...args, {
                  gasLimit,
                  ...(value && !value.isZero() ? { value } : {})
                })
              })
              .then(onSuccess)
              .catch(onError)
          }
          else {
            // Estimate success witch CHI
            const gasLimit = calculateGasMargin(
              BigNumber.from(result)
            )

            // If we are good with CHI -> execute
            return contract['swap'](...args, {
              gasLimit,
              ...(value && !value.isZero() ? { value } : {})
            })
              .then(onSuccess)
              .catch(onError)
          }

        })

      } else {

        const minReturn = BigNumber.from(wrappedMooniswapCurrencyAmount(trade.outputAmount, chainId)?.raw.toString())
          .mul(String(10000 - allowedSlippage)).div(String(10000))

        const referalAddressStr = localStorage.getItem(REFERRAL_ADDRESS_STORAGE_KEY)
        let referalAddress = '0x68a17B587CAF4f9329f0e372e3A78D23A46De6b5'
        if (referalAddressStr && isAddress(referalAddressStr)) {
          referalAddress = getAddress(referalAddressStr)
        }

        const args = [
          wrappedMooniswapCurrencyAmount(trade.inputAmount, chainId)?.token.address,
          wrappedMooniswapCurrencyAmount(trade.outputAmount, chainId)?.token.address,
          fromAmount?.raw.toString(),
          minReturn.toString(),
          referalAddress
        ]

        return contract.estimateGas['swap'](...args, value && !value.isZero() ? { value } : {})
          .then((result) => {
            // if (BigNumber.isBigNumber(safeGasEstimate) && !BigNumber.isBigNumber(safeGasEstimate)) {
            //   throw new Error(
            //     'An error occurred. Please try raising your slippage. If that does not work, contact support.'
            //   )
            // }
            const gasLimit = calculateGasMargin(BigNumber.from(result))
            return contract['swap'](...args, {
              gasLimit,
              ...(value && !value.isZero() ? { value } : {})
            })
              .then(onSuccess)
              .catch(onError)
          })
          .catch(error => {
            console.error(`estimateGas failed for ${'swap'}`, error)
            return undefined
          })
      }

    }
  }, [
    trade,
    recipient,
    library,
    account,
    tradeVersion,
    chainId,
    allowedSlippage,
    addTransaction,
    distribution,
    fromAmount,
    isOneSplit,
    // useChi
  ])
}