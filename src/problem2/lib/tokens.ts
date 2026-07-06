// ── Token domain model + helpers ─────────────────────────────────────────────

export type Token = {
  symbol: string // currency code from the price feed, e.g. "ETH"
  name: string // human-friendly name
  price: number // USD price
  balance: number // mocked wallet balance
}

// Raw shape returned by https://interview.switcheo.com/prices.json
export type PriceRow = {
  currency: string
  date: string
  price: number
}

export const PRICES_URL = 'https://interview.switcheo.com/prices.json'

// Token icons live in the Switcheo repo, one SVG per symbol.
export const iconUrl = (symbol: string) =>
  `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`

// A few friendlier display names; anything unmapped falls back to its symbol.
const NAMES: Record<string, string> = {
  ETH: 'Ethereum',
  WETH: 'Wrapped Ether',
  USDC: 'USD Coin',
  USD: 'US Dollar',
  BUSD: 'Binance USD',
  USDT: 'Tether',
  axlUSDC: 'Axelar USDC',
  bNEO: 'BurgerNEO',
  BLUR: 'Blur',
  GMX: 'GMX',
  LUNA: 'Terra Luna',
  ATOM: 'Cosmos',
  OSMO: 'Osmosis',
  SWTH: 'Switcheo',
  KUJI: 'Kujira',
  IRIS: 'IRISnet',
  STRD: 'Stride',
  EVMOS: 'Evmos',
  RATOM: 'Staked ATOM',
  ampLUNA: 'Amplified LUNA',
  ZIL: 'Zilliqa',
  WBTC: 'Wrapped Bitcoin',
}

export const displayName = (symbol: string) => NAMES[symbol] ?? symbol

// Which chain a token lives on — drives the cross-chain bridge warning.
const CHAINS: Record<string, string> = {
  ETH: 'Ethereum',
  WETH: 'Ethereum',
  WBTC: 'Ethereum',
  USDC: 'Ethereum',
  USDT: 'Ethereum',
  BUSD: 'Ethereum',
  DAI: 'Ethereum',
  BLUR: 'Ethereum',
  GMX: 'Arbitrum',
  SOL: 'Solana',
  ZIL: 'Zilliqa',
  SWTH: 'Carbon',
  bNEO: 'Neo',
  ATOM: 'Cosmos',
  OSMO: 'Osmosis',
  LUNA: 'Terra',
  KUJI: 'Kujira',
  EVMOS: 'Evmos',
  IRIS: 'IRISnet',
  STRD: 'Stride',
}

export const chainOf = (symbol: string) => CHAINS[symbol] ?? 'Carbon'

// A representative token symbol whose icon stands in for each chain — used for
// the little network badge overlaid on a token's icon.
const CHAIN_ICON: Record<string, string> = {
  Ethereum: 'ETH',
  Arbitrum: 'ETH',
  Solana: 'SOL',
  Zilliqa: 'ZIL',
  Carbon: 'SWTH',
  Neo: 'bNEO',
  Cosmos: 'ATOM',
  Osmosis: 'OSMO',
  Terra: 'LUNA',
  Kujira: 'KUJI',
  Evmos: 'EVMOS',
  IRISnet: 'IRIS',
  Stride: 'STRD',
}

export const chainIconSymbol = (symbol: string) => CHAIN_ICON[chainOf(symbol)] ?? symbol

// Tokens we want to surface at the top of the picker + as sensible defaults.
export const POPULAR = ['ETH', 'USDC', 'USDT', 'WBTC', 'ATOM', 'SWTH', 'OSMO', 'ZIL']

// Deterministic pseudo-random so a token always shows the same mock balance.
function seededBalance(symbol: string): number {
  let h = 0
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) >>> 0
  // Stablecoins get a chunky balance, everything else a spread of sizes.
  if (/USD|DAI/i.test(symbol)) return 1000 + (h % 9000)
  const magnitudes = [0, 0.5, 2, 12, 80, 500]
  const base = magnitudes[h % magnitudes.length]
  return +(base + (h % 1000) / 1000 * base).toFixed(4)
}

// Collapse the raw feed (which repeats currencies) into one Token per symbol,
// keeping the most recent price and dropping anything without a usable price.
export function buildTokens(rows: PriceRow[]): Token[] {
  const latest = new Map<string, PriceRow>()
  for (const row of rows) {
    if (!row.price || row.price <= 0) continue
    const prev = latest.get(row.currency)
    if (!prev || new Date(row.date) >= new Date(prev.date)) latest.set(row.currency, row)
  }

  const tokens = [...latest.values()].map<Token>((row) => ({
    symbol: row.currency,
    name: displayName(row.currency),
    price: row.price,
    balance: seededBalance(row.currency),
  }))

  // Popular first (in listed order), then the rest alphabetically.
  return tokens.sort((a, b) => {
    const ia = POPULAR.indexOf(a.symbol)
    const ib = POPULAR.indexOf(b.symbol)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    return a.symbol.localeCompare(b.symbol)
  })
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatAmount(n: number): string {
  if (!isFinite(n) || n === 0) return '0'
  if (n < 0.0001) return n.toExponential(2)
  const decimals = n < 1 ? 6 : n < 1000 ? 4 : 2
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals })
}

export function formatUsd(n: number): string {
  if (!isFinite(n)) return '$0.00'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n < 1 ? 4 : 2,
  })
}
