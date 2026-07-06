# Problem 2 — Fancy Form (Currency Swap)

A polished currency-swap form UI, built from an empty state through to a
submitted swap with considered validation and micro-interactions.

> **Demo only.** No blockchain, no real transactions. The wallet is a random
> demo address and swaps are simulated locally.

## Features

- **Token swap form** with a from/to pair, amount input, and a flip button.
- **Live prices** fetched from the Switcheo feed
  (`https://interview.switcheo.com/prices.json`) via [useTokenPrices](./hooks/useTokenPrices.ts),
  with loading / error / refetch states. Tokens without a price are filtered out.
- **Token selection modal** with search and token icons.
- **Live validation** — empty amount, insufficient balance, same-token, etc.
- **Slippage selector**, **route comparison**, and **safety checks** panels.
- **Wallet connection** (demo) with a provider picker, plus a **network switch**
  flow shared across the header and swap badges.
- **Swap history** persisted to `localStorage` ([useSwapHistory](./hooks/useSwapHistory.ts)),
  gated behind a connected wallet.
- **Disclaimer gate** — the swap form is *not mounted* until the disclaimer is
  accepted (removing the modal from the DOM reveals nothing to interact with).
- Dark / light theme, responsive layout.

## Structure

```
problem2/
├── Problem2Page.tsx        # page shell: disclaimer gate, wallet/network state, view switch
├── assets/wallets/         # wallet provider logos (SVG)
├── components/
│   ├── layout/PageHeader   # brand, nav, wallet badge, network picker
│   ├── swap/               # SwapPanel, Swap99, SlippageSelector, RouteComparison, SafetyChecks
│   ├── history/SwapHistory # saved swaps list
│   ├── modals/             # Connect wallet, Token select, Switch network, Disclaimer
│   └── ui/                 # TokenIcon, WalletAvatar
├── hooks/                  # useTokenPrices, useSwapHistory
└── lib/                    # tokens, wallet, networks, wallets.json
```

## Notes

- Business/pure logic lives in `lib/` and `hooks/` so the components stay
  presentational.
- The disclaimer is a real gate (conditional mount), not just a visual overlay.
