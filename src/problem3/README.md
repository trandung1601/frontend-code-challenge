# Problem 3 — Messy React  <!-- omit in toc -->

A code review deliverable for a flawed `WalletPage` component. The review lists
the computational inefficiencies, correctness bugs, React anti-patterns, and a
refactored implementation.

-   Captures 15 findings across correctness, warnings, and improvements
-   Presents the same content in an interactive `/problem3` dashboard
-   Includes original and refactored TypeScript/React snippets
-   Keeps review content centralized in [reviewContent.ts](./reviewContent.ts)

## Table of Contents  <!-- omit in toc -->

- [Challenge](#challenge)
- [Summary](#summary)
- [Critical Findings](#critical-findings)
- [Warnings](#warnings)
- [Improvements](#improvements)
- [Original Code](#original-code)
- [Refactored Code](#refactored-code)
- [Structure](#structure)

## Challenge

List the computational inefficiencies and anti-patterns in the `WalletPage`
component, explain how to fix them, and provide a refactored version.

The same content is presented as an interactive dashboard at `/problem3` with
Overview, Issues, Refactored Code, and Explanation tabs.

## Summary

**15 issues found: 5 critical, 6 warnings, and 4 improvements.**

| Category | Count | Focus |
| -------- | ----- | ----- |
| Critical | 5 | Runtime errors, incorrect filtering, missing data, unused computed output |
| Warning | 6 | Type safety, unstable sorting, unstable keys, unnecessary recomputation |
| Improvement | 4 | Cleaner props typing, hoisted helpers, memoized formatting pipeline |

## Critical Findings

**1. Undefined variable: `lhsPriority`**

The filter declares `balancePriority` but checks `lhsPriority`, which does not
exist in scope. This throws a `ReferenceError` at runtime.

```tsx
// ❌ Before: declares `balancePriority` but checks `lhsPriority`
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { // ReferenceError: lhsPriority is not defined
  ...
}

// ✅ After: reference the declared variable
const balancePriority = getPriority(balance.blockchain);
if (balancePriority > -99) {
  ...
}
```

**2. Inverted filter keeps empty balances**

The filter returns `true` when `amount <= 0`, so it keeps only zero or negative
balances and discards real balances.

```tsx
// ❌ Before: keeps only empty/negative balances
if (balancePriority > -99) {
  if (balance.amount <= 0) {
    return true;
  }
}
return false;

// ✅ After: keep prioritized balances with a positive amount
return getPriority(balance.blockchain) > -99 && balance.amount > 0;
```

**3. Missing `blockchain` property on `WalletBalance`**

`getPriority(balance.blockchain)` is called repeatedly, but the interface only
declares `currency` and `amount`.

```tsx
// ❌ Before: `blockchain` is read but never declared
interface WalletBalance {
  currency: string;
  amount: number;
}

// ✅ After: declare the property that is actually used
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}
```

**4. Unsafe cast in the `rows` mapping**

`rows` maps over `sortedBalances` but types each item as
`FormattedWalletBalance`, then reads `balance.formatted`, which was never added.

```tsx
// ❌ Before: sortedBalances items have no `formatted` field
const rows = sortedBalances.map(
  (balance: FormattedWalletBalance, index: number) => {
    ...
    formattedAmount={balance.formatted} // undefined at runtime
  })

// ✅ After: render from the formatted list
const rows = formattedBalances.map((balance) => (
  <WalletRow ... formattedAmount={balance.formatted} />
));
```

**5. `formattedBalances` computed but never used**

A full mapping pass builds `formattedBalances`, but the UI maps over
`sortedBalances`, wasting work and losing formatted values.

```tsx
// ❌ Before: formattedBalances is built, then ignored by the render
const formattedBalances = sortedBalances.map((balance) => ({
  ...balance,
  formatted: balance.amount.toFixed(),
}));
const rows = sortedBalances.map(...); // uses sortedBalances, not formattedBalances

// ✅ After: render from formattedBalances (or fold into one memoized pipeline)
const rows = formattedBalances.map(...);
```

## Warnings

- **Sort comparator missing equality:** the comparator returns `undefined` when
  priorities are equal, giving unstable ordering.

  ```tsx
  // ❌ Before: no return for the equal case
  if (leftPriority > rightPriority) return -1;
  else if (rightPriority > leftPriority) return 1;
  // (implicitly returns undefined when equal)

  // ✅ After: a single numeric difference covers all cases
  return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
  ```

- **`blockchain` typed as `any`:** use a string-literal union and a priority
  lookup table.

  ```tsx
  // ❌ Before
  const getPriority = (blockchain: any): number => { ... }

  // ✅ After
  type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
  const getPriority = (blockchain: Blockchain): number =>
    BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
  ```

- **Array index used as React key:** index keys break reconciliation when the
  list reorders.

  ```tsx
  // ❌ Before
  <WalletRow key={index} ... />

  // ✅ After: stable, content-based key
  <WalletRow key={`${balance.blockchain}-${balance.currency}`} ... />
  ```

- **`children` destructured but never rendered:** `children` is pulled off props
  but dropped, so nested content silently disappears.

  ```tsx
  // ❌ Before
  const { children, ...rest } = props;
  return <div {...rest}>{rows}</div>; // children never rendered

  // ✅ After
  return <div {...rest}>{rows}{children}</div>;
  ```

- **Unnecessary `prices` dependency:** the sort memo lists `prices` but never
  reads it, so it re-runs on price-only changes.

  ```tsx
  // ❌ Before: prices is not used inside, but triggers recomputation
  useMemo(() => balances.filter(...).sort(...), [balances, prices]);

  // ✅ After: depend only on what the memo reads
  useMemo(() => balances.filter(...).sort(...), [balances]);
  ```

- **Repeated priority calls during sort:** `getPriority` runs twice per
  comparison. Precompute priority or use an O(1) lookup table.

  ```tsx
  // ❌ Before: recomputed on every comparison (O(n log n) calls)
  .sort((lhs, rhs) => getPriority(lhs.blockchain) - getPriority(rhs.blockchain))

  // ✅ After: O(1) lookup from a precomputed table
  const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = { ... };
  ```

## Improvements

- **Type component props once** instead of combining `React.FC<Props>` with
  `(props: Props)`.

  ```tsx
  // ❌ Before
  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;

  // ✅ After
  const WalletPage = ({ children, ...rest }: Props) => {
  ```

- **Hoist `getPriority` and the priority table to module scope** so they are not
  recreated on every render.

  ```tsx
  // ✅ After: defined once at module scope
  const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = { ... };
  const getPriority = (blockchain: Blockchain): number =>
    BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
  ```

- **Memoize formatting and USD value calculation** together with the sorted
  balance pipeline.

  ```tsx
  // ✅ After: filter → sort → format in one memoized pass
  const formattedBalances = useMemo(() =>
    balances.filter(...).sort(...).map((balance) => ({
      ...balance,
      formatted: balance.amount.toFixed(2),
      usdValue: (prices[balance.currency] ?? 0) * balance.amount,
    })),
  [balances, prices]);
  ```

- **Replace separate filter, sort, and mapping work** with one clear memoized
  flow (see the refactored code below).

## Original Code

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis': return 100
      case 'Ethereum': return 50
      case 'Arbitrum': return 30
      case 'Zilliqa': return 20
      case 'Neo': return 20
      default: return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      if (lhsPriority > -99) {
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
    });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map(
    (balance: WalletBalance) => {
      return {
        ...balance,
        formatted: balance.amount.toFixed()
      }
    })

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      )
    })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}
```

## Refactored Code

```tsx
type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

interface Props extends BoxProps {}

const WalletPage = ({ children, ...rest }: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(
    () =>
      balances
        .filter(
          (balance) =>
            getPriority(balance.blockchain) > -99 &&
            balance.amount > 0
        )
        .sort(
          (lhs, rhs) =>
            getPriority(rhs.blockchain) -
            getPriority(lhs.blockchain)
        )
        .map((balance) => ({
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue:
            (prices[balance.currency] ?? 0) * balance.amount,
        })),
    [balances, prices]
  );

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};
```

## Structure

```text
problem3/
├── Problem3Page.tsx      # page shell, theme, hero, and tab navigation
├── Problem3Page.scss     # page-level styles
├── reviewContent.ts      # findings, snippets, flow, and explanation content
├── highlight.tsx         # lightweight TS syntax highlighter
└── components/
    ├── layout/           # TopBar, Hero
    └── tabs/             # tab entrypoint
        ├── overview/     # overview tab component and style
        ├── issues/       # findings tab component and style
        ├── refactored/   # code comparison tab component and style
        └── explanation/  # explanation tab component and style
```

Each tab folder keeps its `.tsx` and `.scss` files together, while
`components/tabs/index.ts` is the public import point used by
[Problem3Page.tsx](./Problem3Page.tsx).
