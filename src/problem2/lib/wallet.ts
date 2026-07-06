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
