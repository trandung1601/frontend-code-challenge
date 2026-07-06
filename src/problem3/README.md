# Problem 3 — Messy React (Code Review)

List the computational inefficiencies and anti-patterns in the `WalletPage`
component below, explain how to fix them, and provide a refactored version.

> The same content is presented as an interactive dashboard at **`/problem3`**
> (Overview / Issues / Refactored Code / Explanation tabs). All the review
> content lives in [reviewContent.ts](./reviewContent.ts) — this README is
> generated from the same source so it can be read without running the app.

**15 issues found — 5 critical, 6 warnings, 4 improvements.**

---

## Critical — correctness bugs

**1. Undefined variable: `lhsPriority`**
The filter declares `balancePriority` but then checks `lhsPriority`, which does
not exist in scope. This is a `ReferenceError` at runtime.
→ Reference the variable you actually declared: `if (balancePriority > -99)`.

**2. Inverted filter: keeps empty balances**
The filter returns `true` when `amount <= 0`, so it keeps only zero/negative
balances and discards every real one — the opposite of the intent.
→ `return getPriority(balance.blockchain) > -99 && balance.amount > 0;`

**3. Missing `blockchain` property on `WalletBalance`**
`getPriority(balance.blockchain)` is called everywhere, but the interface only
declares `currency` and `amount`. This is a compile error under strict TS.
→ Add `blockchain: Blockchain` to the interface.

**4. Unsafe cast in the `rows` mapping**
`rows` maps over `sortedBalances` (`WalletBalance[]`) but types each item as
`FormattedWalletBalance` and reads `balance.formatted` — a field that was never
added, so it renders `undefined`.
→ Map over the actually-formatted list.

**5. `formattedBalances` computed but never used**
A full mapping pass builds `formattedBalances`, then `rows` iterates the
unformatted `sortedBalances` instead. The work is wasted and the formatted
amounts never reach the UI.
→ Render from `formattedBalances`, or fold formatting into one memoized pipeline.

## Warning

**6. Sort comparator missing the equality case**
The comparator only returns `-1` or `1`; when priorities are equal (e.g. Zilliqa
vs Neo, both 20) it returns `undefined` — unspecified behavior, unstable order.
→ `return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);`

**7. `blockchain` parameter typed as `any`**
`getPriority(blockchain: any)` throws away type safety.
→ Use a string-literal union `Blockchain` and a `Record` lookup instead of the switch.

**8. Array `index` used as React `key`**
The list is filtered and sorted, so indexes shift as data changes. Index keys
cause React to mis-reconcile rows (wrong state reuse, extra re-renders).
→ ``key={`${balance.blockchain}-${balance.currency}`}``

**9. `children` destructured but never rendered**
`children` is pulled out of props but the JSX only renders `rows`.
→ Render `{children}` (or stop accepting it).

**10. `prices` is an unnecessary `useMemo` dependency**
The `sortedBalances` memo never reads `prices`, yet lists it as a dependency —
every price tick re-runs the filter and sort for nothing.
→ Depend on `[balances]`; use `prices` only where it's actually read.

**11. `getPriority` called repeatedly during sort**
The comparator calls `getPriority` twice per comparison — O(n log n) redundant
calls, plus one per item in the filter.
→ Use an O(1) lookup table, or precompute priority per item before sorting.

## Improvement

**12. `React.FC<Props>` with duplicated props typing**
The component is typed twice (`React.FC<Props>` and `(props: Props)`), and
`React.FC` adds an unwanted implicit `children`.
→ Type the destructured parameter once: `({ children, ...rest }: Props)`.

**13. `getPriority` defined inside the component**
It depends on nothing yet is recreated every render.
→ Hoist it (and the priority table) to module scope.

**14. `rows` and USD values recomputed every render**
`formattedBalances` and `rows` run on every render even when inputs are unchanged.
→ Fold format + USD into the memoized pipeline so they compute only when
`balances`/`prices` change.

**15. Three separate passes over the same data**
`filter`, `sort`, and two `map` passes each walk the list.
→ One chained, memoized pipeline — filter → sort → map — done once.

---

## Original code

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

## Refactored code

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

```
problem3/
├── Problem3Page.tsx      # shell: theme, top bar, hero, tab nav
├── reviewContent.ts      # findings, code snippets, flow & explanation content
├── highlight.tsx         # tiny TS syntax highlighter for the code panels
└── components/
    ├── layout/           # TopBar, Hero (page chrome)
    └── tabs/             # Overview / Issues / Refactored / Explanation
```
