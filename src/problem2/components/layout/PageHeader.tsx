import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSun, FiMoon, FiCreditCard, FiCopy, FiCheck, FiLogOut, FiChevronDown, FiRepeat } from 'react-icons/fi'
import { truncateAddress, type ConnectedWallet } from '../../lib/wallet'
import { formatUsd, formatAmount, iconUrl, type Token } from '../../lib/tokens'
import { SwitchNetworkModal } from '../modals'
import WalletAvatar from '../ui/WalletAvatar'
import TokenIcon from '../ui/TokenIcon'
import { NETWORKS, type Network } from '../../lib/networks'

export { NETWORKS }
export type { Network }

export type View = 'swap' | 'history'

export default function PageHeader({
  dark,
  onToggleDark,
  wallet,
  tokens,
  view,
  onView,
  network,
  onNetworkChange,
  onConnectWallet,
  onDisconnect,
}: {
  dark: boolean
  onToggleDark: () => void
  wallet: ConnectedWallet | null
  tokens: Token[]
  view: View
  onView: (v: View) => void
  network: Network
  onNetworkChange: (n: Network) => void
  onConnectWallet: () => void
  onDisconnect: () => void
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [networkOpen, setNetworkOpen] = useState(false)
  const [pendingNetwork, setPendingNetwork] = useState<Network | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const walletPanelOpen = open && Boolean(wallet)

  const totalUsd = tokens.reduce((sum, t) => sum + t.balance * t.price, 0)
  const topTokens = [...tokens]
    .filter((t) => t.balance > 0)
    .sort((a, b) => b.balance * b.price - a.balance * a.price)
    .slice(0, 5)

  useEffect(() => {
    if (!walletPanelOpen) return
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [walletPanelOpen])

  function copyAddress() {
    if (!wallet) return
    navigator.clipboard.writeText(wallet.address).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="flex items-center justify-between px-5 sm:px-8 h-[68px] shrink-0">
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer"
          title="Back to challenges"
        >
          <span className="flux-logo">9</span>
          <span className="text-[19px] font-extrabold tracking-tight" style={{ color: 'var(--f-fg)' }}>
            99Tech Swap
          </span>
        </button>
        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => onView('swap')}
            className={`flux-nav ${view === 'swap' ? 'flux-nav-on' : ''}`}
          >
            Swap
          </button>
          <button
            onClick={() => onView('history')}
            className={`flux-nav ${view === 'history' ? 'flux-nav-on' : ''}`}
          >
            History
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="flux-chip hidden sm:flex">
          <span className="flux-dot" /> Multi-chain
        </span>
        <button onClick={onToggleDark} className="flux-icon-btn" title="Toggle theme">
          {dark ? <FiSun /> : <FiMoon />}
        </button>

        {wallet ? (
          <div className="flux-wallet-wrap" ref={wrapRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flux-wallet-badge"
              title="Wallet info"
            >
              <WalletAvatar id={wallet.provider.id} color={wallet.provider.color} letter={wallet.provider.letter} />
              {tokens.length > 0 && (
                <span className="flux-wallet-bal">{formatUsd(totalUsd)}</span>
              )}
              <FiChevronDown
                className="flux-wallet-chevron"
                style={{ transform: walletPanelOpen ? 'rotate(180deg)' : undefined }}
              />
            </button>

            {walletPanelOpen && (
              <div className="flux-wallet-panel flux-card">
                {/* Top: wallet name + disconnect icon */}
                <div className="flux-wp-header">
                  <div className="flux-wp-provider">
                    <WalletAvatar id={wallet.provider.id} color={wallet.provider.color} letter={wallet.provider.letter} size="lg" />
                    <div>
                      <div className="flux-wp-name">{wallet.provider.name}</div>
                      <div className="flux-wp-chain">{wallet.provider.chain.toUpperCase()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setOpen(false); onDisconnect() }}
                    className="flux-wp-disconnect"
                    title="Disconnect wallet"
                  >
                    <FiLogOut />
                  </button>
                </div>

                {/* Address + copy */}
                <div className="flux-wp-addr-row">
                  <span className="flux-mono flux-wp-addr">{truncateAddress(wallet.address)}</span>
                  <button onClick={copyAddress} className="flux-wp-copy" title="Copy address">
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>

                {/* Wallet + Network blocks */}
                <div className="flux-wp-blocks">
                  <button
                    className="flux-wp-block flux-wp-block-btn"
                    onClick={() => { setOpen(false); onConnectWallet() }}
                    title="Switch wallet"
                  >
                    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="9" width="36" height="23" rx="6" fill="#1e2740"/>
                      <rect x="6" y="14" width="20" height="12" rx="3" fill="url(#wg)"/>
                      <rect x="8" y="17" width="6" height="4" rx="1" fill="rgba(255,210,80,0.85)"/>
                      <rect x="8" y="23" width="8" height="1.5" rx="0.75" fill="rgba(255,255,255,0.35)"/>
                      <rect x="28" y="13" width="8" height="12" rx="3" fill="#252e4b"/>
                      <circle cx="32" cy="19" r="3" fill="#f5b84a"/>
                      <defs>
                        <linearGradient id="wg" x1="6" y1="14" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#6366f1"/>
                          <stop offset="55%" stopColor="#a855f7"/>
                          <stop offset="100%" stopColor="#0ea5e9"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="flux-wp-block-label">
                      {wallet.provider.name}
                      <FiRepeat className="flux-wp-block-switch" />
                    </span>
                  </button>

                  <div className="flux-wp-block-divider" />

                  <button
                    className="flux-wp-block flux-wp-block-btn"
                    onClick={() => setNetworkOpen((v) => !v)}
                    title="Switch network"
                  >
                    <TokenIcon symbol={network.icon} size={32} />
                    <span className="flux-wp-block-label">
                      {network.name}
                      <FiChevronDown className="flux-wp-block-switch" style={{ transform: networkOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
                    </span>
                  </button>
                </div>

                {/* Network picker */}
                {networkOpen && (
                  <div className="flux-wp-network-list">
                    {NETWORKS.map((n) => (
                      <button
                        key={n.id}
                        className={`flux-wp-network-row ${n.id === network.id ? 'flux-wp-network-row-on' : ''}`}
                        onClick={() => { setNetworkOpen(false); setPendingNetwork(n) }}
                      >
                        <TokenIcon symbol={n.icon} size={22} />
                        <span className="flux-wp-network-name">{n.name}</span>
                        {n.id === network.id && <FiCheck className="flux-wp-network-check" />}
                      </button>
                    ))}
                  </div>
                )}

                {tokens.length > 0 && (
                  <>
                    {/* Total balance */}
                    <div className="flux-wp-section-label">Total Balance</div>
                    <div className="flux-wp-total">{formatUsd(totalUsd)}</div>

                    {/* Token list */}
                    <div className="flux-wp-section-label">Tokens</div>
                    <div className="flux-wp-tokens">
                      {topTokens.map((t) => (
                        <div key={t.symbol} className="flux-wp-token-row">
                          <img
                            src={iconUrl(t.symbol)}
                            alt={t.symbol}
                            className="flux-wp-token-icon"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <div className="flux-wp-token-info">
                            <span className="flux-wp-token-sym">{t.symbol}</span>
                            <span className="flux-wp-token-bal">{formatAmount(t.balance)}</span>
                          </div>
                          <span className="flux-wp-token-usd">{formatUsd(t.balance * t.price)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <button onClick={onConnectWallet} className="flux-btn flex items-center gap-2 px-4 sm:px-[18px] py-2">
            Connect wallet
            <FiCreditCard className="text-[16px]" />
          </button>
        )}

        {wallet && pendingNetwork && (
          <SwitchNetworkModal
            from={network}
            to={pendingNetwork}
            onConfirm={() => { onNetworkChange(pendingNetwork); setPendingNetwork(null) }}
            onCancel={() => setPendingNetwork(null)}
          />
        )}
      </div>
    </header>
  )
}
