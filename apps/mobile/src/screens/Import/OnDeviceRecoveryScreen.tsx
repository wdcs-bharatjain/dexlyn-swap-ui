import { NativeStackScreenProps } from '@react-navigation/native-stack'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { OnboardingStackParamList } from 'src/app/navigation/types'
import { Screen } from 'src/components/layout/Screen'
import {
  OnDeviceRecoveryWalletCard,
  OnDeviceRecoveryWalletCardLoader,
} from 'src/screens/Import/OnDeviceRecoveryWalletCard'
import { RecoveryWalletInfo } from 'src/screens/Import/useOnDeviceRecoveryData'
import { hideSplashScreen } from 'src/utils/splashScreen'
import { Flex, Image, Text, TouchableArea, useSporeColors } from 'ui/src'
import { UNISWAP_LOGO } from 'ui/src/assets'
import { PapersText } from 'ui/src/components/icons'
import { iconSizes } from 'ui/src/theme'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { ElementName, ModalName } from 'uniswap/src/features/telemetry/constants'
import { ImportType, OnboardingEntryPoint } from 'uniswap/src/types/onboarding'
import { OnboardingScreens } from 'uniswap/src/types/screens/mobile'
import { logger } from 'utilities/src/logger/logger'
import { useTimeout } from 'utilities/src/time/timing'
import { WarningModal } from 'wallet/src/components/modals/WarningModal/WarningModal'
import { useOnboardingContext } from 'wallet/src/features/onboarding/OnboardingContext'
import { WarningSeverity } from 'wallet/src/features/transactions/WarningModal/types'
import { Keyring } from 'wallet/src/features/wallet/Keyring/Keyring'
import { AccountType } from 'wallet/src/features/wallet/accounts/types'
import { setFinishedOnboarding } from 'wallet/src/features/wallet/slice'
import { useAppDispatch } from 'wallet/src/state'

type Props = NativeStackScreenProps<OnboardingStackParamList, OnboardingScreens.OnDeviceRecovery>

const LOADING_COUNT = 3

