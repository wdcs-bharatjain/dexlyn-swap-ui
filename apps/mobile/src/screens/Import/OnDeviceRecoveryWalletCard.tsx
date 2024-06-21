import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ViewProps } from 'react-native'
import {
  RecoveryWalletInfo,
  useOnDeviceRecoveryData,
} from 'src/screens/Import/useOnDeviceRecoveryData'
import { Button, Flex, FlexProps, Loader, Text, TouchableArea } from 'ui/src'
import { fonts, iconSizes } from 'ui/src/theme'
import { NumberType } from 'utilities/src/format/types'
import { AccountIcon } from 'wallet/src/components/accounts/AccountIcon'
import { AddressDisplay } from 'wallet/src/components/accounts/AddressDisplay'
import { useLocalizationContext } from 'wallet/src/features/language/LocalizationContext'

const cardProps: FlexProps & ViewProps = {
  borderRadius: '$rounded20',
  shadowColor: '$surface3',
  shadowOpacity: 0.04,
  shadowRadius: 10,
}

export function OnDeviceRecoveryWalletCard({
  mnemonicId,
  screenLoading,
  onLoadComplete,
  onPressCard,
  onPressViewRecoveryPhrase,
}: {
  mnemonicId: string
  screenLoading: boolean
  onLoadComplete: () => void
  onPressCard: (walletInfos: RecoveryWalletInfo[]) => void
  onPressViewRecoveryPhrase: () => void
}): JSX.Element | null {
  const { t } = useTranslation()
  const { convertFiatAmountFormatted } = useLocalizationContext()

  const {
    significantRecoveryWalletInfos: significantRecoveryWalletInfos,
    totalBalance,
    loading,
  } = useOnDeviceRecoveryData(mnemonicId)

  useEffect(() => {
    if (!loading && screenLoading) {
      onLoadComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, screenLoading])

  const firstWalletInfo = significantRecoveryWalletInfos[0]
  const remainingWalletCount = significantRecoveryWalletInfos.length - 1

  if (screenLoading || !firstWalletInfo) {
    return null
  }

  return (
    <TouchableArea onPress={() => onPressCard(significantRecoveryWalletInfos)}>
      <Flex
        {...cardProps}
        centered
        backgroundColor="$surface1"
        borderColor="$surface2"
        borderWidth={1}
        gap="$spacing16"
        p="$spacing12">
        <Flex centered row gap="$spacing12">
          <AccountIcon address={firstWalletInfo.address} size={iconSizes.icon36} />
          <Flex fill py={!remainingWalletCount ? fonts.body3.lineHeight / 2 : undefined}>
            <AddressDisplay
              address={firstWalletInfo.address}
              hideAddressInSubtitle={true}
              showAccountIcon={false}
              size={iconSizes.icon36}
              variant="subheading1"
            />
            {remainingWalletCount ? (
              <Text color="$neutral3" variant="body3">
                {t('onboarding.import.onDeviceRecovery.wallet.count', {
                  count: remainingWalletCount,
                })}
              </Text>
            ) : undefined}
          </Flex>

          <Text color="$neutral2" variant="body2">
            {convertFiatAmountFormatted(totalBalance, NumberType.PortfolioBalance)}
          </Text>
        </Flex>

        <Button
          px="$spacing12"
          py="$spacing8"
          theme="secondary"
          width="100%"
          onPress={() => onPressViewRecoveryPhrase()}>
          <Text color="$neutral2" variant="buttonLabel4">
            {t('onboarding.import.onDeviceRecovery.wallet.button')}
          </Text>
        </Button>
      </Flex>
    </TouchableArea>
  )
}

const LOADING_MIN_OPACITY_SUBTRACT = 0.8

export function OnDeviceRecoveryWalletCardLoader({
  index,
  totalCount,
}: {
  index: number
  totalCount: number
}): JSX.Element {
  return (
    <Loader.Box
      height={120}
      opacity={1 - (LOADING_MIN_OPACITY_SUBTRACT * (index + 1)) / totalCount}
      {...cardProps}
    />
  )
}
