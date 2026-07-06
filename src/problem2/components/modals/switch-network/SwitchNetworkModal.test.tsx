// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SwitchNetworkModal from './SwitchNetworkModal'
import { NETWORKS } from '../../../lib/networks'

afterEach(cleanup)

const [ethereum, bnb] = NETWORKS

function renderModal(onConfirm = vi.fn(), onCancel = vi.fn()) {
  const utils = render(
    <SwitchNetworkModal from={ethereum} to={bnb} onConfirm={onConfirm} onCancel={onCancel} />,
  )
  return { ...utils, onConfirm, onCancel }
}

describe('<SwitchNetworkModal />', () => {
  it('shows both networks with their RPC endpoints', () => {
    renderModal()

    expect(screen.getByText('Allow this site to switch networks?')).toBeInTheDocument()
    expect(screen.getByText(ethereum.name)).toBeInTheDocument()
    expect(screen.getByText(ethereum.rpc)).toBeInTheDocument()
    expect(screen.getByText(bnb.name)).toBeInTheDocument()
    expect(screen.getByText(bnb.rpc)).toBeInTheDocument()
  })

  it('confirms via the primary action', () => {
    const { onConfirm, onCancel } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Switch network' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('cancels via Cancel, the ✕ button and the overlay — but not the card', () => {
    const { container, onConfirm, onCancel } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(container.querySelector('.sn-close')!)
    fireEvent.click(container.querySelector('.sn-overlay')!)
    expect(onCancel).toHaveBeenCalledTimes(3)

    fireEvent.click(container.querySelector('.sn-card')!)
    expect(onCancel).toHaveBeenCalledTimes(3)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
