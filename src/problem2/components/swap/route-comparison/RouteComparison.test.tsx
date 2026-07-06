// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import RouteComparison from './RouteComparison'

afterEach(cleanup)

describe('<RouteComparison />', () => {
  it('lists the three aggregators with the best route marked', () => {
    render(<RouteComparison receive={1000} toSymbol="USDC" hasAmount />)

    expect(screen.getByText('99Route')).toBeInTheDocument()
    expect(screen.getByText('OrbitX')).toBeInTheDocument()
    expect(screen.getByText('NovaDEX')).toBeInTheDocument()
    expect(screen.getByText('Best')).toBeInTheDocument()
  })

  it('derives each route’s output from its delta', () => {
    render(<RouteComparison receive={1000} toSymbol="USDC" hasAmount />)

    expect(screen.getByText('1,000 USDC')).toBeInTheDocument() // best, delta 0
    expect(screen.getByText('996.2 USDC')).toBeInTheDocument() // −0.38%
    expect(screen.getByText('993.1 USDC')).toBeInTheDocument() // −0.69%
  })

  it('shows placeholders when no amount is entered', () => {
    render(<RouteComparison receive={0} toSymbol="USDC" hasAmount={false} />)
    expect(screen.getAllByText('— USDC')).toHaveLength(3)
  })
})
