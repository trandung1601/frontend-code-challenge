# Problem 2 — Fancy Form  <!-- omit in toc -->

A polished currency-swap form UI built from an empty state through to a
submitted swap with validation, wallet state, network switching, and local swap
history.

-   Presents a responsive token swap experience with dark and light themes
-   Fetches live token prices from the Switcheo interview feed
-   Simulates wallet connection and swap submission locally
-   Uses a real disclaimer gate before mounting the swap form (accepted once,
    remembered via `localStorage`)
-   Persists the wallet session and selected network for 5 minutes across reloads

> **Demo only.** No blockchain calls or real transactions are performed. Wallets
> and swaps are simulated in the browser.

## Table of Contents  <!-- omit in toc -->

- [Experience](#experience)
- [Features](#features)
- [Structure](#structure)
- [Implementation Notes](#implementation-notes)
- [Testing](#testing)
- [Running](#running)

## Experience

[Problem2Page.tsx](./Problem2Page.tsx) coordinates the page shell, disclaimer
gate, wallet state, selected network, and view switching between swap and
history.

Users can connect a demo wallet, choose a network, select tokens, enter an
amount, review route and safety details, submit a simulated swap, and inspect
the saved swap history.

## Features

- **Token swap form** with from/to tokens, amount input, and a flip button.
- **Live prices** fetched by [useTokenPrices](./hooks/useTokenPrices.ts) from
  `https://interview.switcheo.com/prices.json`, including loading, error, and
  refetch states.
- **Token selection modal** with search and token icons.
- **Live validation** for empty amounts, insufficient balances, same-token pairs,
  and missing wallet state.
- **Quote details panel** ([SwapDetails](./components/swap/SwapDetails.tsx))
  shown once an amount is entered: best route with per-chain ETA, minimum
  received after slippage, flippable rate, network fee priced in the chain's
  native token, and flat TX fee — with an expandable aggregator route comparison.
- **Slippage selector**, **route comparison**, and **safety checks** panels.
- **Wallet connection** using demo providers and generated demo addresses. The
  session (wallet + selected network) is stored in `localStorage` for
  5 minutes, restored on reload, and auto-disconnected at expiry
  ([lib/wallet.ts](./lib/wallet.ts)).
- **Network switch flow** shared across the header and swap badges, with a
  MetaMask-style confirmation modal.
- **Swap history** persisted to `localStorage` through
  [useSwapHistory](./hooks/useSwapHistory.ts).
- **Disclaimer gate** that conditionally mounts the form only after acceptance.
  Presented as a scannable Live/Demo checklist with an autofocused CTA
  (Enter dismisses); acceptance is remembered in `localStorage` so it only
  shows once per browser.

## Structure

```text
problem2/
├── Problem2Page.tsx        # page shell, wallet/network state, view switch
├── Problem2Page.scss       # page-level styles
├── assets/wallets/         # wallet provider logos
├── components/
│   ├── layout/             # PageHeader
│   ├── swap/               # SwapPanel, Swap99, SwapDetails, SlippageSelector, route/safety panels
│   ├── history/            # SwapHistory
│   ├── modals/             # wallet, token, network, disclaimer modals
│   └── ui/                 # TokenIcon, WalletAvatar
├── hooks/                  # useTokenPrices, useSwapHistory
└── lib/                    # tokens, wallet (incl. session persistence), networks
```

## Implementation Notes

- Business logic is kept in `lib/` and `hooks/` so UI components stay focused on
  presentation and interaction.
- Tokens without available pricing are filtered out before they reach the swap
  flow.
- The disclaimer is a real conditional mount, so removing the modal from the DOM
  does not reveal an interactive swap form. The stored acceptance flag only
  skips re-asking; it does not change the gating mechanism.
- All browser persistence is namespaced `localStorage` keys, each guarded by
  `try/catch` so private browsing degrades to in-memory state:
  `flux-disclaimer-accepted`, `flux-wallet-session` (with a 5-minute TTL, also
  carrying the selected network), and `flux-swap-history`.
- Network fees and ETAs in the quote panel are mocked per chain but derived
  from live prices, so the native-token fee amount reacts to the market feed.

## Testing

The suite runs on [Vitest](https://vitest.dev). Pure logic tests (`lib/`) run
in the default node environment; UI and hook tests opt into jsdom per file via
the `// @vitest-environment jsdom` pragma and use Testing Library.

```bash
npm test
```

Coverage spans:

- **lib/** — token feed collapsing, sorting, formatters, wallet session
  persistence/expiry, and address helpers.
- **hooks/** — `useSwapHistory` (hydration, 50-record cap, corrupted storage)
  and `useTokenPrices` (mocked fetch: success, HTTP/network errors, refetch).
- **components/** — every modal, swap panel, and history view, plus a
  `Swap99` integration test driving the full swap lifecycle with fake timers.
- **Problem2Page** — disclaimer gating and wallet-session restore/expiry.

## Running

Start the full frontend app from the repository root:

```bash
npm run dev
```
