// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Swap99 from './Swap99'
import { NETWORKS } from '../../../lib/networks'
import { WALLET_PROVIDERS, type ConnectedWallet } from '../../../lib/wallet'
import type { Token } from '../../../lib/tokens'

afterEach(cleanup)

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', price: 1646.13, balance: 23.82 },
  { symbol: 'USDC', name: 'USD Coin', price: 1, balance: 5173 },
]

const WALLET: ConnectedWallet = {
  provider: WALLET_PROVIDERS[0],
  address: '0x' + 'ab'.repeat(20),
}

function renderSwap(overrides: Partial<Parameters<typeof Swap99>[0]> = {}) {
  const props = {
    wallet: WALLET,
    tokens: TOKENS,
    loading: false,
    error: null,
    refetch: vi.fn(),
    onOpenConnect: vi.fn(),
    onRecordSwap: vi.fn(),
    network: NETWORKS[0],
    onNetworkChange: vi.fn(),
    ...overrides,
  }
  const utils = render(<Swap99 {...props} />)
  return { ...utils, props }
}

const amountInput = () => screen.getAllByPlaceholderText('0.00')[0]

describe('<Swap99 />', () => {
  it('offers Connect Wallet when disconnected', () => {
    const { props } = renderSwap({ wallet: null })

    const cta = screen.getByRole('button', { name: /connect wallet/i })
    fireEvent.click(cta)
    expect(props.onOpenConnect).toHaveBeenCalledTimes(1)
  })

  it('disables the CTA until an amount is entered', () => {
    renderSwap()
    expect(screen.getByRole('button', { name: 'Enter an amount' })).toBeDisabled()
  })

  it('computes the receive amount from live prices and shows the quote details', () => {
    renderSwap()

    fireEvent.change(amountInput(), { target: { value: '2' } })

    // 2 ETH × $1,646.13 = 3,292.26 USDC
    expect(screen.getAllByPlaceholderText('0.00')[1]).toHaveValue('3,292.26')
    expect(screen.getByRole('button', { name: 'Swap now' })).toBeEnabled()
    // Details panel appears with the quote.
    expect(screen.getByText('Minimum Received')).toBeInTheDocument()
    expect(screen.getByText('TX Fee')).toBeInTheDocument()
  })

  it('rejects amounts above the balance', () => {
    renderSwap()

    fireEvent.change(amountInput(), { target: { value: '99' } })
    expect(screen.getByRole('button', { name: 'Insufficient ETH balance' })).toBeDisabled()
  })

  it('strips non-numeric input', () => {
    renderSwap()
    fireEvent.change(amountInput(), { target: { value: '1a.5x' } })
    expect(amountInput()).toHaveValue('1.5')
  })

  it('hides the details panel when no amount is entered', () => {
    renderSwap()
    expect(screen.queryByText('Minimum Received')).not.toBeInTheDocument()
  })

  it('runs the swap lifecycle and records the completed swap', () => {
    vi.useFakeTimers()
    try {
      const { props } = renderSwap()

      fireEvent.change(amountInput(), { target: { value: '2' } })
      fireEvent.click(screen.getByRole('button', { name: 'Swap now' }))

      expect(screen.getByText('Swapping…')).toBeInTheDocument()
      expect(props.onRecordSwap).not.toHaveBeenCalled()

      act(() => vi.advanceTimersByTime(1700))
      expect(screen.getByText('Swap complete')).toBeInTheDocument()
      expect(props.onRecordSwap).toHaveBeenCalledTimes(1)
      expect(props.onRecordSwap.mock.calls[0][0]).toMatchObject({
        fromSym: 'ETH',
        toSym: 'USDC',
        fromAmount: 2,
        fromAddr: WALLET.address,
      })

      // Back to idle with the form reset.
      act(() => vi.advanceTimersByTime(2400))
      expect(amountInput()).toHaveValue('')
      expect(screen.getByRole('button', { name: 'Enter an amount' })).toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('switches sides, swapping the token pair', () => {
    renderSwap()

    fireEvent.click(screen.getByTitle('Switch direction'))
    // USDC is now the "from" side: entering 100 USDC yields ~0.06 ETH.
    fireEvent.change(amountInput(), { target: { value: '100' } })
    expect(screen.getAllByPlaceholderText('0.00')[1]).toHaveValue('0.060749')
  })

  it('shows the error card with a working retry', () => {
    const { props } = renderSwap({ error: 'Could not load prices' })

    expect(screen.getByText('Could not load prices')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(props.refetch).toHaveBeenCalledTimes(1)
  })
})
