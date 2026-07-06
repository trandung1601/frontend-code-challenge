// Chains the app can switch between. `icon` is a token symbol whose logo stands
// in for the network (resolved through the shared token-icon repo).
export type Network = { id: string; name: string; color: string; rpc: string; icon: string }

export const NETWORKS: Network[] = [
  { id: 'ethereum',  name: 'Ethereum',  color: '#627EEA', rpc: 'https://mainnet.infura.io/v3/',    icon: 'ETH' },
  { id: 'bnb',       name: 'BNB Chain', color: '#F0B90B', rpc: 'https://bsc-dataseed.binance.org',  icon: 'BNB' },
  { id: 'polygon',   name: 'Polygon',   color: '#8247E5', rpc: 'https://polygon-rpc.com',           icon: 'MATIC' },
  { id: 'arbitrum',  name: 'Arbitrum',  color: '#28A0F0', rpc: 'https://arb1.arbitrum.io/rpc',      icon: 'ARB' },
  { id: 'optimism',  name: 'Optimism',  color: '#FF0420', rpc: 'https://mainnet.optimism.io',       icon: 'OP' },
  { id: 'avalanche', name: 'Avalanche', color: '#E84142', rpc: 'https://api.avax.network/ext/bc/C', icon: 'AVAX' },
  { id: 'solana',    name: 'Solana',    color: '#14F195', rpc: 'https://api.mainnet-beta.solana.com', icon: 'SOL' },
  { id: 'fantom',    name: 'Fantom',    color: '#1969FF', rpc: 'https://rpc.ftm.tools',             icon: 'FTM' },
  { id: 'cosmos',    name: 'Cosmos',    color: '#2E3148', rpc: 'https://rpc.cosmos.network',        icon: 'ATOM' },
  { id: 'celo',      name: 'Celo',      color: '#35D07F', rpc: 'https://forno.celo.org',            icon: 'CELO' },
  { id: 'near',      name: 'NEAR',      color: '#111111', rpc: 'https://rpc.mainnet.near.org',      icon: 'NEAR' },
]
