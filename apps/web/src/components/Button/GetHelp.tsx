import { EnvelopeHeartIcon } from 'components/Icons/EnvelopeHeart'
import Row from 'components/Row'
import { Trans } from 'i18n'
import styled from 'styled-components'
import { ExternalLink } from 'theme/components'
import { uniswapUrls } from 'uniswap/src/constants/urls'

const StyledExternalLink = styled(ExternalLink)`
  width: fit-content;
  border-radius: 16px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 485;
  line-height: 20px;
  background: ${({ theme }) => theme.surface2};
  color: ${({ theme }) => theme.neutral2};
  :hover {
    background: ${({ theme }) => theme.surface3};
    color: ${({ theme }) => theme.neutral1};
    path {
      fill: ${({ theme }) => theme.neutral1};
    }
    opacity: unset;
  }
  stroke: none;
`
export default function GetHelp() {
  return (
    <StyledExternalLink href={uniswapUrls.helpUrl}>
      <Row gap="4px">
        <EnvelopeHeartIcon />
        <Trans i18nKey="common.getHelp.button" />
      </Row>
    </StyledExternalLink>
  )
}
