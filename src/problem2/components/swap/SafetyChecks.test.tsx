// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SafetyChecks from './SafetyChecks'

afterEach(cleanup)

describe('<SafetyChecks />', () => {
  it('renders all four checks with formatted values', () => {
    render(<SafetyChecks priceImpact={0.42} networkFee={1.85} slippage={0.5} />)

    expect(screen.getByText('Token verified')).toBeInTheDocument()
    expect(screen.getByText('Pass')).toBeInTheDocument()
    expect(screen.getByText('0.42%')).toBeInTheDocument()
    expect(screen.getByText('$1.85')).toBeInTheDocument()
    expect(screen.getByText('0.5%')).toBeInTheDocument()
  })

  it('flags high price impact above 3%', () => {
    const { container } = render(<SafetyChecks priceImpact={4.2} networkFee={1.85} slippage={0.5} />)
    // Price impact + network fee warn → two amber checks.
    expect(container.querySelectorAll('.flux-check-warn')).toHaveLength(2)
  })

  it('keeps low price impact green', () => {
    const { container } = render(<SafetyChecks priceImpact={0.4} networkFee={1.85} slippage={0.5} />)
    // Only the always-warn network fee row is amber.
    expect(container.querySelectorAll('.flux-check-warn')).toHaveLength(1)
  })
})
