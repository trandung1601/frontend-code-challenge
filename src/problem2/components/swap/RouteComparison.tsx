import { formatAmount } from '../../lib/tokens'
import './RouteComparison.scss'

// Mocked liquidity-aggregator routes, derived from the best available rate.
const ROUTES = [
  { name: '99Route', via: 'AquaPool → StableX', fee: 2.14, delta: 0, best: true },
  { name: 'OrbitX', via: '1 hop direct', fee: 1.86, delta: -0.38, best: false },
  { name: 'NovaDEX', via: 'via WETH', fee: 1.52, delta: -0.69, best: false },
]

export default function RouteComparison({
  receive,
  toSymbol,
  hasAmount,
}: {
  receive: number
  toSymbol: string
  hasAmount: boolean
}) {
  return (
    <div className="flux-card px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold m-0" style={{ color: 'var(--f-fg)' }}>Route comparison</h3>
        <span className="text-[12px]" style={{ color: 'var(--f-muted)' }}>3 aggregators · updated 5s ago</span>
      </div>
      <div className="flex flex-col gap-3">
        {ROUTES.map((r) => {
          const out = receive * (1 + r.delta / 100)
          return (
            <div key={r.name} className={`flux-route ${r.best ? 'flux-route-best' : ''}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold" style={{ color: 'var(--f-fg)' }}>{r.name}</span>
                  {r.best ? (
                    <span className="flux-badge-best">Best</span>
                  ) : (
                    <span className="flux-badge-delta">{r.delta}%</span>
                  )}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--f-muted)' }}>
                  {r.via} · network fee ${r.fee.toFixed(2)}
                </div>
              </div>
              <div className="flux-mono text-[16px] font-semibold shrink-0" style={{ color: 'var(--f-fg)' }}>
                {hasAmount ? formatAmount(out) : '—'} {toSymbol}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
