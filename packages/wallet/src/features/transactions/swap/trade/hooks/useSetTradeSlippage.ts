import { useMemo } from 'react'
import { DynamicConfigs } from 'uniswap/src/features/gating/configs'
import { useDynamicConfig } from 'uniswap/src/features/gating/hooks'
import {
  MAX_AUTO_SLIPPAGE_TOLERANCE,
  MIN_AUTO_SLIPPAGE_TOLERANCE,
} from 'wallet/src/constants/transactions'
import { isL2Chain, toSupportedChainId } from 'wallet/src/features/chains/utils'
import { useUSDCValue } from 'wallet/src/features/transactions/swap/trade/hooks/useUSDCPrice'
import {
  getClassicQuoteFromResponse,
  transformTradingApiResponseToTrade,
} from 'wallet/src/features/transactions/swap/trade/tradingApi/utils'
import { Trade, TradeWithStatus } from 'wallet/src/features/transactions/swap/trade/types'

export function useSetTradeSlippage(
  trade: TradeWithStatus,
  userSetSlippage?: number
): { trade: TradeWithStatus; autoSlippageTolerance: number } {
  // Always calculate and return autoSlippageTolerance so the UI can warn user when custom slippage is set higher than auto slippage
  const autoSlippageTolerance = useCalculateAutoSlippage(trade?.trade)

  return useMemo(() => {
    // If the user has set a custom slippage, use that in the trade instead of the auto-slippage
    if (!trade.trade || userSetSlippage) {
      return { trade, autoSlippageTolerance }
    }

    const { loading, error, isFetching } = trade
    const { tradeType, deadline, quote, inputAmount, outputAmount } = trade.trade

    if (!quote) {
      return { trade, autoSlippageTolerance }
    }

    const newTrade = transformTradingApiResponseToTrade({
      currencyIn: inputAmount.currency,
      currencyOut: outputAmount.currency,
      tradeType,
      deadline,
      slippageTolerance: autoSlippageTolerance,
      data: quote,
    })

    return {
      trade: {
        trade: newTrade,
        loading,
        error,
        isFetching,
      },
      autoSlippageTolerance,
    }
  }, [trade, userSetSlippage, autoSlippageTolerance])
}

/*
  Based on: https://github.com/Uniswap/interface/blob/1802f50163bf8092dac6916d64b9e08ac2ae0a74/src/hooks/useAutoSlippageTolerance.ts

  The rationale is the user will be happy so long as the expected "cost" of the slippage is less than
  theoretical cost incurred if the tx were to fail due to slippage being set too conservatively. Therefore,
  slippage is set to be (gas cost in $'s) / (expected swap output value in $'s).

  Note: not using BigNumber because it sucks at decimals and we're dealing with USD values anyways
 */
function useCalculateAutoSlippage(trade: Maybe<Trade>): number {
  const outputAmountUSD = useUSDCValue(trade?.outputAmount)?.toExact()

  const minAutoSlippageToleranceL2 = useSlippageValueFromDynamicConfig(
    SlippageConfigName.MinAutoSlippageToleranceL2
  )

  return useMemo<number>(() => {
    const quote = getClassicQuoteFromResponse(trade?.quote)
    const chainId = toSupportedChainId(quote?.chainId) ?? undefined
    const onL2 = isL2Chain(chainId)
    const gasCostUSD = quote?.gasFeeUSD
    return calculateAutoSlippage({
      onL2,
      minAutoSlippageToleranceL2,
      gasCostUSD,
      outputAmountUSD,
    })
  }, [minAutoSlippageToleranceL2, outputAmountUSD, trade])
}

function calculateAutoSlippage({
  onL2,
  minAutoSlippageToleranceL2,
  gasCostUSD,
  outputAmountUSD,
}: {
  onL2: boolean
  minAutoSlippageToleranceL2: number
  gasCostUSD?: string
  outputAmountUSD?: string
}): number {
  if (onL2) {
    return minAutoSlippageToleranceL2
  }

  if (!gasCostUSD || !outputAmountUSD) {
    return MIN_AUTO_SLIPPAGE_TOLERANCE
  }

  const suggestedSlippageTolerance = (Number(gasCostUSD) / Number(outputAmountUSD)) * 100

  if (suggestedSlippageTolerance > MAX_AUTO_SLIPPAGE_TOLERANCE) {
    return MAX_AUTO_SLIPPAGE_TOLERANCE
  }

  if (suggestedSlippageTolerance < MIN_AUTO_SLIPPAGE_TOLERANCE) {
    return MIN_AUTO_SLIPPAGE_TOLERANCE
  }

  return Number(suggestedSlippageTolerance.toFixed(2))
}

enum SlippageConfigName {
  MinAutoSlippageToleranceL2,
}

// Allows us to type the values stored in the JSON dynamic config object for slippage params.
// Names in mapping should exatcly match the JSON object in statsig.
export const SLIPPAGE_CONFIG_NAMES = new Map<SlippageConfigName, string>([
  [SlippageConfigName.MinAutoSlippageToleranceL2, 'minAutoSlippageToleranceL2'],
])

function useSlippageValueFromDynamicConfig(configName: SlippageConfigName): number {
  const slippageConfig = useDynamicConfig(DynamicConfigs.Slippage)

  const slippageValue = slippageConfig.getValue(SLIPPAGE_CONFIG_NAMES.get(configName)) as string

  // Format as % number
  return parseInt(slippageValue, 10)
}
