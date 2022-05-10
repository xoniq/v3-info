import React from 'react'
import styled from 'styled-components'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, ExternalLink } from 'theme'
import { useEthPrices } from 'hooks/useEthPrices'
import { formatDollarAmount } from 'utils/numbers'
import Polling from './Polling'

const Wrapper = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0) linear-gradient(90deg, rgb(17, 19, 66) 0%, rgb(13, 43, 130) 50%, rgb(3, 5, 53) 100%);
  padding: 10px 20px;
`

const Item = styled(TYPE.main)`
  font-size: 12px;
`

const StyledLink = styled(ExternalLink)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

const TopBar = () => {
  const ethPrices = useEthPrices()
  return (
    <Wrapper>
      <RowBetween>
        <Polling />
        <AutoRow gap="6px">
          <RowFixed>
            <Item>ETH Price:</Item>
            <Item fontWeight="700" ml="4px">
              {formatDollarAmount(ethPrices?.current)}
            </Item>
          </RowFixed>
        </AutoRow>
        <AutoRow gap="6px" style={{ justifyContent: 'flex-end' }}>
          {/* <StyledLink href="https://v2.info.uniswap.org/#/">V2 Analytics</StyledLink> */}
          {/* <StyledLink href="https://docs.uniswap.org/">Docs</StyledLink> */}
          {/* <StyledLink href="https://app.uniswap.org/#/swap">App</StyledLink> */}
          <StyledLink href="https://www.safeswap.online/">SafeSwap Online</StyledLink>
        </AutoRow>
      </RowBetween>
    </Wrapper>
  )
}

export default TopBar
