// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import WalletAvatar from './WalletAvatar'

afterEach(cleanup)

describe('<WalletAvatar />', () => {
  it('shows the brand icon for a known wallet id', () => {
    render(<WalletAvatar id="metamask" color="#f6851b" letter="M" />)
    expect(screen.getByAltText('metamask')).toBeInTheDocument()
  })

  it('falls back to a coloured letter tile for unknown ids', () => {
    render(<WalletAvatar id="unknown-wallet" color="#123456" letter="U" />)

    expect(screen.getByText('U')).toBeInTheDocument()
    expect(screen.getByText('U')).toHaveStyle({ background: '#123456' })
  })

  it('falls back to the letter tile when the icon fails to load', () => {
    render(<WalletAvatar id="phantom" color="#ab9ff2" letter="P" />)

    fireEvent.error(screen.getByAltText('phantom'))
    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('applies the large variant class', () => {
    const { container } = render(<WalletAvatar id="unknown" color="#000" letter="X" size="lg" />)
    expect(container.querySelector('.flux-wallet-avatar-lg')).toBeInTheDocument()
  })
})
