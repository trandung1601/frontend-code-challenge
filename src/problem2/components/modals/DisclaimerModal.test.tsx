// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import DisclaimerModal from './DisclaimerModal'

afterEach(cleanup)

describe('<DisclaimerModal />', () => {
  it('renders an accessible dialog titled "Demo environment"', () => {
    render(<DisclaimerModal onAccept={() => {}} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('heading', { name: 'Demo environment' })).toBeInTheDocument()
  })

  it('lists the three live/demo points with their badges', () => {
    render(<DisclaimerModal onAccept={() => {}} />)

    expect(screen.getByText('Live token prices')).toBeInTheDocument()
    expect(screen.getByText('Simulated swaps & wallets')).toBeInTheDocument()
    expect(screen.getByText('Nothing leaves your browser')).toBeInTheDocument()

    expect(screen.getAllByText('Live')).toHaveLength(1)
    expect(screen.getAllByText('Demo')).toHaveLength(2)
  })

  it('autofocuses the CTA so Enter can dismiss immediately', () => {
    render(<DisclaimerModal onAccept={() => {}} />)
    expect(screen.getByRole('button', { name: /i understand, continue/i })).toHaveFocus()
  })

  it('calls onAccept when the CTA is clicked', async () => {
    const onAccept = vi.fn()
    const user = userEvent.setup()
    render(<DisclaimerModal onAccept={onAccept} />)

    await user.click(screen.getByRole('button', { name: /i understand, continue/i }))
    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  it('calls onAccept when Enter is pressed on the focused CTA', async () => {
    const onAccept = vi.fn()
    const user = userEvent.setup()
    render(<DisclaimerModal onAccept={onAccept} />)

    await user.keyboard('{Enter}') // CTA already holds focus
    expect(onAccept).toHaveBeenCalledTimes(1)
  })
})
