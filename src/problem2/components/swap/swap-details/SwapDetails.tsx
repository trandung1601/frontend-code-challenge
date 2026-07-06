import { useState } from 'react'
import { FiChevronDown, FiRepeat } from 'react-icons/fi'
import RouteComparison from '../route-comparison/RouteComparison'
import { formatAmount, type Token } from '../../../lib/tokens'
import type { Network } from '../../../lib/networks'

// Flat protocol fee taken by the (demo) aggregator, shown as "TX Fee".
export const TX_FEE_PCT = 0.5

// Typical network fee per chain in USD — mocked but roughly realistic, so the
// row reacts to the selected network like a real aggregator quote would.
const NETWORK_FEE_USD: Record<string, number> = {
  ethereum: 1.85,
  bnb: 0.18,
  polygon: 0.012,
  arbitrum: 0.09,
  optimism: 0.07,
  avalanche: 0.05,
  solana: 0.0025,
  fantom: 0.015,
  cosmos: 0.01,
  celo: 0.008,
  near: 0.004,
}

// Rough confirmation time per chain, for the route row.
const NETWORK_ETA: Record<string, string> = {
  ethereum: '~1 min',
  bnb: '~15 sec',
  polygon: '~10 sec',
  arbitrum: '~5 sec',
  optimism: '~5 sec',
  avalanche: '~10 sec',
  solana: '~5 sec',
  fantom: '~10 sec',
  cosmos: '~15 sec',
  celo: '~10 sec',
  near: '~5 sec',
}

// USD with enough precision for tiny gas fees ($0.18205, not $0.18).
function formatFeeUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumSignificantDigits: 5 })
}

export default function SwapDetails({
  from,
  to,
  rate,
  receive,
  slippage,
  network,
  tokens,
}: {
  from: Token
  to: Token
  rate: number
  receive: number
  slippage: number
  network: Network
  tokens: Token[]
}) {
  // Rate row can be flipped: 1 FROM ≈ x TO ⇄ 1 TO ≈ x FROM.
  const [inverted, setInverted] = useState(false)
  const [routesOpen, setRoutesOpen] = useState(false)

  const feeUsd = NETWORK_FEE_USD[network.id] ?? 0.5
  // Express the gas fee in the chain's native token when we have its price.
  const native = tokens.find((t) => t.symbol === network.icon)
  const feeNative = native && native.price > 0 ? feeUsd / native.price : null

  const minReceived = receive * (1 - slippage / 100)

  const row = 'flex items-center justify-between gap-3 min-h-[30px]'
  const label: React.CSSProperties = { color: 'var(--f-muted2)', fontSize: 14 }
  const value: React.CSSProperties = { color: 'var(--f-fg)', fontSize: 13.5, fontWeight: 600 }

  return (
    <>
      <div className="flux-card px-5 py-4 mt-4">
        {/* Route */}
        <div className={row}>
          <span style={label}>Route</span>
          <button
            onClick={() => setRoutesOpen((v) => !v)}
            className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer font-[inherit]"
            title="Compare routes"
          >
            <span className="flux-mono" style={value}>99Route</span>
            <span className="flux-badge-best">Best Rate</span>
            <span className="text-[12.5px]" style={{ color: 'var(--f-muted2)' }}>
              {NETWORK_ETA[network.id] ?? '~1 min'}
            </span>
            <FiChevronDown
              className="text-[15px]"
              style={{
                color: 'var(--f-muted2)',
                transform: routesOpen ? 'rotate(180deg)' : undefined,
                transition: 'transform 0.2s',
              }}
            />
          </button>
        </div>

        {/* Minimum received after slippage */}
        <div className={row}>
          <span style={label}>Minimum Received</span>
          <span className="flux-mono" style={value}>
            {formatAmount(minReceived)} {to.symbol}{' '}
            <span style={{ color: 'var(--f-muted2)', fontWeight: 500 }}>({slippage}%)</span>
          </span>
        </div>

        {/* Rate, flippable */}
        <div className={row}>
          <span style={label}>Rate</span>
          <button
            onClick={() => setInverted((v) => !v)}
            className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer font-[inherit]"
            title="Flip rate"
          >
            <span className="flux-mono" style={value}>
              {inverted
                ? `1 ${to.symbol} ≈ ${formatAmount(rate > 0 ? 1 / rate : 0)} ${from.symbol}`
                : `1 ${from.symbol} ≈ ${formatAmount(rate)} ${to.symbol}`}
            </span>
            <FiRepeat className="text-[13px]" style={{ color: 'var(--f-muted2)' }} />
          </button>
        </div>

        {/* Network (gas) fee */}
        <div className={row}>
          <span style={label}>Network Fee</span>
          <span className="flux-mono" style={value}>
            {feeNative !== null && native
              ? `${feeNative.toLocaleString('en-US', { maximumSignificantDigits: 5 })} ${native.symbol} (${formatFeeUsd(feeUsd)})`
              : formatFeeUsd(feeUsd)}
          </span>
        </div>

        {/* Protocol fee */}
        <div className={row}>
          <span style={label}>TX Fee</span>
          <span className="flux-mono" style={value}>{TX_FEE_PCT}%</span>
        </div>
      </div>

      {/* Aggregator comparison, expanded from the route row */}
      {routesOpen && (
        <div className="mt-4">
          <RouteComparison receive={receive} toSymbol={to.symbol} hasAmount={receive > 0} />
        </div>
      )}
    </>
  )
}
