// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SwapHistory from './SwapHistory'
import type { SwapRecord } from '../../hooks/useSwapHistory'

afterEach(cleanup)

const RECORD: SwapRecord = {
  id: 'r1',
  time: Date.now() - 5 * 60_000, // 5 minutes ago
  fromSym: 'ETH',
  toSym: 'USDC',
  fromAmount: 2,
  toAmount: 3292.26,
  fromUsd: 3292.26,
  rate: 1646.13,
  fromAddr: '0x' + 'ab'.repeat(20),
  toAddr: '0x' + 'cd'.repeat(20),
}

function renderHistory(overrides: Partial<Parameters<typeof SwapHistory>[0]> = {}) {
  const props = {
    history: [RECORD],
    onClear: vi.fn(),
    connected: true,
    onConnect: vi.fn(),
    ...overrides,
  }
  const utils = render(<SwapHistory {...props} />)
  return { ...utils, props }
}

describe('<SwapHistory />', () => {
  it('prompts to connect when no wallet is attached', () => {
    const { props } = renderHistory({ connected: false })

    expect(screen.getByText('Wallet not connected')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))
    expect(props.onConnect).toHaveBeenCalledTimes(1)
    // No clear button in this state.
    expect(screen.queryByTitle('Clear history')).not.toBeInTheDocument()
  })

  it('shows an empty state when connected with no swaps', () => {
    renderHistory({ history: [] })

    expect(screen.getByText('No swaps yet')).toBeInTheDocument()
    expect(screen.queryByTitle('Clear history')).not.toBeInTheDocument()
  })

  it('renders a record with amounts, USD value, recipient and age', () => {
    renderHistory()

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('3,292.26')).toBeInTheDocument()
    expect(screen.getByText('USDC')).toBeInTheDocument()
    expect(screen.getByText('$3,292.26')).toBeInTheDocument()
    expect(screen.getByText('0xcdcd…cdcd')).toBeInTheDocument()
    expect(screen.getByText('5m ago')).toBeInTheDocument()
  })

  it('clears the log from the header action', () => {
    const { props } = renderHistory()

    fireEvent.click(screen.getByTitle('Clear history'))
    expect(props.onClear).toHaveBeenCalledTimes(1)
  })
})
