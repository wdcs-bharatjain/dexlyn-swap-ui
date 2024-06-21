import { logger } from 'utilities/src/logger/logger'
import { isInterface } from 'utilities/src/platform'
/**
 * Feature flag names
 * These must match the Gate Key on Statsig
 */
export enum FeatureFlags {
  // Shared
  CurrencyConversion,

  // Wallet
  ExtensionOnboarding,
  FeedTab,
  ForAggregator,
  CexTransfers,
  LanguageSelection,
  MevBlocker,
  OptionalRouting,
  OnboardingKeyring,
  PlaystoreAppRating,
  PortionFields,
  RestoreWallet,
  Scantastic,
  SeedPhraseRefactorNative,
  SendRewrite,
  TransactionDetailsSheet,
  UnitagsDeviceAttestation,
  UwULink,
  UniswapX,

  // Web
  NavRefresh,
  NavigationHotkeys,
  Eip6936Enabled,
  ExitAnimation,
  ExtensionBetaLaunch,
  ExtensionGeneralLaunch,
  ForAggregatorWeb,
  GqlTokenLists,
  LimitsFees,
  MultichainUX,
  MultichainExplore,
  MultipleRoutingOptions,
  QuickRouteMainnet,
  Realtime,
  TraceJsonRpc,
  UniswapXSyntheticQuote,
  UniswapXv2,
  V2Everywhere,
  Zora,
  ZkSync,
  // TODO(WEB-3625): Remove these once we have a generalized system for outage banners.
  OutageBannerArbitrum,
  OutageBannerOptimism,
  OutageBannerPolygon,
}

export const WEB_FEATURE_FLAG_NAMES = new Map<FeatureFlags, string>([
  // Shared
  [FeatureFlags.CurrencyConversion, 'currency_conversion'],
  // Web Specific
  [FeatureFlags.NavRefresh, 'navigation_refresh'],
  [FeatureFlags.NavigationHotkeys, 'navigation_hotkeys'],
  [FeatureFlags.Eip6936Enabled, 'eip6963_enabled'],
  [FeatureFlags.ExitAnimation, 'exit_animation'],
  [FeatureFlags.ExtensionBetaLaunch, 'extension_beta_launch'],
  [FeatureFlags.ExtensionGeneralLaunch, 'extension_general_launch'],
  [FeatureFlags.GqlTokenLists, 'gql_token_lists'],
  [FeatureFlags.LimitsFees, 'limits_fees'],
  [FeatureFlags.MultichainUX, 'multichain_ux'],
  [FeatureFlags.MultichainExplore, 'multichain_explore'],
  [FeatureFlags.MultipleRoutingOptions, 'multiple_routing_options'],
  [FeatureFlags.QuickRouteMainnet, 'enable_quick_route_mainnet'],
  [FeatureFlags.Realtime, 'realtime'],
  [FeatureFlags.TraceJsonRpc, 'traceJsonRpc'],
  [FeatureFlags.UniswapXSyntheticQuote, 'uniswapx_synthetic_quote'],
  [FeatureFlags.UniswapXv2, 'uniswapx_v2'],
  [FeatureFlags.V2Everywhere, 'v2_everywhere'],
  [FeatureFlags.Zora, 'zora'],
  [FeatureFlags.ZkSync, 'zksync'],
  [FeatureFlags.ForAggregatorWeb, 'for_aggregator_web'],
  // TODO(WEB-3625): Remove these once we have a generalized system for outage banners.
  [FeatureFlags.OutageBannerArbitrum, 'outage_banner_feb_2024_arbitrum'],
  [FeatureFlags.OutageBannerOptimism, 'outage_banner_feb_2024_optimism'],
  [FeatureFlags.OutageBannerPolygon, 'outage_banner_feb_2024_polygon'],
])

export const WALLET_FEATURE_FLAG_NAMES = new Map<FeatureFlags, string>([
  // Shared
  [FeatureFlags.CurrencyConversion, 'currency_conversion'],
  // Wallet Specific
  [FeatureFlags.ExtensionOnboarding, 'extension-onboarding'],
  [FeatureFlags.FeedTab, 'feed-tab'],
  [FeatureFlags.ForAggregator, 'for-aggregator'],
  [FeatureFlags.CexTransfers, 'cex-transfers'],
  [FeatureFlags.LanguageSelection, 'language-selection'],
  [FeatureFlags.MevBlocker, 'mev-blocker'],
  [FeatureFlags.OptionalRouting, 'optional-routing'],
  [FeatureFlags.OnboardingKeyring, 'onboarding-keyring'],
  [FeatureFlags.PlaystoreAppRating, 'playstore-app-rating'],
  [FeatureFlags.PortionFields, 'portion-fields'],
  [FeatureFlags.RestoreWallet, 'restore-wallet'],
  [FeatureFlags.Scantastic, 'scantastic'],
  [FeatureFlags.SeedPhraseRefactorNative, 'refactor-seed-phrase-native'],
  [FeatureFlags.SendRewrite, 'send-rewrite'],
  [FeatureFlags.TransactionDetailsSheet, 'transaction-details-sheet'],
  [FeatureFlags.UnitagsDeviceAttestation, 'unitags-device-attestation'],
  [FeatureFlags.UwULink, 'uwu-link'],
  [FeatureFlags.UniswapX, 'uniswapx'],
])

export enum FeatureFlagClient {
  Web,
  Wallet,
}

const FEATURE_FLAG_NAMES = {
  [FeatureFlagClient.Web]: WEB_FEATURE_FLAG_NAMES,
  [FeatureFlagClient.Wallet]: WALLET_FEATURE_FLAG_NAMES,
}

export function getFeatureFlagName(flag: FeatureFlags, client?: FeatureFlagClient): string {
  const names =
    client !== undefined
      ? FEATURE_FLAG_NAMES[client]
      : isInterface
      ? WEB_FEATURE_FLAG_NAMES
      : WALLET_FEATURE_FLAG_NAMES
  const name = names.get(flag)
  if (!name) {
    const err = new Error(
      `Feature ${FeatureFlags[flag]} does not have a name mapped for this application`
    )

    logger.error(err, {
      tags: {
        file: 'flags.ts',
        function: 'getFeatureFlagName',
      },
    })

    throw err
  }

  return name
}
