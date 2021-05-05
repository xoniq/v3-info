import React, { useMemo, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  useTokenData,
  usePoolsForToken,
  useTokenChartData,
  useTokenPriceData,
  useTokenTransactions,
} from 'state/tokens/hooks'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { shortenAddress, getEtherscanLink } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow, RowFlat } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader, { LocalLoader } from 'components/Loader'
import { ExternalLink, Download } from 'react-feather'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, ButtonGray, SavedIcon } from 'components/Button'
import { DarkGreyCard } from 'components/Card'
import { usePoolDatas } from 'state/pools/hooks'
import PoolTable from 'components/pools/PoolTable'
import LineChart from 'components/LineChart'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart'
import CandleChart from 'components/CandleChart'
import TransactionTable from 'components/TransactionsTable'
import { useSavedTokens } from 'state/user/hooks'

const PriceText = styled(TYPE.label)`
  font-size: 36px;
  line-height: 1;
`

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

export default function TokenPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // token data
  const tokenData = useTokenData(address)

  // get the data for the pools this token is a part of
  const poolsForToken = usePoolsForToken(address)
  const poolDatas = usePoolDatas(poolsForToken ?? [])
  const transactions = useTokenTransactions(address)
  const chartData = useTokenChartData(address)

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const [view, setView] = useState(ChartView.TVL)
  const [latestValue, setLatestValue] = useState<number | undefined>()

  const priceData = useTokenPriceData(address, 3600)
  const formattedPriceData = useMemo(() => {
    if (priceData) {
      return priceData.map((day) => {
        return {
          time: parseFloat(day.timestamp),
          open: day.open,
          close: day.close,
          high: day.close,
          low: day.open,
        }
      })
    } else {
      return []
    }
  }, [priceData])

  // watchlist
  const [savedTokens, addSavedToken] = useSavedTokens()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {tokenData ? (
        <AutoColumn gap="24px">
          <RowBetween>
            <AutoRow gap="4px">
              <StyledInternalLink to={'/'}>
                <TYPE.main>{`Home > `}</TYPE.main>
              </StyledInternalLink>
              <StyledInternalLink to={'/tokens'}>
                <TYPE.label>{` Tokens `}</TYPE.label>
              </StyledInternalLink>
              <TYPE.main>{` > `}</TYPE.main>
              <TYPE.label>{` ${tokenData.symbol} `}</TYPE.label>
              <StyledExternalLink href={getEtherscanLink(1, address, 'address')}>
                <TYPE.main>{` (${shortenAddress(address)}) `}</TYPE.main>
              </StyledExternalLink>
            </AutoRow>
            <AutoRow gap="10px" justify="flex-end">
              <SavedIcon fill={savedTokens.includes(address)} onClick={() => addSavedToken(address)} />
              <StyledExternalLink href={getEtherscanLink(1, address, 'address')}>
                <ExternalLink stroke={theme.text2} />
              </StyledExternalLink>
            </AutoRow>
          </RowBetween>
          <ResponsiveRow align="flex-end">
            <AutoColumn gap="md">
              <AutoRow gap="4px">
                <CurrencyLogo address={address} />
                <TYPE.label fontSize="20px">{tokenData.name}</TYPE.label>
                <TYPE.main fontSize="20px">{tokenData.symbol}</TYPE.main>
              </AutoRow>
              <RowFlat>
                <PriceText mr="10px"> {formatDollarAmount(tokenData.priceUSD)}</PriceText>
                (<Percent value={tokenData.priceUSDChange} />)
              </RowFlat>
            </AutoColumn>
            {/* <RowFixed>
              <ButtonGray width="170px" mr="12px">
                <RowBetween>
                  <Download size={24} />
                  <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                </RowBetween>
              </ButtonGray>
              <ButtonPrimary width="100px" style={{ backgroundColor: backgroundColor }}>
                Trade
              </ButtonPrimary>
            </RowFixed> */}
          </ResponsiveRow>
          <ContentLayout>
            <DarkGreyCard>
              <AutoColumn gap="lg">
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>TVL</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.tvlUSD)}</TYPE.label>
                  <Percent value={tokenData.tvlUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>24h Trading Vol</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSD)}</TYPE.label>
                  <Percent value={tokenData.volumeUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>7d Trading Vol</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSDWeek)}</TYPE.label>
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>24h Txns</TYPE.main>
                  <TYPE.label fontSize="24px">{tokenData.txCount ?? 0}</TYPE.label>
                </AutoColumn>
              </AutoColumn>
            </DarkGreyCard>
            <DarkGreyCard>
              <RowBetween>
                <AutoColumn>
                  <TYPE.main>{view === ChartView.VOL ? '24H Volume' : 'TVL'}</TYPE.main>
                  <TYPE.label fontSize="24px" height="30px">
                    {latestValue
                      ? formatDollarAmount(latestValue)
                      : view === ChartView.VOL
                      ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                      : formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)}
                  </TYPE.label>
                </AutoColumn>
                <ToggleWrapper width="160px">
                  <ToggleElementFree
                    isActive={view === ChartView.VOL}
                    fontSize="12px"
                    onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
                  >
                    Volume
                  </ToggleElementFree>
                  <ToggleElementFree
                    isActive={view === ChartView.TVL}
                    fontSize="12px"
                    onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
                  >
                    TVL
                  </ToggleElementFree>
                  {/* <ToggleElementFree
                    isActive={view === ChartView.PRICE}
                    fontSize="12px"
                    onClick={() => setView(ChartView.PRICE)}
                  >
                    Price
                  </ToggleElementFree> */}
                </ToggleWrapper>
              </RowBetween>
              {view === ChartView.TVL ? (
                <LineChart data={formattedTvlData} color={backgroundColor} minHeight={340} setValue={setLatestValue} />
              ) : view === ChartView.VOL ? (
                <BarChart
                  data={formattedVolumeData}
                  color={backgroundColor}
                  minHeight={340}
                  setValue={setLatestValue}
                />
              ) : view === ChartView.PRICE ? (
                <CandleChart data={formattedPriceData} />
              ) : null}
            </DarkGreyCard>
          </ContentLayout>
          <TYPE.main fontSize="24px">Pools</TYPE.main>
          <DarkGreyCard>
            <PoolTable poolDatas={poolDatas} />
          </DarkGreyCard>
          <TYPE.main fontSize="24px">Transactions</TYPE.main>
          <DarkGreyCard>
            {transactions ? <TransactionTable transactions={transactions} /> : <LocalLoader fill={false} />}
          </DarkGreyCard>
        </AutoColumn>
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}