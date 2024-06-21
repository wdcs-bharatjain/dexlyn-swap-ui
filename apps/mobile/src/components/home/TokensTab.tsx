import { useStartProfiler } from '@shopify/react-native-performance'
import React, { forwardRef, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { useAppDispatch } from 'src/app/hooks'
import { TokenBalanceList } from 'src/components/TokenBalanceList/TokenBalanceList'
import { useTokenDetailsNavigation } from 'src/components/TokenDetails/hooks'
import { TabContentProps, TabProps } from 'src/components/layout/TabHelpers'
import { openModal } from 'src/features/modals/modalSlice'
import { Flex } from 'ui/src'
import { NoTokens } from 'ui/src/components/icons'
import { GQLQueries } from 'uniswap/src/data/graphql/uniswap-data-api/queries'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { ModalName } from 'uniswap/src/features/telemetry/constants'
import { CurrencyId } from 'uniswap/src/types/currency'
import { MobileScreens } from 'uniswap/src/types/screens/mobile'
import { BaseCard } from 'wallet/src/components/BaseCard/BaseCard'
import { ScannerModalState } from 'wallet/src/components/QRCodeScanner/constants'
import { useCexTransferProviders } from 'wallet/src/features/fiatOnRamp/api'
import { PortfolioEmptyState } from 'wallet/src/features/portfolio/PortfolioEmptyState'
import { TokenBalanceListRow } from 'wallet/src/features/portfolio/TokenBalanceListContext'

export const TOKENS_TAB_DATA_DEPENDENCIES = [GQLQueries.PortfolioBalances]

// ignore ref type

export const TokensTab = memo(
  forwardRef<FlatList<TokenBalanceListRow>, TabProps & { isExternalProfile?: boolean }>(
    function _TokensTab(
      {
        owner,
        containerProps,
        scrollHandler,
        isExternalProfile = false,
        renderedInModal = false,
        onRefresh,
        refreshing,
        headerHeight,
      },
      ref
    ) {
      const { t } = useTranslation()
      const dispatch = useAppDispatch()
      const tokenDetailsNavigation = useTokenDetailsNavigation()
      const startProfilerTimer = useStartProfiler()
      const forAggregatorEnabled = useFeatureFlag(FeatureFlags.ForAggregator)
      const cexTransferEnabled = useFeatureFlag(FeatureFlags.CexTransfers)
      const cexTransferProviders = useCexTransferProviders(cexTransferEnabled)

      const onPressToken = useCallback(
        (currencyId: CurrencyId): void => {
          startProfilerTimer({ source: MobileScreens.Home })
          tokenDetailsNavigation.navigate(currencyId)
        },
        [startProfilerTimer, tokenDetailsNavigation]
      )

      // Update list empty styling based on which empty state is used
      const formattedContainerProps: TabContentProps | undefined = useMemo(() => {
        if (!containerProps) {
          return undefined
        }
        if (!isExternalProfile) {
          return { ...containerProps, emptyContainerStyle: {} }
        }
        return containerProps
      }, [containerProps, isExternalProfile])

      const onPressAction = useCallback((): void => {
        dispatch(
          openModal({ name: ModalName.WalletConnectScan, initialState: ScannerModalState.WalletQr })
        )
      }, [dispatch])

      const onPressBuy = useCallback(() => {
        dispatch(
          openModal({
            name: forAggregatorEnabled ? ModalName.FiatOnRampAggregator : ModalName.FiatOnRamp,
          })
        )
      }, [dispatch, forAggregatorEnabled])

      const onPressReceive = useCallback(() => {
        dispatch(
          openModal(
            cexTransferProviders.length > 0
              ? {
                  name: ModalName.ReceiveCryptoModal,
                  initialState: cexTransferProviders,
                }
              : {
                  name: ModalName.WalletConnectScan,
                  initialState: ScannerModalState.WalletQr,
                }
          )
        )
      }, [cexTransferProviders, dispatch])

      const onPressImport = useCallback(() => {
        dispatch(openModal({ name: ModalName.AccountSwitcher }))
      }, [dispatch])

      const renderEmpty = useMemo((): JSX.Element => {
        // Show different empty state on external profile pages
        return isExternalProfile ? (
          <BaseCard.EmptyState
            description={t('home.tokens.empty.description')}
            icon={<NoTokens color="$neutral3" size="$icon.70" />}
            title={t('home.tokens.empty.title')}
            onPress={onPressAction}
          />
        ) : (
          <PortfolioEmptyState
            onPressBuy={onPressBuy}
            onPressImport={onPressImport}
            onPressReceive={onPressReceive}
          />
        )
      }, [isExternalProfile, onPressAction, onPressBuy, onPressImport, onPressReceive, t])

      return (
        <Flex grow backgroundColor="$surface1">
          <TokenBalanceList
            ref={ref}
            containerProps={formattedContainerProps}
            empty={renderEmpty}
            headerHeight={headerHeight}
            isExternalProfile={isExternalProfile}
            owner={owner}
            refreshing={refreshing}
            renderedInModal={renderedInModal}
            scrollHandler={scrollHandler}
            onPressToken={onPressToken}
            onRefresh={onRefresh}
          />
        </Flex>
      )
    }
  )
)
