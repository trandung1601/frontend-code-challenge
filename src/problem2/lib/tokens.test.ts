import { describe, expect, it } from 'vitest'
import {
  buildTokens,
  chainIconSymbol,
  chainOf,
  displayName,
  formatAmount,
  formatUsd,
  iconUrl,
  POPULAR,
  type PriceRow,
} from './tokens'

const row = (currency: string, price: number, date = '2023-08-29T09:00:00.000Z'): PriceRow => ({
  currency,
  price,
  date,
})

describe('buildTokens', () => {
  it('collapses repeated currencies, keeping the most recent price', () => {
    const tokens = buildTokens([
      row('ETH', 1000, '2023-08-29T08:00:00.000Z'),
      row('ETH', 1646, '2023-08-29T09:00:00.000Z'), // newer wins
      row('ETH', 900, '2023-08-28T09:00:00.000Z'), // older, arrives last
    ])

    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatchObject({ symbol: 'ETH', price: 1646 })
  })

  it('drops rows without a usable price', () => {
    const tokens = buildTokens([row('GOOD', 1.5), row('ZERO', 0), row('NEG', -3)])
    expect(tokens.map((t) => t.symbol)).toEqual(['GOOD'])
  })

  it('sorts popular tokens first (in POPULAR order), then the rest alphabetically', () => {
    const tokens = buildTokens([
      row('ZIL', 0.01),
      row('BLUR', 0.2),
      row('USDC', 1),
      row('ATOM', 7),
      row('ETH', 1646),
    ])
    const symbols = tokens.map((t) => t.symbol)

    // Popular subset keeps POPULAR's relative order…
    const popular = symbols.filter((s) => POPULAR.includes(s))
    expect(popular).toEqual(['ETH', 'USDC', 'ATOM', 'ZIL'])
    // …and non-popular tokens follow.
    expect(symbols.indexOf('BLUR')).toBeGreaterThan(symbols.indexOf('ZIL'))
  })

  it('assigns deterministic mock balances (same symbol → same balance)', () => {
    const [a] = buildTokens([row('ETH', 1646)])
    const [b] = buildTokens([row('ETH', 999)]) // price differs, balance must not
    expect(a.balance).toBe(b.balance)
    expect(a.balance).toBeGreaterThan(0)
  })

  it('gives stablecoins a chunky 1k–10k balance', () => {
    const tokens = buildTokens([row('USDC', 1), row('USDT', 1), row('BUSD', 1)])
    for (const t of tokens) {
      expect(t.balance).toBeGreaterThanOrEqual(1000)
      expect(t.balance).toBeLessThan(10000)
    }
  })

  it('resolves display names with symbol fallback', () => {
    const tokens = buildTokens([row('ETH', 1646), row('WEIRDCOIN', 2)])
    expect(tokens.find((t) => t.symbol === 'ETH')?.name).toBe('Ethereum')
    expect(tokens.find((t) => t.symbol === 'WEIRDCOIN')?.name).toBe('WEIRDCOIN')
  })
})

describe('token metadata helpers', () => {
  it('displayName maps known symbols and falls back to the symbol', () => {
    expect(displayName('USDC')).toBe('USD Coin')
    expect(displayName('XYZ')).toBe('XYZ')
  })

  it('chainOf maps known tokens and defaults to Carbon', () => {
    expect(chainOf('ETH')).toBe('Ethereum')
    expect(chainOf('GMX')).toBe('Arbitrum')
    expect(chainOf('UNKNOWN')).toBe('Carbon')
  })

  it('chainIconSymbol returns the badge symbol for the token’s chain', () => {
    expect(chainIconSymbol('USDC')).toBe('ETH') // Ethereum badge
    expect(chainIconSymbol('OSMO')).toBe('OSMO') // its own chain’s icon
    expect(chainIconSymbol('UNKNOWN')).toBe('SWTH') // Carbon fallback
  })

  it('iconUrl points at the Switcheo token-icons repo', () => {
    expect(iconUrl('ETH')).toBe(
      'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg',
    )
  })
})

describe('formatAmount', () => {
  it('handles zero and non-finite values', () => {
    expect(formatAmount(0)).toBe('0')
    expect(formatAmount(NaN)).toBe('0')
    expect(formatAmount(Infinity)).toBe('0')
  })

  it('uses exponential notation for dust amounts', () => {
    expect(formatAmount(0.00005)).toBe('5.00e-5')
  })

  it('scales decimal places with magnitude', () => {
    expect(formatAmount(0.123456789)).toBe('0.123457') // < 1 → 6 dp
    expect(formatAmount(12.34567)).toBe('12.3457') // < 1000 → 4 dp
    expect(formatAmount(1646.128)).toBe('1,646.13') // ≥ 1000 → 2 dp + separator
  })
})

describe('formatUsd', () => {
  it('formats as USD currency with separators', () => {
    expect(formatUsd(3291.87)).toBe('$3,291.87')
  })

  it('keeps extra precision below a dollar', () => {
    expect(formatUsd(0.1821)).toBe('$0.1821')
  })

  it('handles non-finite input', () => {
    expect(formatUsd(NaN)).toBe('$0.00')
  })
})
