import { FiAlertTriangle } from 'react-icons/fi'

export default function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }}
    >
      <div
        className="flux-card w-full max-w-lg p-9 shadow-2xl"
        style={{ animation: 'fadeUp .3s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <span
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ background: 'var(--f-amber-bg)' }}
          >
            <FiAlertTriangle className="text-[24px]" style={{ color: 'var(--f-amber)' }} />
          </span>
          <h2 className="text-[22px] font-bold m-0" style={{ color: 'var(--f-fg)' }}>
            Disclaimer
          </h2>
        </div>

        <p className="text-[15px] leading-relaxed m-0 mb-8" style={{ color: 'var(--f-muted2)' }}>
          99Tech Swap is a <b style={{ color: 'var(--f-fg)' }}>demo swap interface</b>. There are no real
          transactions, tokens, or balances — prices are live from Switcheo, but everything else is
          simulated for demonstration purposes only.
        </p>

        <button onClick={onAccept} className="flux-cta">
          I understand, continue
        </button>
      </div>
    </div>
  )
}
