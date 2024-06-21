import React from 'react'
import { Image, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { Flex, useIsDarkMode } from 'ui/src'
import { UNISWAP_LOGO_LARGE } from 'ui/src/assets'
import { useDeviceDimensions } from 'ui/src/hooks/useDeviceDimensions'
import { isAndroid } from 'utilities/src/platform'

export const SPLASH_SCREEN = { uri: 'SplashScreen' }

export function SplashScreen({ style }: { style?: StyleProp<ViewStyle> }): JSX.Element {
  const dimensions = useDeviceDimensions()
  const isDarkMode = useIsDarkMode()

  return (
    <Flex
      alignItems="center"
      backgroundColor={isDarkMode ? '$surface1' : '$sporeWhite'}
      justifyContent={isAndroid ? 'center' : undefined}
      pointerEvents="none"
      style={style}>
      {/* Android has a different implementation, which is not set in stone yet, so skipping it for now */}
      {isAndroid ? (
        <Image source={UNISWAP_LOGO_LARGE} style={fixedStyle.logoStyle} />
      ) : (
        <Image
          resizeMode="contain"
          source={SPLASH_SCREEN}
          style={{
            width: dimensions.fullWidth,
            height: dimensions.fullHeight,
          }}
        />
      )}
    </Flex>
  )
}

const fixedStyle = StyleSheet.create({
  logoStyle: {
    height: 180,
    width: 165,
  },
})
