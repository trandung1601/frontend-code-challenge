// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import TokenIcon from './TokenIcon'
import { iconUrl } from '../../lib/tokens'

afterEach(cleanup)

describe('<TokenIcon />', () => {
  it('renders the Switcheo icon for the symbol', () => {
    render(<TokenIcon symbol="ETH" size={24} />)

    const img = screen.getByAltText('ETH')
    expect(img).toHaveAttribute('src', iconUrl('ETH'))
    expect(img).toHaveAttribute('width', '24')
  })

  it('falls back to a two-letter monogram when the icon 404s', () => {
    render(<TokenIcon symbol="wxyz" size={24} />)

    fireEvent.error(screen.getByAltText('wxyz'))

    expect(screen.queryByAltText('wxyz')).not.toBeInTheDocument()
    expect(screen.getByText('WX')).toBeInTheDocument() // first two letters, uppercased
  })
})
