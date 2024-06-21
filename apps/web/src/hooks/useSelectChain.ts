import { ChainId } from '@uniswap/sdk-core'
import { useSwitchChain } from 'hooks/useSwitchChain'
import { useCallback } from 'react'
import { PopupType, addPopup, removePopup } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import { logger } from 'utilities/src/logger/logger'
import { UserRejectedRequestError } from 'viem'

export default function useSelectChain() {
  const dispatch = useAppDispatch()
  const switchChain = useSwitchChain()

  return useCallback(
    async (targetChain: ChainId) => {
      try {
        await switchChain(targetChain)
        dispatch(
          removePopup({
            content: { failedSwitchNetwork: targetChain, type: PopupType.FailedSwitchNetwork },
            key: 'failed-network-switch',
          })
        )
        return true
      } catch (error) {
        if (
          !error?.message?.includes("Request of type 'wallet_switchEthereumChain' already pending") &&
          !(error instanceof UserRejectedRequestError) /* request already pending */
        ) {
          logger.warn('useSelectChain', 'useSelectChain', error.message)
          dispatch(
            addPopup({
              content: { failedSwitchNetwork: targetChain, type: PopupType.FailedSwitchNetwork },
              key: 'failed-network-switch',
            })
          )
        }

        return false
      }
    },
    [dispatch, switchChain]
  )
}
