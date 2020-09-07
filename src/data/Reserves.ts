import { TokenAmount, Pair, Currency, Token, ChainId } from '@uniswap/sdk'
import { useMemo } from 'react'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { V1_MOONISWAP_FACTORY_ADDRESSES } from '../constants/v1-mooniswap'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '../hooks'
import { useMultipleContractSingleData, useSingleContractMultipleData } from '../state/multicall/hooks'
import { useMooniswapV1HelperContract } from '../hooks/useContract'
import { wrappedCurrency } from '../utils/wrappedCurrency'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export class MockMooniSwapPair extends Pair {
  public readonly liquidityToken: Token
  public readonly poolAddress: string

  constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount, poolAddress: string) {
    super(tokenAmountA, tokenAmountB)
    const [amount0, amount1] = tokenAmountA.token.sortsBefore(tokenAmountB.token)
        ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA]
    this.liquidityToken = new Token(
        amount0.token.chainId,
        poolAddress,
        18,
        'MOON-V1-' + amount0.token.symbol + '-' + amount1.token.symbol,
        'Mooniswap V1 (' + amount0.token.symbol + '-' + amount1.token.symbol + ')'
    )
    this.poolAddress = poolAddress
  }

  public involvesToken(token: Token): boolean {
    const ETHER = new Token(ChainId.MAINNET, ZERO_ADDRESS, 18, 'ETH', 'Ethereum')
    return token.equals(this.token0) || token.equals(this.token1) || ETHER.equals(this.token0)|| ETHER.equals(this.token1)
  }
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const { chainId } = useActiveWeb3React()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId)
      ]),
    [chainId, currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens]
  )

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString()))
      ]
    })
  }, [results, tokens])
}

export function useMooniSwapPairs(currencies: [Token | undefined, Token | undefined][]): [PairState, MockMooniSwapPair | null][] {
  const { chainId } = useActiveWeb3React()

  const tokenAList: string[] = []
  const tokenBList: string[] = []
  const allTokenAList: (Token | undefined)[] = []
  const allTokenBList: (Token | undefined)[] = []
  for (let i = 0; i < currencies.length; i++) {
    const [tokenA, tokenB] = currencies[i]
    allTokenAList.push(tokenA)
    allTokenBList.push(tokenB)
    if (!tokenA || !tokenB) continue
    if (tokenA.equals(tokenB)) continue
    tokenAList.push(tokenA.address)
    tokenBList.push(tokenB.address)
  }

  const pairsPerReq = 50;
  const batches = Math.ceil(tokenAList.length / pairsPerReq);
  const callDataList = [];
  for (let i = 0; i < batches; i++) {
    const inputs = [
      V1_MOONISWAP_FACTORY_ADDRESSES[chainId || 1],
      tokenAList.splice(0, pairsPerReq),
      tokenBList.splice(0, pairsPerReq)
    ]
    callDataList.push(inputs)
  }

  const res = useSingleContractMultipleData(useMooniswapV1HelperContract(), 'getPoolDataList', callDataList);

  return useMemo(() => {
    // if (res.findIndex((x) => x.loading) !== -1) return [[PairState.LOADING, null]]

    const poolDataList = res.map((x) => x.result?.[0])?.flat() || [];
    let counter = 0

    const pairStates: [PairState, MockMooniSwapPair | null][] = []
    for (let i = 0; i < poolDataList.length; i++) {


      const tokenA = allTokenAList[i]
      const tokenB = allTokenBList[i]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) {
        pairStates.push([PairState.INVALID, null])
        continue
      }

      const poolData = poolDataList?.[counter]
      counter++
      if (!poolData) {
        pairStates.push([PairState.LOADING, null])
        continue
      }

      const poolAddress = poolData.pool
      if (poolAddress === ZERO_ADDRESS) {
        pairStates.push([PairState.NOT_EXISTS, null])
        continue
      }

      pairStates.push([
        PairState.EXISTS,
        new MockMooniSwapPair(
          new TokenAmount(tokenA, poolData.balanceA.toString()),
          new TokenAmount(tokenB, poolData.balanceB.toString()),
          poolAddress
        )
      ])
    }
    return pairStates.length !== 0 ? pairStates : [[PairState.LOADING, null]]
  }, [res, allTokenAList, allTokenBList])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0]
}

export function useMooniSwapPair(tokenA?: Token, tokenB?: Token): [PairState, MockMooniSwapPair | null] {
  return useMooniSwapPairs([[tokenA, tokenB]])[0]
}

export function useMooniSwapPool(tokenA?: Token, tokenB?: Token): string {
  return useMooniSwapPoolAddress([[tokenA, tokenB]])
}

export function useMooniSwapPoolAddress(currencies: [Token | undefined, Token | undefined][]): string {
  const { chainId } = useActiveWeb3React()

  const tokenAList: string[] = []
  const tokenBList: string[] = []
  const allTokenAList: (Token | undefined)[] = []
  const allTokenBList: (Token | undefined)[] = []
  let poolAddress: string = ''
  for (let i = 0; i < currencies.length; i++) {
    const [tokenA, tokenB] = currencies[i]
    allTokenAList.push(tokenA)
    allTokenBList.push(tokenB)
    if (!tokenA || !tokenB) continue
    if (tokenA.equals(tokenB)) continue
    tokenAList.push(tokenA.address)
    tokenBList.push(tokenB.address)
  }

  const pairsPerReq = 50;
  const batches = Math.ceil(tokenAList.length / pairsPerReq);
  const callDataList = [];
  for (let i = 0; i < batches; i++) {
    const inputs = [
      V1_MOONISWAP_FACTORY_ADDRESSES[chainId || 1],
      tokenAList.splice(0, pairsPerReq),
      tokenBList.splice(0, pairsPerReq)
    ]
    callDataList.push(inputs)
  }

  const res = useSingleContractMultipleData(useMooniswapV1HelperContract(), 'getPoolDataList', callDataList);

  return useMemo(() => {
    // if (res.findIndex((x) => x.loading) !== -1) return [[PairState.LOADING, null]]

    const poolDataList = res.map((x) => x.result?.[0])?.flat() || [];
    let counter = 0

    const pairStates: [PairState, Pair | null][] = []
    for (let i = 0; i < poolDataList.length; i++) {


      const tokenA = allTokenAList[i]
      const tokenB = allTokenBList[i]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) {
        pairStates.push([PairState.INVALID, null])
        continue
      }

      const poolData = poolDataList?.[counter]
      counter++
      if (!poolData) {
        pairStates.push([PairState.LOADING, null])
        continue
      }

      poolAddress = poolData.pool
      if (poolAddress === ZERO_ADDRESS) {
        pairStates.push([PairState.NOT_EXISTS, null])
        continue
      }
    }
    return poolAddress
  }, [res, allTokenAList, allTokenBList])
}
