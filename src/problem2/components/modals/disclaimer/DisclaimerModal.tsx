import { useEffect, useRef } from 'react'
import { FiActivity, FiAlertTriangle, FiCheck, FiZap } from 'react-icons/fi'

const POINTS = [
  {
    live: true,
    icon: <FiActivity />,
    title: 'Live token prices',
    detail: 'Rates are fetched in real time from the Switcheo price feed.',
  },
  {
    live: false,
    icon: <FiZap />,
    title: 'Simulated swaps & wallets',
    detail: 'Connections, balances and confirmations are mocked locally.',
  },
  {
    live: false,
    icon: <FiCheck />,
    title: 'Nothing leaves your browser',
    detail: 'No real transactions are signed or broadcast — ever.',
  },
] as const

export default function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  // Autofocus the CTA so a single Enter press dismisses the gate.
  const ctaRef = useRef<HTMLButtonElement>(null)
  useEffect(() => ctaRef.current?.focus(), [])

  return (
    <div
      className="fixed inset-0 z-[70] flex overflow-y-auto p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        className="flux-card m-auto w-full max-w-lg p-8 shadow-2xl"
        style={{ animation: 'fadeUp .3s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: 'var(--f-amber-bg)' }}
          >
            <FiAlertTriangle className="text-[20px]" style={{ color: 'var(--f-amber)' }} />
          </span>
          <h2 id="disclaimer-title" className="text-[20px] font-bold m-0 leading-tight" style={{ color: 'var(--f-fg)' }}>
            Demo environment
          </h2>
        </div>
        <p className="text-[13.5px] m-0 mt-3" style={{ color: 'var(--f-muted2)' }}>
          99Tech Swap is for demonstration only. Here&rsquo;s what that means:
        </p>

        <ul className="list-none m-0 mb-7 mt-5 p-0 flex flex-col gap-3">
          {POINTS.map((p) => (
            <li
              key={p.title}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: 'var(--f-inner)', border: '0.8px solid var(--f-inner-brd)' }}
            >
              <span className={`flux-check mt-0.5 shrink-0 ${p.live ? '' : 'flux-check-warn'}`}>
                {p.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--f-fg)' }}>
                    {p.title}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5"
                    style={
                      p.live
                        ? { background: 'var(--f-mint-bg)', color: 'var(--f-mint)' }
                        : { background: 'var(--f-amber-bg)', color: 'var(--f-amber)' }
                    }
                  >
                    {p.live ? 'Live' : 'Demo'}
                  </span>
                </div>
                <p className="text-[13px] leading-snug m-0 mt-0.5" style={{ color: 'var(--f-muted2)' }}>
                  {p.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <button ref={ctaRef} onClick={onAccept} className="flux-cta">
          I understand, continue
        </button>
        <p className="text-[12px] text-center m-0 mt-3" style={{ color: 'var(--f-muted2)' }}>
          Press <kbd className="flux-mono font-semibold" style={{ color: 'var(--f-fg)' }}>Enter</kbd> to continue
        </p>
      </div>
    </div>
  )
}
