/* eslint-disable no-restricted-imports */

import { renderWithProviders } from 'uniswap/src/test/render'

// re-export everything
export * from '@testing-library/react-native'
// override render method
export { renderWithProviders as render }
