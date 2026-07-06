# Problem 2 — Fancy Form  <!-- omit in toc -->

A polished currency-swap form UI built from an empty state through to a
submitted swap with validation, wallet state, network switching, and local swap
history.

-   Presents a responsive token swap experience with dark and light themes
-   Fetches live token prices from the Switcheo interview feed
-   Simulates wallet connection and swap submission locally
-   Uses a real disclaimer gate before mounting the swap form

> **Demo only.** No blockchain calls or real transactions are performed. Wallets
> and swaps are simulated in the browser.

## Table of Contents  <!-- omit in toc -->

- [Experience](#experience)
- [Features](#features)
- [Structure](#structure)
- [Implementation Notes](#implementation-notes)
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
- **Slippage selector**, **route comparison**, and **safety checks** panels.
- **Wallet connection** using demo providers and generated demo addresses.
- **Network switch flow** shared across the header and swap badges.
- **Swap history** persisted to `localStorage` through
  [useSwapHistory](./hooks/useSwapHistory.ts).
- **Disclaimer gate** that conditionally mounts the form only after acceptance.

## Structure

```text
problem2/
├── Problem2Page.tsx        # page shell, wallet/network state, view switch
├── Problem2Page.scss       # page-level styles
├── assets/wallets/         # wallet provider logos
├── components/
│   ├── layout/             # PageHeader
│   ├── swap/               # SwapPanel, Swap99, SlippageSelector, route/safety panels
│   ├── history/            # SwapHistory
│   ├── modals/             # wallet, token, network, disclaimer modals
│   └── ui/                 # TokenIcon, WalletAvatar
├── hooks/                  # useTokenPrices, useSwapHistory
└── lib/                    # tokens, wallet, networks, wallet metadata
```

## Implementation Notes

- Business logic is kept in `lib/` and `hooks/` so UI components stay focused on
  presentation and interaction.
- Tokens without available pricing are filtered out before they reach the swap
  flow.
- The disclaimer is a real conditional mount, so removing the modal from the DOM
  does not reveal an interactive swap form.
- Swap history is scoped to the browser through `localStorage`, not a backend.

## Running

Start the full frontend app from the repository root:

```bash
npm run dev
```
