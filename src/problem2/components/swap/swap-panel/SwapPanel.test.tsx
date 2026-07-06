// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SwapPanel from './SwapPanel'
import { WALLET_PROVIDERS } from '../../../lib/wallet'
import type { Token } from '../../../lib/tokens'

afterEach(cleanup)

const ETH: Token = { symbol: 'ETH', name: 'Ethereum', price: 1646.13, balance: 23.82 }

function renderPanel(overrides: Partial<Parameters<typeof SwapPanel>[0]> = {}) {
  const props = {
    label: 'From:',
    token: ETH,
    amount: '',
    editable: true,
    connected: true,
    usd: 0,
    balance: ETH.balance,
    onAmount: vi.fn(),
    onPick: vi.fn(),
    onMax: vi.fn(),
    ...overrides,
  }
  const utils = render(<SwapPanel {...props} />)
  return { ...utils, props }
}

describe('<SwapPanel />', () => {
  it('shows balance with a working MAX shortcut when connected and editable', () => {
    const { props } = renderPanel()

    expect(screen.getByText(/Balance:/)).toHaveTextContent('Balance: 23.82')
    fireEvent.click(screen.getByText('MAX'))
    expect(props.onMax).toHaveBeenCalledTimes(1)
  })

  it('hides balance and keeps the input read-only when disconnected', () => {
    renderPanel({ connected: false, balance: null })

    expect(screen.queryByText(/Balance:/)).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.00')).toHaveAttribute('readonly')
    expect(screen.getByText('~0 USD')).toBeInTheDocument()
  })

  it('forwards typing to onAmount and shows the USD value', () => {
    const { props } = renderPanel({ amount: '2', usd: 3292.26 })

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '2.5' } })
    expect(props.onAmount).toHaveBeenCalledWith('2.5')
    expect(screen.getByText('~$3,292.26')).toBeInTheDocument()
  })

  it('turns the amount red when over balance', () => {
    renderPanel({ amount: '99', overBalance: true })
    expect(screen.getByPlaceholderText('0.00')).toHaveStyle({ color: '#ef4444' })
  })

  it('opens the token picker from the token button', () => {
    const { props } = renderPanel()
    fireEvent.click(screen.getByText('ETH').closest('button')!)
    expect(props.onPick).toHaveBeenCalledTimes(1)
  })

  it('renders a Select placeholder when no token is chosen', () => {
    renderPanel({ token: null })
    expect(screen.getByText('Select')).toBeInTheDocument()
  })

  it('prefers the active network name over the token’s native chain', () => {
    renderPanel({ networkName: 'Solana', networkIcon: 'SOL' })
    expect(screen.getByText('Solana')).toBeInTheDocument()
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument()
  })

  it('shows the truncated sender address with the wallet avatar', () => {
    renderPanel({
      address: '0x' + 'ab'.repeat(20),
      provider: WALLET_PROVIDERS[0],
    })
    expect(screen.getByText('0xabab…abab')).toBeInTheDocument()
  })
})
