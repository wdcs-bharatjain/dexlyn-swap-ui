import { ChainId } from 'uniswap/src/types/chains'
import { SplitLogo } from 'wallet/src/components/CurrencyLogo/SplitLogo'
import {
  DAI_CURRENCY_INFO,
  ETH_CURRENCY_INFO,
  daiCurrencyInfo,
  ethCurrencyInfo,
} from 'wallet/src/test/fixtures'
import { render, within } from 'wallet/src/test/test-utils'

describe(SplitLogo, () => {
  it('renders without error', () => {
    const tree = render(
      <SplitLogo
        chainId={ChainId.ArbitrumOne}
        inputCurrencyInfo={DAI_CURRENCY_INFO}
        outputCurrencyInfo={ETH_CURRENCY_INFO}
        size={10}
      />
    )

    expect(tree).toMatchSnapshot()
  })

  describe('input currency logo', () => {
    it('renders input currency logo when inputCurrencyInfo is specified', () => {
      const { getByTestId } = render(
        <SplitLogo
          chainId={ChainId.ArbitrumOne}
          inputCurrencyInfo={daiCurrencyInfo()}
          outputCurrencyInfo={ethCurrencyInfo()}
          size={10}
        />
      )

      const inputCurrencyLogo = getByTestId('input-currency-logo-container')

      expect(within(inputCurrencyLogo).queryByTestId('token-logo')).toBeTruthy()
    })

    it('renders input currency logo when inputCurrencyInfo is not specified', () => {
      const { getByTestId } = render(
        <SplitLogo
          chainId={ChainId.ArbitrumOne}
          inputCurrencyInfo={null}
          outputCurrencyInfo={ethCurrencyInfo()}
          size={10}
        />
      )

      const inputCurrencyLogo = getByTestId('input-currency-logo-container')

      expect(within(inputCurrencyLogo).queryByTestId('token-logo')).toBeFalsy()
    })
  })

  describe('output currency logo', () => {
    it('renders output currency logo when outputCurrencyInfo is specified', () => {
      const { getByTestId } = render(
        <SplitLogo
          chainId={ChainId.ArbitrumOne}
          inputCurrencyInfo={daiCurrencyInfo()}
          outputCurrencyInfo={ethCurrencyInfo()}
          size={10}
        />
      )

      const outputCurrencyLogo = getByTestId('output-currency-logo-container')

      expect(within(outputCurrencyLogo).queryByTestId('token-logo')).toBeTruthy()
    })

    it('renders output currency logo when outputCurrencyInfo is not specified', () => {
      const { getByTestId } = render(
        <SplitLogo
          chainId={ChainId.ArbitrumOne}
          inputCurrencyInfo={daiCurrencyInfo()}
          outputCurrencyInfo={null}
          size={10}
        />
      )

      const outputCurrencyLogo = getByTestId('output-currency-logo-container')

      expect(within(outputCurrencyLogo).queryByTestId('token-logo')).toBeFalsy()
    })
  })

  describe('icon', () => {
    it('renders icon when chainId is specified', () => {
      const { getByTestId } = render(
        <SplitLogo
          chainId={ChainId.ArbitrumOne}
          inputCurrencyInfo={daiCurrencyInfo()}
          outputCurrencyInfo={ethCurrencyInfo()}
          size={10}
        />
      )

      const icon = getByTestId('network-logo')

      expect(icon).toBeTruthy()
    })

    it('does not render icon when chainId is not specified', () => {
      const { queryByTestId } = render(
        <SplitLogo
          chainId={null}
          inputCurrencyInfo={daiCurrencyInfo()}
          outputCurrencyInfo={ethCurrencyInfo()}
          size={10}
        />
      )

      const icon = queryByTestId('network-logo')

      expect(icon).toBeFalsy()
    })
  })
})
