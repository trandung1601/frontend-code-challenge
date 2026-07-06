// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import TokenSelectModal from './TokenSelectModal'
import { NETWORKS } from '../../../lib/networks'
import type { Token } from '../../../lib/tokens'

afterEach(cleanup)

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', price: 1646.13, balance: 23.82 },
  { symbol: 'USDC', name: 'USD Coin', price: 1, balance: 5173 },
  { symbol: 'ATOM', name: 'Cosmos', price: 7.18, balance: 42 },
]

function renderModal(overrides: Partial<Parameters<typeof TokenSelectModal>[0]> = {}) {
  const props = {
    tokens: TOKENS,
    selected: 'ETH',
    disabledSymbol: 'USDC',
    onSelect: vi.fn(),
    onClose: vi.fn(),
    network: NETWORKS[0],
    onNetworkChange: vi.fn(),
    ...overrides,
  }
  const utils = render(<TokenSelectModal {...props} />)
  return { ...utils, props }
}

describe('<TokenSelectModal />', () => {
  it('lists all tokens with the selected badge and the disabled counterpart', () => {
    renderModal()

    expect(screen.getByText('Ethereum · Ethereum')).toBeInTheDocument()
    expect(screen.getByText('Selected')).toBeInTheDocument() // on ETH
    expect(screen.getByText('USDC').closest('button')).toBeDisabled()
    expect(screen.getByText('ATOM').closest('button')).toBeEnabled()
  })

  it('filters by symbol or name, case-insensitively', async () => {
    const user = userEvent.setup()
    renderModal()

    const input = screen.getByPlaceholderText('Search name or symbol')
    expect(input).toHaveFocus() // autofocused for fast searching

    await user.type(input, 'cosmos')
    expect(screen.getByText('ATOM')).toBeInTheDocument()
    expect(screen.queryByText('ETH')).not.toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'usd')
    expect(screen.getByText('USDC')).toBeInTheDocument()
    expect(screen.queryByText('ATOM')).not.toBeInTheDocument()
  })

  it('shows a friendly empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByPlaceholderText('Search name or symbol'), 'zzz')
    expect(screen.getByText('No tokens match "zzz".')).toBeInTheDocument()
  })

  it('selects a token on click', () => {
    const { props } = renderModal()

    fireEvent.click(screen.getByText('ATOM').closest('button')!)
    expect(props.onSelect).toHaveBeenCalledTimes(1)
    expect(props.onSelect.mock.calls[0][0]).toMatchObject({ symbol: 'ATOM' })
  })

  it('closes on Escape', () => {
    const { props } = renderModal()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('asks for confirmation before switching networks, then commits', () => {
    const { props } = renderModal()
    const bnb = NETWORKS[1]

    fireEvent.click(screen.getByTitle(bnb.name))
    // Confirmation modal appears instead of switching straight away.
    expect(screen.getByText('Allow this site to switch networks?')).toBeInTheDocument()
    expect(props.onNetworkChange).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Switch network' }))
    expect(props.onNetworkChange).toHaveBeenCalledWith(bnb)
  })

  it('cancelling the network switch changes nothing', () => {
    const { props } = renderModal()

    fireEvent.click(screen.getByTitle(NETWORKS[2].name))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(props.onNetworkChange).not.toHaveBeenCalled()
    expect(screen.queryByText('Allow this site to switch networks?')).not.toBeInTheDocument()
  })

  it('collapses long network lists behind a "+N" toggle', () => {
    renderModal()
    const hidden = NETWORKS.length - 7

    const more = screen.getByText(`+${hidden}`)
    // Networks beyond the first 7 are hidden until expanded.
    const lastNet = NETWORKS[NETWORKS.length - 1]
    expect(screen.queryByTitle(lastNet.name)).not.toBeInTheDocument()

    fireEvent.click(more)
    expect(screen.getByTitle(lastNet.name)).toBeInTheDocument()
  })
})
