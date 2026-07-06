import { useState } from 'react'
import { FiLock } from 'react-icons/fi'
import DisclaimerModal from './components/modals/DisclaimerModal'
import ConnectWalletModal from './components/modals/ConnectWalletModal'
import Swap99 from './components/swap/Swap99'
import SwapHistory from './components/history/SwapHistory'
import PageHeader, { type View } from './components/layout/PageHeader'
import { randomAddress, type ConnectedWallet, type WalletProvider } from './lib/wallet'
import { NETWORKS, type Network } from './lib/networks'
import { useTokenPrices } from './hooks/useTokenPrices'
import { useSwapHistory } from './hooks/useSwapHistory'
import './Problem2Page.scss'

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
  const [accepted, setAccepted] = useState(false)

  // Demo-only wallet session: no real chain, just a random address.
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null)
  const [walletModal, setWalletModal] = useState(false)

  // Which body view is active: the swap form or the saved swap history.
  const [view, setView] = useState<View>('swap')

  // Selected chain — shared so the header, token picker and swap badges agree.
  const [network, setNetwork] = useState<Network>(NETWORKS[0])

  const { tokens, loading, error, refetch } = useTokenPrices()
  const { history, addSwap, clearHistory } = useSwapHistory()

  function connect(provider: WalletProvider) {
    setWallet({ provider, address: randomAddress(provider.chain) })
    setWalletModal(false)
  }

  return (
    <div
      className="flux min-h-screen flex flex-col"
      data-flux-theme={dark ? 'dark' : 'light'}
      style={{ background: 'var(--f-bg)', color: 'var(--f-fg)', fontFamily: "Sora, system-ui, sans-serif" }}
    >
      {!accepted && <DisclaimerModal onAccept={() => setAccepted(true)} />}
      {walletModal && <ConnectWalletModal onSelect={connect} onClose={() => setWalletModal(false)} />}

      <PageHeader
        dark={dark}
        onToggleDark={onToggleDark}
        wallet={wallet}
        tokens={tokens}
        view={view}
        onView={setView}
        network={network}
        onNetworkChange={setNetwork}
        onConnectWallet={() => setWalletModal(true)}
        onDisconnect={() => setWallet(null)}
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
              onNetworkChange={setNetwork}
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
