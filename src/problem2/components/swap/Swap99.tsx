import { useMemo, useState } from 'react'
import { FiArrowDown, FiCheck, FiAlertCircle, FiCreditCard } from 'react-icons/fi'
import SwapPanel from './SwapPanel'
import SlippageSelector from './SlippageSelector'
import SwapDetails from './SwapDetails'
import TokenSelectModal from '../modals/TokenSelectModal'
import { formatAmount, type Token } from '../../lib/tokens'
import type { ConnectedWallet } from '../../lib/wallet'
import type { Network } from '../../lib/networks'
import type { SwapRecord } from '../../hooks/useSwapHistory'
import './Swap99.scss'

type Side = 'from' | 'to'
type Status = 'idle' | 'swapping' | 'success'

export default function Swap99({
  wallet,
  tokens,
  loading,
  error,
  refetch,
  onOpenConnect,
  onRecordSwap,
  network,
  onNetworkChange,
}: {
  wallet: ConnectedWallet | null
  tokens: Token[]
  loading: boolean
  error: string | null
  refetch: () => void
  onOpenConnect: () => void
  onRecordSwap: (rec: Omit<SwapRecord, 'id' | 'time'>) => void
  network: Network
  onNetworkChange: (n: Network) => void
}) {
  const connected = !!wallet

  const [fromSym, setFromSym] = useState<string | null>(null)
  const [toSym, setToSym] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(0.1)
  const [picker, setPicker] = useState<Side | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  const from = useMemo(
    () => tokens.find((t) => t.symbol === (fromSym ?? 'ETH')) ?? tokens[0] ?? null,
    [tokens, fromSym],
  )
  const to = useMemo(
    () => tokens.find((t) => t.symbol === (toSym ?? 'USDC')) ?? tokens[1] ?? null,
    [tokens, toSym],
  )

  const amt = parseFloat(amount) || 0
  const rate = from && to ? from.price / to.price : 0
  const receive = amt * rate
  const fromUsd = from ? amt * from.price : 0
  const toUsd = to ? receive * to.price : 0

  const validation = useMemo(() => {
    if (loading || !from || !to) return { ok: false, label: 'Loading…' }
    if (amt <= 0) return { ok: false, label: 'Enter an amount' }
    if (amt > from.balance) return { ok: false, label: `Insufficient ${from.symbol} balance` }
    return { ok: true, label: 'Swap now' }
  }, [loading, from, to, amt])

  function swapSides() {
    setFromSym(to?.symbol ?? null)
    setToSym(from?.symbol ?? null)
    setStatus('idle')
  }

  function onPick(t: Token) {
    if (picker === 'from') {
      if (to && t.symbol === to.symbol) setToSym(from?.symbol ?? null) // avoid same pair
      setFromSym(t.symbol)
    } else {
      if (from && t.symbol === from.symbol) setFromSym(to?.symbol ?? null)
      setToSym(t.symbol)
    }
    setPicker(null)
    setStatus('idle')
  }

  function onSwap() {
    if (!validation.ok || status !== 'idle' || !from || !to || !wallet) return
    setStatus('swapping')
    // Snapshot the swap now — amount/status get reset once it completes.
    const record = {
      fromSym: from.symbol,
      toSym: to.symbol,
      fromAmount: amt,
      toAmount: receive,
      fromUsd,
      rate,
      fromAddr: wallet.address,
      toAddr: wallet.address,
    }
    setTimeout(() => {
      setStatus('success')
      onRecordSwap(record)
      setTimeout(() => {
        setStatus('idle')
        setAmount('')
      }, 2400)
    }, 1700)
  }

  if (error) {
    return (
      <div className="flux-card p-8 text-center max-w-[460px] mx-auto">
        <FiAlertCircle className="mx-auto text-[30px] mb-3" style={{ color: 'var(--f-amber)' }} />
        <p className="text-[15px] mb-5" style={{ color: 'var(--f-fg)' }}>{error}</p>
        <button onClick={refetch} className="flux-btn px-5 py-2.5">Try again</button>
      </div>
    )
  }

  const ctaDisabled = connected && (!validation.ok || status !== 'idle')
  const ctaLabel = !connected
    ? 'Connect Wallet'
    : status === 'success'
      ? 'Swap complete'
      : status === 'swapping'
        ? 'Swapping…'
        : validation.label

  return (
    <div className="w-full max-w-[460px] mx-auto flux-fade">
      {/* ── Card 1: From / To ── */}
      <div className="flux-card px-5 py-5">
        <SwapPanel
          label="From:"
          token={from}
          amount={amount}
          editable
          connected={connected}
          usd={fromUsd}
          balance={connected && from ? from.balance : null}
          overBalance={connected && !!from && amt > from.balance}
          onAmount={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
          onPick={() => setPicker('from')}
          onMax={() => from && setAmount(String(from.balance))}
          address={wallet?.address}
          provider={wallet?.provider}
          networkIcon={network.icon}
          networkName={network.name}
        />

        {/* Divider splitting From / To, with the switch centred on it */}
        <div className="flux-divider">
          <button onClick={swapSides} title="Switch direction" className="flux-switch">
            <FiArrowDown />
          </button>
        </div>

        <SwapPanel
          label="To:"
          token={to}
          amount={connected && amt > 0 ? formatAmount(receive) : ''}
          editable={false}
          connected={connected}
          usd={toUsd}
          balance={connected && to ? to.balance : null}
          onPick={() => setPicker('to')}
          address={wallet?.address}
          provider={wallet?.provider}
          networkIcon={network.icon}
          networkName={network.name}
        />
      </div>

      {/* ── Card 2: Slippage + action ── */}
      <div className="flux-card px-5 py-5 mt-4">
        <SlippageSelector slippage={slippage} onChange={setSlippage} />

        <button
          onClick={connected ? onSwap : onOpenConnect}
          disabled={ctaDisabled}
          className={`flux-cta mt-4 ${status === 'success' ? 'flux-cta-done' : ''}`}
        >
          {status === 'swapping' && <span className="flux-spinner" />}
          {status === 'success' && <FiCheck className="text-[20px]" />}
          {ctaLabel}
          {!connected && <FiCreditCard className="text-[18px]" />}
        </button>
      </div>

      {/* ── Quote details — appear once the user has entered an amount ── */}
      {connected && amt > 0 && from && to && (
        <SwapDetails
          from={from}
          to={to}
          rate={rate}
          receive={receive}
          slippage={slippage}
          network={network}
          tokens={tokens}
        />
      )}

      {picker && from && to && (
        <TokenSelectModal
          tokens={tokens}
          selected={picker === 'from' ? from.symbol : to.symbol}
          disabledSymbol={picker === 'from' ? to.symbol : from.symbol}
          onSelect={onPick}
          onClose={() => setPicker(null)}
          network={network}
          onNetworkChange={onNetworkChange}
        />
      )}
    </div>
  )
}
