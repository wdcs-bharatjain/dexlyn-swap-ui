import { useBag } from 'nft/hooks/useBag'
import { useSendTransaction } from 'nft/hooks/useSendTransaction'
import { BagStatus, TxStateType } from 'nft/types'
import { useEffect, useRef } from 'react'

export function useSubscribeTransactionState(setModalIsOpen: (isOpen: boolean) => void) {
  const transactionState = useSendTransaction((state) => state.state)
  const setTransactionState = useSendTransaction((state) => state.setState)
  const transactionStateRef = useRef(transactionState)
  const { setBagStatus, setLocked: setBagLocked } = useBag(({ setBagExpanded, setBagStatus, setLocked }) => ({
    setBagExpanded,
    setBagStatus,
    setLocked,
  }))

  useEffect(() => {
    useSendTransaction.subscribe((state) => (transactionStateRef.current = state.state))
  }, [])

  useEffect(() => {
    if (transactionStateRef.current === TxStateType.Confirming) {
      setBagStatus(BagStatus.PROCESSING_TRANSACTION)
    }
    if (transactionStateRef.current === TxStateType.Denied || transactionStateRef.current === TxStateType.Invalid) {
      if (transactionStateRef.current === TxStateType.Invalid) {
        setBagStatus(BagStatus.WARNING)
      } else {
        setBagStatus(BagStatus.CONFIRM_REVIEW)
      }
      setTransactionState(TxStateType.New)

      setBagLocked(false)
      setModalIsOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBagLocked, setBagStatus, setModalIsOpen, setTransactionState, transactionStateRef.current])
}
