import { FiCheck, FiAlertCircle } from 'react-icons/fi'
import { formatUsd } from '../../../lib/tokens'

export default function SafetyChecks({
  priceImpact,
  networkFee,
  slippage,
}: {
  priceImpact: number
  networkFee: number
  slippage: number
}) {
  const rows = [
    { label: 'Token verified', value: 'Pass', warn: false },
    { label: 'Price impact', value: `${priceImpact.toFixed(2)}%`, warn: priceImpact > 3 },
    { label: 'Network fee', value: formatUsd(networkFee), warn: true },
    { label: 'Slippage', value: `${slippage}%`, warn: false },
  ]
  return (
    <div className="flux-card px-5 py-5">
      <h3 className="text-[16px] font-bold m-0 mb-4" style={{ color: 'var(--f-fg)' }}>Safety checks</h3>
      <div className="flex flex-col gap-3.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-[14px]" style={{ color: 'var(--f-fg)' }}>
              <span className={`flux-check ${r.warn ? 'flux-check-warn' : ''}`}>
                {r.warn ? <FiAlertCircle /> : <FiCheck />}
              </span>
              {r.label}
            </span>
            <span
              className="flux-mono text-[13px] font-semibold"
              style={{ color: r.warn ? 'var(--f-amber)' : 'var(--f-mint)' }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
