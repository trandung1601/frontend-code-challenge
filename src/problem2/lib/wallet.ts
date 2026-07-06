import walletsConfig from './wallets.json'

// Wallet providers offered in the "Connect wallet" modal. Metadata is
// config-driven (see wallets.json) so providers can be added without touching
// component code.
export type WalletProvider = {
  id: string
  name: string
  description: string
  letter: string
  color: string
  chain: 'evm' | 'solana'
  icon: string
}

export const WALLET_PROVIDERS = walletsConfig.wallets as WalletProvider[]

// A connected session — purely for demo, no real chain interaction.
export type ConnectedWallet = {
  provider: WalletProvider
  address: string
}

// ── Session persistence ──
// A connected wallet (plus the selected network) is stored in localStorage for
// 5 minutes (same naming scheme as 'flux-swap-history') so it survives
// reloads, then expires.
const SESSION_KEY = 'flux-wallet-session'
export const SESSION_TTL_MS = 5 * 60_000

type StoredSession = { wallet: ConnectedWallet; networkId?: string; expiresAt: number }

// Read and validate the stored session; drops it from storage if expired.
function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as StoredSession
    if (!session?.wallet?.address || typeof session.expiresAt !== 'number') return null
    if (Date.now() >= session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function saveWalletSession(wallet: ConnectedWallet, networkId?: string) {
  try {
    const session: StoredSession = { wallet, networkId, expiresAt: Date.now() + SESSION_TTL_MS }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* storage unavailable — session lives in memory only */
  }
}

// Patch the network on an existing session without extending its expiry.
export function updateWalletSessionNetwork(networkId: string) {
  const session = readSession()
  if (!session) return
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, networkId }))
  } catch {
    /* storage unavailable */
  }
}

export function clearWalletSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* nothing to clear */
  }
}

// Returns the stored wallet if it exists and hasn't expired.
export function loadWalletSession(): ConnectedWallet | null {
  return readSession()?.wallet ?? null
}

// Network id saved with the session (null if none stored / expired).
export function loadWalletSessionNetworkId(): string | null {
  return readSession()?.networkId ?? null
}

// Milliseconds until the stored session expires (null if none) — lets the
// page schedule an auto-disconnect at the exact expiry moment.
export function walletSessionRemainingMs(): number | null {
  const session = readSession()
  return session ? Math.max(0, session.expiresAt - Date.now()) : null
}

// Generate a random, throwaway demo address in the shape the provider expects.
// EVM → 0x + 40 hex chars · Solana → 44 base58 chars. Not a real key/account.
export function randomAddress(chain: WalletProvider['chain']): string {
  const rand = (chars: string, len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

  if (chain === 'solana') {
    return rand('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 44)
  }
  return '0x' + rand('0123456789abcdef', 40)
}

// 0x1234…cd34 — for compact display in the header.
export function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
