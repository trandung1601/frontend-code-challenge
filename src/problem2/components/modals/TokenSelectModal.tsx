import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi'
import TokenIcon from '../ui/TokenIcon'
import SwitchNetworkModal from './SwitchNetworkModal'
import { chainOf, formatAmount, formatUsd, type Token } from '../../lib/tokens'
import { NETWORKS, type Network } from '../../lib/networks'
import './TokenSelectModal.scss'

export default function TokenSelectModal({
  tokens,
  selected,
  disabledSymbol,
  onSelect,
  onClose,
  network,
  onNetworkChange,
}: {
  tokens: Token[]
  selected: string
  disabledSymbol?: string
  onSelect: (t: Token) => void
  onClose: () => void
  network: Network
  onNetworkChange: (n: Network) => void
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Switching networks asks for confirmation via SwitchNetworkModal; the
  // committed selection lives in the parent so header + swap stay in sync.
  const [pendingNetwork, setPendingNetwork] = useState<Network | null>(null)
  const [netExpanded, setNetExpanded] = useState(false)

  // Selected chain pinned to the front; the rest collapse behind a "+N" toggle.
  const NET_VISIBLE = 7
  const orderedNets = useMemo(
    () => [network, ...NETWORKS.filter((n) => n.id !== network.id)],
    [network],
  )
  const shownNets = netExpanded ? orderedNets : orderedNets.slice(0, NET_VISIBLE)
  const hiddenNets = orderedNets.length - NET_VISIBLE

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tokens
    return tokens.filter(
      (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
    )
  }, [tokens, query])

  return createPortal(
    <div
      className="flux"
      data-flux-theme={document.querySelector('[data-flux-theme]')?.getAttribute('data-flux-theme') ?? 'dark'}
      style={{ display: 'contents' }}
    >
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'fadeIn .18s ease' }}
      onClick={onClose}
    >
      <div
        className="flux-card w-full max-w-md flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: '78vh', animation: 'fadeUp .26s cubic-bezier(0.22,1,0.36,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-[17px] font-bold m-0" style={{ color: 'var(--f-fg)' }}>Select a token</h3>
          <button onClick={onClose} className="flux-icon-btn" style={{ width: 32, height: 32 }}>
            <FiX />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flux-search">
            <FiSearch className="text-[16px]" style={{ color: 'var(--f-muted)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or symbol"
              className="flex-1 bg-transparent border-0 outline-none text-[15px]"
              style={{ color: 'var(--f-fg)' }}
            />
          </div>
        </div>

        {/* Network filter — clicking a different chain asks to switch network. */}
        <div className="flux-net px-5 pb-3">
          <div className="flux-net-label">Network: {network.name}</div>
          <div className="flux-net-icons">
            {shownNets.map((n) => (
              <button
                key={n.id}
                onClick={() => n.id !== network.id && setPendingNetwork(n)}
                className={`flux-net-btn ${n.id === network.id ? 'flux-net-btn-on' : ''}`}
                title={n.name}
              >
                <TokenIcon symbol={n.icon} size={26} />
              </button>
            ))}
            {hiddenNets > 0 && (
              <button
                onClick={() => setNetExpanded((v) => !v)}
                className="flux-net-more"
                title={netExpanded ? 'Show fewer networks' : 'Show more networks'}
              >
                +{hiddenNets}
                <FiChevronDown style={{ transform: netExpanded ? 'rotate(180deg)' : undefined }} />
              </button>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--f-card-brd)' }} />

        <div className="overflow-y-auto flex-1 py-2">
          {filtered.length === 0 && (
            <p className="text-center text-[14px] py-10" style={{ color: 'var(--f-muted)' }}>
              No tokens match "{query}".
            </p>
          )}
          {filtered.map((t) => {
            const active = t.symbol === selected
            const disabled = t.symbol === disabledSymbol
            return (
              <button
                key={t.symbol}
                onClick={() => onSelect(t)}
                disabled={disabled}
                className="flux-token-row disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <TokenIcon symbol={t.symbol} size={36} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold" style={{ color: 'var(--f-fg)' }}>{t.symbol}</span>
                    {active && <span className="flux-badge-best">Selected</span>}
                  </div>
                  <div className="text-[12px] truncate" style={{ color: 'var(--f-muted)' }}>
                    {t.name} · {chainOf(t.symbol)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flux-mono text-[14px]" style={{ color: 'var(--f-fg)' }}>{formatAmount(t.balance)}</div>
                  <div className="text-[12px]" style={{ color: 'var(--f-muted)' }}>{formatUsd(t.price)}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>

    {pendingNetwork && (
      <SwitchNetworkModal
        from={network}
        to={pendingNetwork}
        onConfirm={() => { onNetworkChange(pendingNetwork); setPendingNetwork(null) }}
        onCancel={() => setPendingNetwork(null)}
      />
    )}
    </div>,
    document.body
  )
}
