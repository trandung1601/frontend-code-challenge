// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/vitest'
import Problem2Page from './Problem2Page'
import { saveWalletSession, WALLET_PROVIDERS } from './lib/wallet'

const ROWS = [
  { currency: 'ETH', date: '2023-08-29T09:00:00.000Z', price: 1646.13 },
  { currency: 'USDC', date: '2023-08-29T09:00:00.000Z', price: 1 },
]

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ROWS } as Response),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <Problem2Page dark onToggleDark={() => {}} />
    </MemoryRouter>,
  )

describe('<Problem2Page /> disclaimer gate', () => {
  it('gates the swap form behind the disclaimer on first visit', () => {
    renderPage()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // The form is not mounted at all — only the placeholder.
    expect(screen.getByText('Accept the disclaimer to start swapping.')).toBeInTheDocument()
    expect(screen.queryByText('Slippage Tolerance')).not.toBeInTheDocument()
  })

  it('accepting mounts the swap form and persists the acceptance', async () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /i understand, continue/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Slippage Tolerance')).toBeInTheDocument())
    expect(localStorage.getItem('flux-disclaimer-accepted')).toBe('1')
  })

  it('skips the disclaimer when acceptance is already stored', async () => {
    localStorage.setItem('flux-disclaimer-accepted', '1')
    renderPage()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Slippage Tolerance')).toBeInTheDocument())
  })
})

describe('<Problem2Page /> wallet session', () => {
  beforeEach(() => localStorage.setItem('flux-disclaimer-accepted', '1'))

  it('offers Connect wallet when no session is stored', () => {
    renderPage()
    // Header button is "Connect wallet"; the swap CTA is "Connect Wallet".
    expect(screen.getByRole('button', { name: 'Connect wallet' })).toBeInTheDocument()
  })

  it('restores a live wallet session on mount', async () => {
    saveWalletSession(
      { provider: WALLET_PROVIDERS[0], address: '0x' + 'ab'.repeat(20) },
      'ethereum',
    )
    const { container } = renderPage()

    // Header shows the connected badge instead of the connect button.
    await waitFor(() => expect(container.querySelector('.flux-wallet-badge')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Connect wallet' })).not.toBeInTheDocument()
  })

  it('ignores an expired wallet session', () => {
    vi.useFakeTimers()
    try {
      saveWalletSession(
        { provider: WALLET_PROVIDERS[0], address: '0x' + 'ab'.repeat(20) },
        'ethereum',
      )
      vi.advanceTimersByTime(5 * 60_000 + 1)

      const { container } = renderPage()
      expect(container.querySelector('.flux-wallet-badge')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect wallet' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
