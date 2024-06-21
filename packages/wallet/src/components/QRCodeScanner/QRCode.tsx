import { memo, useMemo } from 'react'
import { ImageSourcePropType } from 'react-native'
import {
  ColorTokens,
  Flex,
  getUniconColors,
  passesContrast,
  useExtractedColors,
  useIsDarkMode,
  useSporeColors,
} from 'ui/src'
import { borderRadii } from 'ui/src/theme'
import QRCode from 'wallet/src/components/QRCodeScanner/custom-qr-code-generator'
import { AccountIcon } from 'wallet/src/components/accounts/AccountIcon'
import { useAvatar } from 'wallet/src/features/wallet/hooks'

type AvatarColors = {
  primary: string
  base: string
  detail: string
}

type ColorProps = {
  smartColor: string
  gradientProps: {
    enableLinearGradient?: boolean
    linearGradient?: string[]
    gradientDirection?: string[]
    color?: string
  }
}

const useColorProps = (address: Address): ColorProps => {
  const colors = useSporeColors()
  const isDarkMode = useIsDarkMode()
  const { color: uniconColor } = getUniconColors(address, isDarkMode) as { color: string }
  const { avatar, loading: avatarLoading } = useAvatar(address)
  const { colors: avatarColors } = useExtractedColors(avatar) as { colors: AvatarColors }
  const hasAvatar = !!avatar && !avatarLoading

  const smartColor: string = useMemo<string>(() => {
    const contrastThreshold = 3 // WCAG AA standard for contrast
    const backgroundColor = colors.surface2.val // replace with your actual background color

    if (hasAvatar && avatarColors && avatarColors.primary) {
      if (passesContrast(avatarColors.primary, backgroundColor, contrastThreshold)) {
        return avatarColors.primary
      }
      if (passesContrast(avatarColors.base, backgroundColor, contrastThreshold)) {
        return avatarColors.base
      }
      if (passesContrast(avatarColors.detail, backgroundColor, contrastThreshold)) {
        return avatarColors.detail
      }
      // Modify the color if it doesn't pass the contrast check
      // Replace 'modifiedColor' with the actual color you want to use
      return colors.neutral1.val as string
    }
    return uniconColor
  }, [avatarColors, hasAvatar, uniconColor, colors.surface2.val, colors.neutral1.val])

  return { smartColor, gradientProps: {} }
}

type AddressQRCodeProps = {
  address: Address
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  size: number
  backgroundColor?: ColorTokens
  color?: string
  safeAreaSize?: number
  safeAreaColor?: ColorTokens
}

export const AddressQRCode = ({
  address,
  errorCorrectionLevel,
  size,
  backgroundColor = '$surface1',
  color,
  safeAreaSize,
  safeAreaColor,
}: AddressQRCodeProps): JSX.Element => {
  const backgroundColorValue = backgroundColor
  const { gradientProps } = useColorProps(address)
  const colors = useSporeColors()

  const safeAreaProps = useMemo(() => {
    let safeAreaPropsObject: {
      logoSize?: number
      logoMargin?: number
      logo?: ImageSourcePropType
      logoBackgroundColor?: string
      logoBorderRadius?: number
    } = {}

    if (safeAreaSize && safeAreaColor) {
      safeAreaPropsObject = {
        logoSize: safeAreaSize,
        logo: { uri: '' },
        // this could eventually be set to an SVG version of the Unicon which would ensure it's perfectly centered, but for now we can just use an empty logo image to create a blank circle in the middle of the QR code
        logoBackgroundColor: colors.surface1.val,
        logoBorderRadius: borderRadii.roundedFull,
        // note: this QR code library doesn't actually create a 'safe' space in the middle, it just adds the logo on top, so that's why ecl is set to H (high error correction level) by default to ensure the QR code is still readable even if the middle of the QR code is partially obscured
      }
    }
    return safeAreaPropsObject
  }, [safeAreaSize, safeAreaColor, colors])

  return (
    <QRCode
      backgroundColor={backgroundColorValue}
      color={color}
      ecl={errorCorrectionLevel}
      overlayColor={colors.neutral1.val}
      {...safeAreaProps}
      {...gradientProps}
      size={size}
      value={address}
    />
  )
}

type QRCodeDisplayProps = {
  address: Address
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  size: number
  backgroundColor?: ColorTokens
  containerBackgroundColor?: ColorTokens
  overlayColor?: ColorTokens
  safeAreaColor?: ColorTokens
  logoSize?: number
  hideOutline?: boolean
  displayShadow?: boolean
}

const _QRCodeDisplay = ({
  address,
  errorCorrectionLevel = 'H',
  size,
  containerBackgroundColor,
  logoSize = 32,
  safeAreaColor,
  hideOutline = false,
  displayShadow = false,
}: QRCodeDisplayProps): JSX.Element => {
  const { avatar } = useAvatar(address)
  const { smartColor } = useColorProps(address)

  return (
    <Flex
      alignItems="center"
      backgroundColor={containerBackgroundColor}
      borderColor="$surface3"
      borderRadius="$rounded32"
      borderWidth={hideOutline ? 0 : 1}
      justifyContent="center"
      position="relative"
      shadowColor={displayShadow ? '$sporeBlack' : 'transparent'}
      shadowOffset={{ width: 0, height: 16 }}
      shadowOpacity={displayShadow ? 0.1 : 0}
      shadowRadius={16}>
      <AddressQRCode
        address={address}
        backgroundColor={containerBackgroundColor}
        color={smartColor}
        errorCorrectionLevel={errorCorrectionLevel}
        safeAreaColor={safeAreaColor}
        safeAreaSize={logoSize}
        size={size}
      />
      <Flex
        alignItems="center"
        backgroundColor="$transparent"
        borderRadius="$roundedFull"
        overflow="visible"
        pl="$spacing2"
        position="absolute"
        pt="$spacing2">
        <AccountIcon
          address={address}
          avatarUri={avatar}
          borderColor="$surface1"
          borderWidth={4}
          showBackground={true}
          showBorder={true}
          size={logoSize}
        />
      </Flex>
    </Flex>
  )
}

export const QRCodeDisplay = memo(_QRCodeDisplay)
