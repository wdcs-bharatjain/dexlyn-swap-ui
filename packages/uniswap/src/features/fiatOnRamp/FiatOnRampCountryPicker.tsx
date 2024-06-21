import { Flex, TouchableArea, UniversalImage } from 'ui/src'
import { RotatableChevron } from 'ui/src/components/icons/RotatableChevron'
import { iconSizes } from 'ui/src/theme'
import { getCountryFlagSvgUrl } from 'uniswap/src/features/fiatOnRamp/utils'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { ElementName } from 'uniswap/src/features/telemetry/constants'

const ICON_SIZE = iconSizes.icon16

export function FiatOnRampCountryPicker({
  onPress,
  countryCode,
}: {
  onPress: () => void
  countryCode: Maybe<string>
}): JSX.Element | null {
  if (!countryCode) {
    return null
  }

  const countryFlagUrl = getCountryFlagSvgUrl(countryCode)

  return (
    <Trace logPress element={ElementName.FiatOnRampCountryPicker}>
      <TouchableArea
        hapticFeedback
        backgroundColor="$surface3"
        borderRadius="$roundedFull"
        overflow="hidden"
        pl="$spacing8"
        pr="$spacing4"
        py="$spacing2"
        onPress={onPress}>
        <Flex row shrink alignItems="center" flex={0} gap="$spacing2">
          <Flex borderRadius="$roundedFull" overflow="hidden">
            <UniversalImage
              size={{
                height: ICON_SIZE,
                width: ICON_SIZE,
              }}
              uri={countryFlagUrl}
            />
          </Flex>
          <RotatableChevron color="$neutral3" direction="down" width={iconSizes.icon20} />
        </Flex>
      </TouchableArea>
    </Trace>
  )
}
