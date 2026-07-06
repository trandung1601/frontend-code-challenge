// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import ConnectWalletModal from './ConnectWalletModal'
import { WALLET_PROVIDERS } from '../../../lib/wallet'

afterEach(cleanup)

describe('<ConnectWalletModal />', () => {
  it('lists every configured wallet provider', () => {
    render(<ConnectWalletModal onSelect={() => {}} onClose={() => {}} />)

    for (const p of WALLET_PROVIDERS) {
      expect(screen.getByText(p.name)).toBeInTheDocument()
      expect(screen.getByText(p.description)).toBeInTheDocument()
    }
  })

  it('closes via the ✕ button, the overlay, and the Escape key', () => {
    const onClose = vi.fn()
    const { container } = render(<ConnectWalletModal onSelect={() => {}} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('Close'))
    fireEvent.click(container.querySelector('.cw-overlay')!)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)

    // Clicking inside the card must NOT close (stopPropagation).
    fireEvent.click(container.querySelector('.cw-card')!)
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  describe('handshake simulation', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('shows a spinner, disables all rows, and completes after the delay', () => {
      const onSelect = vi.fn()
      const { container } = render(<ConnectWalletModal onSelect={onSelect} onClose={() => {}} />)

      const metamask = screen.getByText('MetaMask').closest('button')!
      fireEvent.click(metamask)

      // Connecting: spinner visible, all provider rows disabled, not yet selected.
      expect(container.querySelector('.cw-spinner')).toBeInTheDocument()
      for (const row of container.querySelectorAll<HTMLButtonElement>('.cw-row')) {
        expect(row).toBeDisabled()
      }
      expect(onSelect).not.toHaveBeenCalled()

      act(() => vi.advanceTimersByTime(900))
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect.mock.calls[0][0]).toMatchObject({ id: 'metamask' })
    })

    it('ignores further picks while a handshake is in flight', () => {
      const onSelect = vi.fn()
      render(<ConnectWalletModal onSelect={onSelect} onClose={() => {}} />)

      fireEvent.click(screen.getByText('MetaMask').closest('button')!)
      fireEvent.click(screen.getByText('Phantom').closest('button')!)

      act(() => vi.advanceTimersByTime(2000))
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect.mock.calls[0][0]).toMatchObject({ id: 'metamask' })
    })
  })
})
