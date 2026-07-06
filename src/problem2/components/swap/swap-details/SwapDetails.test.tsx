// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import SwapDetails, { TX_FEE_PCT } from './SwapDetails'
import type { Token } from '../../../lib/tokens'
import type { Network } from '../../../lib/networks'

afterEach(cleanup)

const ETH: Token = { symbol: 'ETH', name: 'Ethereum', price: 1646.13, balance: 23.82 }
const USDC: Token = { symbol: 'USDC', name: 'USD Coin', price: 1, balance: 5173 }

const ETHEREUM: Network = {
  id: 'ethereum',
  name: 'Ethereum',
  color: '#627EEA',
  rpc: 'https://mainnet.infura.io/v3/',
  icon: 'ETH',
}
const BNB: Network = {
  id: 'bnb',
  name: 'BNB Chain',
  color: '#F0B90B',
  rpc: 'https://bsc-dataseed.binance.org',
  icon: 'BNB',
}

function renderDetails(overrides: Partial<Parameters<typeof SwapDetails>[0]> = {}) {
  const props = {
    from: ETH,
    to: USDC,
    rate: ETH.price / USDC.price,
    receive: 2 * (ETH.price / USDC.price), // 2 ETH → 3,292.26 USDC
    slippage: 0.1,
    network: ETHEREUM,
    tokens: [ETH, USDC],
    ...overrides,
  }
  return render(<SwapDetails {...props} />)
}

describe('<SwapDetails />', () => {
  it('shows the route with Best Rate badge and the chain ETA', () => {
    renderDetails()

    expect(screen.getByText('99Route')).toBeInTheDocument()
    expect(screen.getByText('Best Rate')).toBeInTheDocument()
    expect(screen.getByText('~1 min')).toBeInTheDocument() // ethereum ETA
  })

  it('computes Minimum Received from the slippage tolerance', () => {
    renderDetails()

    // 3,292.26 × (1 − 0.001) = 3,288.97 USDC
    expect(screen.getByText(/3,288\.97/)).toBeInTheDocument()
    expect(screen.getByText(/\(0\.1%\)/)).toBeInTheDocument()
  })

  it('shows the rate and flips direction on click', async () => {
    const user = userEvent.setup()
    renderDetails()

    const rateBtn = screen.getByTitle('Flip rate')
    expect(rateBtn).toHaveTextContent('1 ETH ≈ 1,646.13 USDC')

    await user.click(rateBtn)
    expect(rateBtn).toHaveTextContent(/^1 USDC ≈ 0\.000607/)

    await user.click(rateBtn) // flips back
    expect(rateBtn).toHaveTextContent('1 ETH ≈ 1,646.13 USDC')
  })

  it('prices the network fee in the native token with a USD tag', () => {
    renderDetails()
    // $1.85 of gas ÷ $1,646.13 per ETH ≈ 0.0011238 ETH
    expect(screen.getByText(/0\.00112\d* ETH \(\$1\.85\)/)).toBeInTheDocument()
  })

  it('falls back to USD-only when the native token has no price in the list', () => {
    renderDetails({ network: BNB }) // tokens list has no BNB entry

    expect(screen.getByText('$0.18')).toBeInTheDocument()
    expect(screen.getByText('~15 sec')).toBeInTheDocument() // bnb ETA
  })

  it('shows the flat TX fee', () => {
    renderDetails()
    expect(screen.getByText(`${TX_FEE_PCT}%`)).toBeInTheDocument()
  })

  it('expands and collapses the route comparison from the route row', async () => {
    const user = userEvent.setup()
    renderDetails()

    expect(screen.queryByText('Route comparison')).not.toBeInTheDocument()

    await user.click(screen.getByTitle('Compare routes'))
    expect(screen.getByText('Route comparison')).toBeInTheDocument()
    // The three mocked aggregators are listed.
    expect(screen.getByText('99Route', { selector: '.flux-route *' })).toBeInTheDocument()
    expect(screen.getByText('OrbitX')).toBeInTheDocument()
    expect(screen.getByText('NovaDEX')).toBeInTheDocument()

    await user.click(screen.getByTitle('Compare routes'))
    expect(screen.queryByText('Route comparison')).not.toBeInTheDocument()
  })
})
