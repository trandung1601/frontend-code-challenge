import { useState } from 'react'
import { FiAlertTriangle, FiEdit2 } from 'react-icons/fi'

const SLIPPAGES = [0.1, 0.5, 1]

export default function SlippageSelector({
  slippage,
  onChange,
}: {
  slippage: number
  onChange: (v: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flux-slip-label">Slippage Tolerance</span>

        <div className="relative">
          <button className="flux-slip-badge" onClick={() => setOpen((o) => !o)}>
            {slippage < 0.5 && <FiAlertTriangle className="text-[13px]" style={{ color: 'var(--f-amber)' }} />}
            <span className="flux-mono">{slippage.toFixed(2)}%</span>
            <FiEdit2 className="text-[12px]" style={{ color: 'var(--f-amber)' }} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="flux-slip-pop">
                {SLIPPAGES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { onChange(s); setOpen(false) }}
                    className={`flux-slip ${slippage === s ? 'flux-slip-on' : ''}`}
                  >
                    {s.toFixed(2)}%
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {slippage < 0.5 && (
        <p className="text-[12px] mt-2.5 flex items-center gap-1.5" style={{ color: 'var(--f-amber)' }}>
          <FiAlertTriangle className="text-[12px] shrink-0" />
          Low slippage — your transaction may fail in volatile markets.
        </p>
      )}
    </div>
  )
}
