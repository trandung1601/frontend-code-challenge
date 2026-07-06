import { FiChevronDown } from 'react-icons/fi'
import TokenIcon from '../ui/TokenIcon'
import WalletAvatar from '../ui/WalletAvatar'
import { chainIconSymbol, chainOf, formatAmount, formatUsd, type Token } from '../../lib/tokens'
import { truncateAddress, type WalletProvider } from '../../lib/wallet'
import './SwapPanel.scss'

// One "From:" / "To:" block: label sits *above* the lavender box (on the card),
// the box holds the token selector (with a small network badge on the icon) and
// the amount. Amounts/balances only carry meaning once a wallet is connected —
// until then everything reads as an empty default (0.00 / ~0 USD).
export default function SwapPanel({
  label,
  token,
  amount,
  editable,
  connected,
  usd,
  balance,
  overBalance,
  onAmount,
  onPick,
  onMax,
  address,
  provider,
  networkIcon,
  networkName,
}: {
  label: string
  token: Token | null
  amount: string
  editable: boolean
  connected: boolean
  usd: number
  balance: number | null
  overBalance?: boolean
  onAmount?: (v: string) => void
  onPick: () => void
  onMax?: () => void
  // Address shown inline beside the label (with the wallet's brand icon).
  address?: string
  provider?: WalletProvider | null
  // Active network — its coin icon drives the badge overlaid on the token, and
  // its name replaces the token's native chain label below the selector.
  networkIcon?: string
  networkName?: string
}) {
  const usdLabel = connected && amount ? `~${formatUsd(usd)}` : '~0 USD'

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="flux-io-head">
          <span className="flux-io-label">{label}</span>
          {address && provider && (
            <span className="flux-io-addr">
              <WalletAvatar id={provider.id} color={provider.color} letter={provider.letter} />
              <span className="flux-mono flux-io-addr-text">{truncateAddress(address)}</span>
            </span>
          )}
        </span>
        {connected && balance != null && (
          <span className="flux-io-bal">
            Balance: {formatAmount(balance)}
            {editable && onMax && (
              <button onClick={onMax} className="flux-max ml-1.5">MAX</button>
            )}
          </span>
        )}
      </div>

      <div className="flux-io">
        <div className="flex flex-col gap-1 min-w-0">
          <button onClick={onPick} className="flux-token-btn">
            {token ? (
              <>
                <span className="flux-icon-wrap">
                  <TokenIcon symbol={token.symbol} size={30} />
                  <span className="flux-chain-badge">
                    <TokenIcon symbol={networkIcon ?? chainIconSymbol(token.symbol)} size={15} />
                  </span>
                </span>
                <span className="flux-io-sym">{token.symbol}</span>
              </>
            ) : (
              <span className="flux-io-sym">Select</span>
            )}
            <FiChevronDown className="text-[16px] shrink-0" style={{ color: 'var(--f-muted)' }} />
          </button>
          {token && <span className="flux-io-chain">{networkName ?? chainOf(token.symbol)}</span>}
        </div>

        <div className="flex flex-col items-end min-w-0 flex-1">
          <input
            value={amount}
            onChange={(e) => onAmount?.(e.target.value)}
            readOnly={!editable || !connected}
            inputMode="decimal"
            placeholder="0.00"
            className="flux-amount"
            style={{ color: overBalance ? '#ef4444' : undefined }}
          />
          <span className="flux-io-usd">{usdLabel}</span>
        </div>
      </div>
    </div>
  )
}
