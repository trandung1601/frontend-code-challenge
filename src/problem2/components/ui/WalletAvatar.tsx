import { useState } from 'react'
import metamaskIcon from '../../assets/wallets/metamask.svg'
import walletconnectIcon from '../../assets/wallets/walletconnect.svg'
import phantomIcon from '../../assets/wallets/phantom.svg'
import coinbaseIcon from '../../assets/wallets/coinbase.svg'
import trustwalletIcon from '../../assets/wallets/trustwallet.svg'

const WALLET_ICONS: Record<string, string> = {
  metamask: metamaskIcon,
  walletconnect: walletconnectIcon,
  phantom: phantomIcon,
  coinbase: coinbaseIcon,
  trust: trustwalletIcon,
}

// The connected wallet's brand icon (falls back to a coloured letter tile).
// Shared by the header badge and the swap panels' address tags.
export default function WalletAvatar({
  id,
  color,
  letter,
  size = 'sm',
}: {
  id: string
  color: string
  letter: string
  size?: 'sm' | 'lg'
}) {
  const [failed, setFailed] = useState(false)
  const src = WALLET_ICONS[id]
  const cls = size === 'lg' ? 'flux-wallet-avatar flux-wallet-avatar-lg' : 'flux-wallet-avatar'
  if (!src || failed) {
    return <span className={cls} style={{ background: color }}>{letter}</span>
  }
  return (
    <span className={`${cls} flux-wallet-icon-wrap`}>
      <img src={src} alt={id} onError={() => setFailed(true)} />
    </span>
  )
}
