import { useEffect, useState } from 'react'
import { FiLock } from 'react-icons/fi'
import DisclaimerModal from './components/modals/DisclaimerModal'
import ConnectWalletModal from './components/modals/ConnectWalletModal'
import Swap99 from './components/swap/Swap99'
import SwapHistory from './components/history/SwapHistory'
import PageHeader, { type View } from './components/layout/PageHeader'
import {
  clearWalletSession,
  loadWalletSession,
  loadWalletSessionNetworkId,
  randomAddress,
  saveWalletSession,
  updateWalletSessionNetwork,
  walletSessionRemainingMs,
  type ConnectedWallet,
  type WalletProvider,
} from './lib/wallet'
import { NETWORKS, type Network } from './lib/networks'
import { useTokenPrices } from './hooks/useTokenPrices'
import { useSwapHistory } from './hooks/useSwapHistory'
import './Problem2Page.scss'

// localStorage key marking the disclaimer as accepted (same naming scheme as
// 'flux-swap-history').
const DISCLAIMER_KEY = 'flux-disclaimer-accepted'

export default function Problem2Page({
  dark,
  onToggleDark,
}: {
  dark: boolean
  onToggleDark: () => void
}) {
  // The swap form is *gated*, not just visually covered: until the user
  // accepts the disclaimer we never mount <Swap99 />, so removing the modal
  // from the DOM (devtools / injected script) reveals nothing to interact with.
  // Acceptance persists to localStorage so the gate only shows once per
  // browser; clearing site data brings it back.
  const [accepted, setAccepted] = useState(() => {
    try {
      return localStorage.getItem(DISCLAIMER_KEY) === '1'
    } catch {
      return false
    }
  })

  function acceptDisclaimer() {
    setAccepted(true)
    try {
      localStorage.setItem(DISCLAIMER_KEY, '1')
    } catch {
      /* storage unavailable — acceptance lasts for this session only */
    }
  }

  // Demo-only wallet session: no real chain, just a random address. The
  // session persists to localStorage for 5 minutes, then auto-disconnects.
  const [wallet, setWallet] = useState<ConnectedWallet | null>(loadWalletSession)
  const [walletModal, setWalletModal] = useState(false)

  // Auto-disconnect at the exact moment the persisted session expires.
  useEffect(() => {
    if (!wallet) return
    const remaining = walletSessionRemainingMs()
    if (remaining === null) return
    const timer = setTimeout(() => disconnect(), remaining)
    return () => clearTimeout(timer)
  }, [wallet])

  // Which body view is active: the swap form or the saved swap history.
  const [view, setView] = useState<View>('swap')

  // Selected chain — shared so the header, token picker and swap badges agree.
  // Restored from the wallet session (if one is still live), kept in sync on
  // every switch so a reload within the 5-minute window lands on the same chain.
  const [network, setNetwork] = useState<Network>(
    () => NETWORKS.find((n) => n.id === loadWalletSessionNetworkId()) ?? NETWORKS[0],
  )

  function changeNetwork(next: Network) {
    setNetwork(next)
    updateWalletSessionNetwork(next.id)
  }

  const { tokens, loading, error, refetch } = useTokenPrices()
  const { history, addSwap, clearHistory } = useSwapHistory()

  function connect(provider: WalletProvider) {
    const next = { provider, address: randomAddress(provider.chain) }
    setWallet(next)
    saveWalletSession(next, network.id)
    setWalletModal(false)
  }

  function disconnect() {
    setWallet(null)
    clearWalletSession()
  }

  return (
    <div
      className="flux min-h-screen flex flex-col"
      data-flux-theme={dark ? 'dark' : 'light'}
      style={{ background: 'var(--f-bg)', color: 'var(--f-fg)', fontFamily: "Sora, system-ui, sans-serif" }}
    >
      {!accepted && <DisclaimerModal onAccept={acceptDisclaimer} />}
      {walletModal && <ConnectWalletModal onSelect={connect} onClose={() => setWalletModal(false)} />}

      <PageHeader
        dark={dark}
        onToggleDark={onToggleDark}
        wallet={wallet}
        tokens={tokens}
        view={view}
        onView={setView}
        network={network}
        onNetworkChange={changeNetwork}
        onConnectWallet={() => setWalletModal(true)}
        onDisconnect={disconnect}
      />

      {/* ── Body ── */}
      <main className="flex-1 px-4 sm:px-8 pt-6 pb-12 overflow-x-hidden">
        {accepted ? (
          view === 'swap' ? (
            <Swap99
              wallet={wallet}
              tokens={tokens}
              loading={loading}
              error={error}
              refetch={refetch}
              onOpenConnect={() => setWalletModal(true)}
              onRecordSwap={addSwap}
              network={network}
              onNetworkChange={changeNetwork}
            />
          ) : (
            <SwapHistory
              history={history}
              onClear={clearHistory}
              connected={!!wallet}
              onConnect={() => setWalletModal(true)}
            />
          )
        ) : (
          // Placeholder shown behind the modal — no form is mounted yet.
          <div className="flex flex-col items-center justify-center gap-3 py-32 text-center">
            <span className="flux-check" style={{ width: 48, height: 48, fontSize: 22 }}>
              <FiLock />
            </span>
            <p className="text-[15px]" style={{ color: 'var(--f-muted2)' }}>
              Accept the disclaimer to start swapping.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
