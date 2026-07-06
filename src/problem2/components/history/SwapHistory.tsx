import { FiClock, FiArrowRight, FiTrash2, FiMapPin, FiCreditCard } from 'react-icons/fi'
import { iconUrl, formatAmount, formatUsd } from '../../lib/tokens'
import { truncateAddress } from '../../lib/wallet'
import type { SwapRecord } from '../../hooks/useSwapHistory'
import './SwapHistory.scss'

function timeAgo(t: number): string {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function TokenChip({ symbol, amount }: { symbol: string; amount: number }) {
  return (
    <div className="flux-hist-token">
      <img
        src={iconUrl(symbol)}
        alt={symbol}
        className="flux-hist-icon"
        onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
      />
      <div className="flux-hist-token-info">
        <span className="flux-hist-amt">{formatAmount(amount)}</span>
        <span className="flux-hist-sym">{symbol}</span>
      </div>
    </div>
  )
}

export default function SwapHistory({
  history,
  onClear,
  connected,
  onConnect,
}: {
  history: SwapRecord[]
  onClear: () => void
  connected: boolean
  onConnect: () => void
}) {
  return (
    <div className="w-full max-w-[460px] mx-auto flux-fade">
      <div className="flux-card px-5 py-5">
        <div className="flux-hist-head">
          <span className="flux-hist-title">
            <FiClock /> Swap history
          </span>
          {connected && history.length > 0 && (
            <button onClick={onClear} className="flux-hist-clear" title="Clear history">
              <FiTrash2 /> Clear
            </button>
          )}
        </div>

        {!connected ? (
          <div className="flux-hist-empty">
            <span className="flux-check" style={{ width: 44, height: 44, fontSize: 20 }}>
              <FiCreditCard />
            </span>
            <p className="flux-hist-empty-title">Wallet not connected</p>
            <span className="flux-hist-empty-sub">Connect your wallet to view your swap history.</span>
            <button onClick={onConnect} className="flux-btn flex items-center gap-2 px-4 py-2 mt-1">
              Connect wallet
              <FiCreditCard className="text-[15px]" />
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="flux-hist-empty">
            <span className="flux-check" style={{ width: 44, height: 44, fontSize: 20 }}>
              <FiClock />
            </span>
            <p className="flux-hist-empty-title">No swaps yet</p>
            <span className="flux-hist-empty-sub">Your completed swaps will show up here.</span>
          </div>
        ) : (
          <div className="flux-hist-list">
            {history.map((r) => (
              <div key={r.id} className="flux-hist-row">
                <div className="flux-hist-main">
                  <TokenChip symbol={r.fromSym} amount={r.fromAmount} />
                  <FiArrowRight className="flux-hist-arrow" />
                  <TokenChip symbol={r.toSym} amount={r.toAmount} />
                  <div className="flux-hist-meta">
                    <span className="flux-hist-usd">{formatUsd(r.fromUsd)}</span>
                    <span className="flux-hist-time">{timeAgo(r.time)}</span>
                  </div>
                </div>
                {r.toAddr && (
                  <div className="flux-hist-addr">
                    <FiMapPin className="flux-hist-addr-icon" />
                    <span>To</span>
                    <span className="flux-mono flux-hist-addr-val">{truncateAddress(r.toAddr)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
