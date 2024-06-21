import { useCallback, useRef, useState } from 'react'
import { LayoutChangeEvent } from 'react-native'
import { InputWithSuffixProps } from 'src/features/import/InputWIthSuffixProps'
import { Flex } from 'ui/src'
import { ElementName } from 'uniswap/src/features/telemetry/constants'
import { isIOS } from 'utilities/src/platform'
import { TextInput } from 'wallet/src/components/input/TextInput'

const EPS = 1

export default function InputWithSuffix({
  alwaysShowInputSuffix = false,
  value,
  inputSuffix,
  inputSuffixColor,
  inputAlignment: inputAlignmentProp,
  inputFontSize,
  inputMaxFontSizeMultiplier,
  multiline = true,
  textAlign,
  textInputRef,
  ...inputProps
}: InputWithSuffixProps): JSX.Element {
  const textInputWidth = useRef<number>(0)
  const [shouldWrapLine, setShouldWrapLine] = useState(false)

  const measureMaxWidth = useCallback((e: LayoutChangeEvent) => {
    textInputWidth.current = e.nativeEvent.layout.width
  }, [])

  const measureInputWidth = useCallback(
    (e: LayoutChangeEvent) => {
      if (multiline) {
        const contentWidth = e.nativeEvent.layout.width
        const maxContentWidth = textInputWidth.current
        // Check if the input content doesn't fit in a single line
        // (add EPS to avoid rounding errors)
        setShouldWrapLine(contentWidth + EPS >= maxContentWidth)
      }
    },
    [multiline]
  )

  const isInputEmpty = !value?.length
  // On iOS use just the multiline prop to determine if the input should wrap
  // On Android, wrap the input only if it's content doesn't fit in a single line
  // and the input is multiline
  const isMultiline = multiline && (isIOS || shouldWrapLine)

  const fallbackTextInputAlignment = inputAlignmentProp === 'flex-start' ? 'left' : 'center'
  const textInputAlignment = textAlign ?? fallbackTextInputAlignment

  const suffix =
    inputSuffix && (alwaysShowInputSuffix || (value && !value.includes(inputSuffix))) ? (
      <TextInput
        backgroundColor="$transparent"
        color={inputSuffixColor ?? '$neutral2'}
        editable={false}
        fontSize={inputFontSize}
        lineHeight={inputFontSize}
        maxFontSizeMultiplier={inputMaxFontSizeMultiplier}
        px="$none"
        py="$none"
        scrollEnabled={false}
        textAlignVertical="bottom"
        value={inputSuffix}
      />
    ) : null

  return (
    <Flex row alignItems="flex-end" justifyContent={inputAlignmentProp}>
      {/* 
        Helper Flex to measure the max width of the input and switch to multiline if needed
        (multiline input behavior on Android is weird and the input flickers when the width
        of the TextInput component changes. As a workaround, we measure the max width of the input
        and switch to multiline if the content doesn't fit in a single line)
      */}
      <Flex row opacity={0} position="absolute" width="100%">
        <Flex grow onLayout={measureMaxWidth} />
        {suffix}
      </Flex>

      <TextInput
        ref={textInputRef}
        autoFocus
        autoCapitalize="none"
        backgroundColor="$transparent"
        color="$neutral1"
        flexShrink={1}
        fontSize={inputFontSize}
        lineHeight={inputFontSize}
        maxFontSizeMultiplier={inputMaxFontSizeMultiplier}
        multiline={isMultiline}
        px="$none"
        py="$none"
        returnKeyType="done"
        scrollEnabled={false}
        spellCheck={false}
        testID={ElementName.ImportAccountInput}
        textAlign={isInputEmpty ? 'left' : textInputAlignment}
        textAlignVertical={isInputEmpty ? 'center' : 'bottom'}
        value={value}
        onLayout={measureInputWidth}
        {...inputProps}
      />
      {suffix}
    </Flex>
  )
}
