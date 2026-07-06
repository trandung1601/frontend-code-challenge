// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SlippageSelector from './SlippageSelector'

afterEach(cleanup)

describe('<SlippageSelector />', () => {
  it('shows the current tolerance with a warning below 0.5%', () => {
    render(<SlippageSelector slippage={0.1} onChange={() => {}} />)

    expect(screen.getByText('0.10%')).toBeInTheDocument()
    expect(screen.getByText(/Low slippage — your transaction may fail/)).toBeInTheDocument()
  })

  it('hides the warning at 0.5% and above', () => {
    render(<SlippageSelector slippage={0.5} onChange={() => {}} />)

    expect(screen.getByText('0.50%')).toBeInTheDocument()
    expect(screen.queryByText(/Low slippage/)).not.toBeInTheDocument()
  })

  it('opens the preset popover and reports the chosen value', () => {
    const onChange = vi.fn()
    render(<SlippageSelector slippage={0.1} onChange={onChange} />)

    fireEvent.click(screen.getByText('0.10%')) // badge toggles the popover
    fireEvent.click(screen.getByRole('button', { name: '1.00%' }))

    expect(onChange).toHaveBeenCalledWith(1)
    // Popover closes after picking.
    expect(screen.queryByRole('button', { name: '0.50%' })).not.toBeInTheDocument()
  })

  it('highlights the active preset inside the popover', () => {
    const { container } = render(<SlippageSelector slippage={0.5} onChange={() => {}} />)

    fireEvent.click(screen.getByText('0.50%'))
    const presets = [...container.querySelectorAll<HTMLButtonElement>('.flux-slip')]
    expect(presets.map((b) => b.textContent)).toEqual(['0.10%', '0.50%', '1.00%'])
    expect(presets[1]).toHaveClass('flux-slip-on')
    expect(presets[2]).not.toHaveClass('flux-slip-on')
  })
})
