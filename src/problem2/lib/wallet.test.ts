import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearWalletSession,
  loadWalletSession,
  loadWalletSessionNetworkId,
  randomAddress,
  saveWalletSession,
  truncateAddress,
  updateWalletSessionNetwork,
  walletSessionRemainingMs,
  SESSION_TTL_MS,
  WALLET_PROVIDERS,
  type ConnectedWallet,
} from './wallet'

const SESSION_KEY = 'flux-wallet-session'

// Minimal localStorage stub — the vitest environment is 'node', which has none.
function installLocalStorage() {
  const store = new Map<string, string>()
  const stub = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => void store.clear(),
  }
  vi.stubGlobal('localStorage', stub)
  return stub
}

function demoWallet(): ConnectedWallet {
  const provider = WALLET_PROVIDERS[0]
  return { provider, address: randomAddress(provider.chain) }
}

describe('wallet session persistence', () => {
  beforeEach(() => {
    installLocalStorage()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-06T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('round-trips a saved wallet within the TTL', () => {
    const wallet = demoWallet()
    saveWalletSession(wallet, 'ethereum')

    expect(loadWalletSession()).toEqual(wallet)
    expect(loadWalletSessionNetworkId()).toBe('ethereum')
  })

  it('returns null when nothing is stored', () => {
    expect(loadWalletSession()).toBeNull()
    expect(loadWalletSessionNetworkId()).toBeNull()
    expect(walletSessionRemainingMs()).toBeNull()
  })

  it('expires the session after SESSION_TTL_MS and drops it from storage', () => {
    saveWalletSession(demoWallet(), 'bnb')

    vi.advanceTimersByTime(SESSION_TTL_MS - 1)
    expect(loadWalletSession()).not.toBeNull()

    vi.advanceTimersByTime(1) // exactly at expiry
    expect(loadWalletSession()).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull() // dropped, not just ignored
    expect(loadWalletSessionNetworkId()).toBeNull()
  })

  it('reports remaining ms and counts down over time', () => {
    saveWalletSession(demoWallet())
    expect(walletSessionRemainingMs()).toBe(SESSION_TTL_MS)

    vi.advanceTimersByTime(60_000)
    expect(walletSessionRemainingMs()).toBe(SESSION_TTL_MS - 60_000)
  })

  it('updates the network on a live session without extending its expiry', () => {
    saveWalletSession(demoWallet(), 'ethereum')
    vi.advanceTimersByTime(120_000)

    updateWalletSessionNetwork('solana')

    expect(loadWalletSessionNetworkId()).toBe('solana')
    // TTL unchanged: still 5min from the original save, not from the update.
    expect(walletSessionRemainingMs()).toBe(SESSION_TTL_MS - 120_000)
  })

  it('does not create a session when patching the network with none stored', () => {
    updateWalletSessionNetwork('polygon')
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
    expect(loadWalletSessionNetworkId()).toBeNull()
  })

  it('clearWalletSession removes the stored session', () => {
    saveWalletSession(demoWallet(), 'ethereum')
    clearWalletSession()
    expect(loadWalletSession()).toBeNull()
  })

  it('treats corrupted or malformed payloads as no session', () => {
    localStorage.setItem(SESSION_KEY, 'not-json{{{')
    expect(loadWalletSession()).toBeNull()

    localStorage.setItem(SESSION_KEY, JSON.stringify({ wallet: { address: null }, expiresAt: 'soon' }))
    expect(loadWalletSession()).toBeNull()

    localStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt: Date.now() + 1000 }))
    expect(loadWalletSession()).toBeNull()
  })

  it('survives an unavailable localStorage (private browsing) without throwing', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
      removeItem: () => { throw new Error('denied') },
    })

    expect(() => saveWalletSession(demoWallet(), 'ethereum')).not.toThrow()
    expect(loadWalletSession()).toBeNull()
    expect(() => clearWalletSession()).not.toThrow()
    expect(walletSessionRemainingMs()).toBeNull()
  })
})

describe('address helpers', () => {
  it('randomAddress shapes EVM and Solana addresses correctly', () => {
    expect(randomAddress('evm')).toMatch(/^0x[0-9a-f]{40}$/)
    expect(randomAddress('solana')).toMatch(/^[1-9A-HJ-NP-Za-km-z]{44}$/) // base58, no 0/O/I/l
  })

  it('truncateAddress keeps short addresses and compacts long ones', () => {
    expect(truncateAddress('0x12345678')).toBe('0x12345678')
    const addr = '0x' + 'ab'.repeat(20)
    expect(truncateAddress(addr)).toBe('0xabab…abab')
  })
})
