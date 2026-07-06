import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { WALLET_PROVIDERS, type WalletProvider } from '../../../lib/wallet'
import metamaskIcon from '../../../assets/wallets/metamask.svg'
import walletconnectIcon from '../../../assets/wallets/walletconnect.svg'
import phantomIcon from '../../../assets/wallets/phantom.svg'
import coinbaseIcon from '../../../assets/wallets/coinbase.svg'
import trustwalletIcon from '../../../assets/wallets/trustwallet.svg'
import './ConnectWalletModal.scss'

const WALLET_ICONS: Record<string, string> = {
  metamask: metamaskIcon,
  walletconnect: walletconnectIcon,
  phantom: phantomIcon,
  coinbase: coinbaseIcon,
  trust: trustwalletIcon,
}

function WalletIcon({ id, color, letter }: { id: string; color: string; letter: string }) {
  const [failed, setFailed] = useState(false)
  const src = WALLET_ICONS[id]
  if (!src || failed) {
    return <span className="cw-avatar" style={{ background: color }}>{letter}</span>
  }
  return (
    <span className="cw-icon">
      <img src={src} alt={id} onError={() => setFailed(true)} />
    </span>
  )
}

// Dark, self-contained styling so the modal looks identical in either theme.
export default function ConnectWalletModal({
  onSelect,
  onClose,
}: {
  onSelect: (provider: WalletProvider) => void
  onClose: () => void
}) {
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Simulate the wallet handshake with a short delay before completing.
  function pick(p: WalletProvider) {
    if (connecting) return
    setConnecting(p.id)
    setTimeout(() => onSelect(p), 900)
  }

  return (
    <div className="cw-overlay" onClick={onClose}>
      <div className="cw-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="cw-title">Connect wallet</h2>
          <button onClick={onClose} className="cw-close" aria-label="Close">
            <FiX />
          </button>
        </div>
        <p className="cw-sub">Choose a wallet to get started — EVM, Solana &amp; BNB Chain supported.</p>

        <div className="flex flex-col gap-3 mt-5">
          {WALLET_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p)}
              disabled={!!connecting}
              className="cw-row"
            >
              <WalletIcon id={p.id} color={p.color} letter={p.letter} />
              <span className="flex flex-col text-left min-w-0">
                <span className="cw-name">{p.name}</span>
                <span className="cw-desc">{p.description}</span>
              </span>
              {connecting === p.id && <span className="cw-spinner" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