export function OnDeviceRecoveryScreen({
  navigation,
  route: {
    params: { mnemonicIds },
  },
}: Props): JSX.Element {
  const { t } = useTranslation()
  const colors = useSporeColors()
  const dispatch = useAppDispatch()
  const { finishOnboarding } = useOnboardingContext()

  const [selectedMnemonicId, setSelectedMnemonicId] = useState<string>()
  const [selectedRecoveryWalletInfos, setSelectedRecoveryWalletInfos] = useState<
    RecoveryWalletInfo[]
  >([])
  const [loadedWallets, setLoadedWallets] = useState(0)

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const onPressOtherWallet = async (): Promise<void> => {
    setSelectedMnemonicId(undefined)
    setSelectedRecoveryWalletInfos([])
    setShowConfirmationModal(true)
  }

  const clearNonSelectedStoredMnemonics = async (): Promise<void> => {
    await Promise.all(
      mnemonicIds.map(async (mnemonicId) => {
        if (mnemonicId !== selectedMnemonicId) {
          return Keyring.removeMnemonic(mnemonicId)
        }
      })
    )
  }

  const clearNonSelectedStoredAddresses = async (): Promise<void> => {
    const storedAddresses = await Keyring.getAddressesForStoredPrivateKeys()
    await Promise.all(
      storedAddresses.map((address) => {
        if (!selectedRecoveryWalletInfos.find((walletInfo) => walletInfo.address === address)) {
          return Keyring.removePrivateKey(address)
        }
      })
    )
  }

  const onPressClose = (): void => {
    setSelectedMnemonicId(undefined)
    setSelectedRecoveryWalletInfos([])
    setShowConfirmationModal(false)
  }

  const onPressConfirm = async (): Promise<void> => {
    await clearNonSelectedStoredMnemonics()
    await clearNonSelectedStoredAddresses()
    setShowConfirmationModal(false)

    if (selectedMnemonicId && selectedRecoveryWalletInfos.length) {
      await finishOnboarding(
        ImportType.OnDeviceRecovery,
        selectedRecoveryWalletInfos.map((walletInfo, index) => {
          return {
            type: AccountType.SignerMnemonic,
            mnemonicId: selectedMnemonicId,
            name: t('onboarding.wallet.defaultName', { number: index + 1 }),
            address: walletInfo.address,
            derivationIndex: walletInfo.derivationIndex,
            timeImportedMs: dayjs().valueOf(),
          }
        })
      )
      dispatch(setFinishedOnboarding({ finishedOnboarding: true }))
    } else {
      navigation.navigate(OnboardingScreens.Landing, {
        importType: ImportType.NotYetSelected,
        entryPoint: OnboardingEntryPoint.FreshInstallOrReplace,
      })
    }
  }

  //Hides lock screen on next js render cycle, ensuring this component is loaded when the screen is hidden
  useTimeout(hideSplashScreen, 1)

  const screenLoading = loadedWallets < mnemonicIds.length

  return (
    <Trace logImpression screen={OnboardingScreens.OnDeviceRecovery}>
      <Screen>
        <Flex grow p="$spacing24">
          <Flex alignItems="flex-start" gap="$spacing16">
            <Flex
              alignItems="center"
              backgroundColor="$accentSoft"
              borderRadius="$rounded8"
              justifyContent="center"
              p="$spacing4">
              <Image height={iconSizes.icon24} source={UNISWAP_LOGO} width={iconSizes.icon24} />
            </Flex>
            <Text variant="subheading1">{t('onboarding.import.onDeviceRecovery.title')}</Text>
            <Text color="$neutral2" variant="subheading2">
              {t('onboarding.import.onDeviceRecovery.subtitle')}
            </Text>
          </Flex>
          <ScrollView style={{ flex: 1, flexGrow: 1, flexShrink: 1, display: 'flex' }}>
            <Flex gap="$spacing12" justifyContent="flex-start" pt="$spacing28">
              {mnemonicIds.map((mnemonicId) => (
                <OnDeviceRecoveryWalletCard
                  key={mnemonicId}
                  mnemonicId={mnemonicId}
                  screenLoading={screenLoading}
                  onLoadComplete={() => {
                    setLoadedWallets((prev) => {
                      const loaded = prev + 1
                      logger.debug(
                        'OnDeviceRecoveryScreen',
                        'onLoadComplete',
                        `${loaded} of ${mnemonicIds.length} loaded`
                      )
                      return loaded
                    })
                  }}
                  onPressCard={(recoveryAddressesInfos) => {
                    setSelectedMnemonicId(mnemonicId)
                    setSelectedRecoveryWalletInfos(recoveryAddressesInfos)
                    setShowConfirmationModal(true)
                  }}
                  onPressViewRecoveryPhrase={() => {
                    navigation.navigate(OnboardingScreens.OnDeviceRecoveryViewSeedPhrase, {
                      mnemonicId,
                      importType: ImportType.OnDeviceRecovery,
                      entryPoint: OnboardingEntryPoint.FreshInstallOrReplace,
                    })
                  }}
                />
              ))}
              {screenLoading
                ? Array(LOADING_COUNT)
                    .fill(0)
                    .map((_, index) => (
                      <Flex key={`loading-${index}`}>
                        <OnDeviceRecoveryWalletCardLoader
                          index={index}
                          totalCount={LOADING_COUNT}
                        />
                      </Flex>
                    ))
                : null}
            </Flex>
          </ScrollView>

          <Flex justifyContent="flex-end">
            <Flex alignItems="center" gap="$spacing8" justifyContent="center">
              <Text color="$neutral3" variant="body3" onPress={onPressOtherWallet}>
                {t('onboarding.import.onDeviceRecovery.other_options.label')}
              </Text>
              <TouchableArea
                alignItems="center"
                hitSlop={16}
                mb="$spacing12"
                testID={ElementName.WatchWallet}>
                <Text color="$accent1" variant="buttonLabel3" onPress={onPressOtherWallet}>
                  {t('onboarding.import.onDeviceRecovery.other_options')}
                </Text>
              </TouchableArea>
            </Flex>
          </Flex>
        </Flex>
        {showConfirmationModal && (
          <WarningModal
            caption={t('onboarding.import.onDeviceRecovery.warning.caption')}
            closeText={t('common.button.back')}
            confirmText={t('common.button.continue')}
            icon={<PapersText color={colors.neutral1.get()} size="$icon.20" strokeWidth={1.5} />}
            modalName={ModalName.OnDeviceRecoveryConfirmation}
            severity={WarningSeverity.None}
            title={t('onboarding.import.onDeviceRecovery.warning.title')}
            onClose={onPressClose}
            onConfirm={onPressConfirm}
          />
        )}
      </Screen>
    </Trace>
  )
}
