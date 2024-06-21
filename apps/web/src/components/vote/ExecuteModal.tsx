import Circle from 'assets/images/blue-loader.svg'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn, ColumnCenter } from 'components/Column'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import { useAccount } from 'hooks/useAccount'
import { Trans } from 'i18n'
import { useState } from 'react'
import { ArrowUpCircle, X } from 'react-feather'
import { useExecuteCallback } from 'state/governance/hooks'
import styled, { useTheme } from 'styled-components'
import { CustomLightSpinner, ExternalLink, ThemedText } from 'theme/components'
import { logger } from 'utilities/src/logger/logger'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`

const StyledClosed = styled(X)`
  :hover {
    cursor: pointer;
  }
`

const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

interface ExecuteModalProps {
  isOpen: boolean
  onDismiss: () => void
  proposalId?: string // id for the proposal to execute
}

export default function ExecuteModal({ isOpen, onDismiss, proposalId }: ExecuteModalProps) {
  const { chainId } = useAccount()
  const executeCallback = useExecuteCallback()

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState<boolean>(false)

  // get theme for colors
  const theme = useTheme()

  // wrapper to reset state on modal close
  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onExecute() {
    setAttempting(true)

    // if callback not returned properly ignore
    if (!executeCallback) {
      return
    }

    // try delegation and store hash
    const hash = await executeCallback(proposalId)?.catch((error) => {
      setAttempting(false)
      logger.info('ExecuteModal', 'onExecute', error)
    })

    if (hash) {
      setHash(hash)
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <AutoColumn gap="lg" justify="center">
            <RowBetween>
              <ThemedText.DeprecatedMediumHeader fontWeight={535}>
                <Trans i18nKey="account.transactionSummary.executeProposal" values={{ proposalKey: proposalId }} />
              </ThemedText.DeprecatedMediumHeader>
              <StyledClosed onClick={wrappedOnDismiss} />
            </RowBetween>
            <RowBetween>
              <ThemedText.DeprecatedBody>
                <Trans i18nKey="proposal.willEnact" />
              </ThemedText.DeprecatedBody>
            </RowBetween>
            <ButtonPrimary onClick={onExecute}>
              <ThemedText.DeprecatedMediumHeader color="white">
                <Trans i18nKey="vote.votePage.execute" />
              </ThemedText.DeprecatedMediumHeader>
            </ButtonPrimary>
          </AutoColumn>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <StyledClosed onClick={wrappedOnDismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <CustomLightSpinner src={Circle} alt="loader" size="90px" />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify="center">
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedLargeHeader>
                <Trans i18nKey="common.executing" />
              </ThemedText.DeprecatedLargeHeader>
            </AutoColumn>
            <ThemedText.DeprecatedSubHeader>
              <Trans i18nKey="common.confirmTransaction.button" />
            </ThemedText.DeprecatedSubHeader>
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
      {hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <StyledClosed onClick={wrappedOnDismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.accent1} />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify="center">
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedLargeHeader>
                <Trans i18nKey="proposal.executionSubmitted" />
              </ThemedText.DeprecatedLargeHeader>
            </AutoColumn>
            {chainId && (
              <ExternalLink
                href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}
                style={{ marginLeft: '4px' }}
              >
                <ThemedText.DeprecatedSubHeader>
                  <Trans i18nKey="common.viewTransactionExplorer.link" />
                </ThemedText.DeprecatedSubHeader>
              </ExternalLink>
            )}
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  )
}
