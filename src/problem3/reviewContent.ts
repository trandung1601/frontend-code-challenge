// ═══════════════════════════════════════════════════════════════════════════
// Problem 3 — content for the code-review dashboard.
// The findings, data-flow, category rollup and before/after code all live here
// so the page component stays presentational.
// ═══════════════════════════════════════════════════════════════════════════

export type Severity = 'critical' | 'warning' | 'improvement'
export type Category = 'logic' | 'typescript' | 'react' | 'performance'

export interface Issue {
  id: number
  severity: Severity
  category: Category
  title: string
  description: string
  currentCode: string
  suggestedCode: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  logic: 'Logic',
  typescript: 'TypeScript',
  react: 'React',
  performance: 'Performance',
}

// Long-form labels used by the "issues by category" rollup on the Overview tab.
export const CATEGORY_LONG: Record<Category, string> = {
  logic: 'Logic bugs',
  typescript: 'TypeScript issues',
  react: 'React anti-patterns',
  performance: 'Performance issues',
}

export const ISSUES: Issue[] = [
  {
    id: 1, severity: 'critical', category: 'logic',
    title: 'Undefined variable: lhsPriority',
    description:
      'The filter callback declares balancePriority but then checks lhsPriority, which does not exist anywhere in scope. This is a ReferenceError at runtime.',
    currentCode: 'const balancePriority = getPriority(balance.blockchain);\nif (lhsPriority > -99) { ... }',
    suggestedCode: 'const balancePriority = getPriority(balance.blockchain);\nif (balancePriority > -99) { ... }',
  },
  {
    id: 2, severity: 'critical', category: 'logic',
    title: 'Inverted filter: keeps empty balances',
    description:
      'The filter returns true when amount <= 0, so the list keeps only zero and negative balances and discards every real one. The intent is the opposite.',
    currentCode: 'if (balance.amount <= 0) {\n  return true;\n}',
    suggestedCode: 'return getPriority(balance.blockchain) > -99\n  && balance.amount > 0;',
  },
  {
    id: 3, severity: 'critical', category: 'typescript',
    title: 'Missing blockchain property on WalletBalance',
    description:
      'getPriority(balance.blockchain) is called everywhere, but the WalletBalance interface only declares currency and amount. This is a compile error under strict TypeScript.',
    currentCode: 'interface WalletBalance {\n  currency: string;\n  amount: number;\n}',
    suggestedCode: 'interface WalletBalance {\n  currency: string;\n  amount: number;\n  blockchain: Blockchain;\n}',
  },
  {
    id: 4, severity: 'critical', category: 'typescript',
    title: 'Unsafe cast in rows mapping',
    description:
      'rows maps over sortedBalances (WalletBalance[]) but types each item as FormattedWalletBalance and reads balance.formatted — a property that was never added. It renders undefined.',
    currentCode: 'sortedBalances.map(\n  (balance: FormattedWalletBalance) =>\n    balance.formatted // undefined',
    suggestedCode: 'formattedBalances.map(\n  (balance) => balance.formatted\n) // formatted actually exists',
  },
  {
    id: 5, severity: 'critical', category: 'logic',
    title: 'formattedBalances computed but never used',
    description:
      'A full mapping pass builds formattedBalances, then rows iterates the unformatted sortedBalances instead. The work is wasted and the formatted amounts never reach the UI.',
    currentCode: 'const formattedBalances = sortedBalances.map(...)\nconst rows = sortedBalances.map(...) // wrong list',
    suggestedCode: 'const rows = formattedBalances.map(...)\n// or fold formatting into one memoized pipeline',
  },
  {
    id: 6, severity: 'warning', category: 'logic',
    title: 'Sort comparator missing equality case',
    description:
      'The comparator only returns -1 or 1; when priorities are equal (e.g. Zilliqa vs Neo, both 20) it returns undefined, which is unspecified behavior and can produce unstable ordering.',
    currentCode: 'if (leftPriority > rightPriority) return -1;\nelse if (rightPriority > leftPriority) return 1;\n// no return 0',
    suggestedCode: 'return getPriority(rhs.blockchain)\n  - getPriority(lhs.blockchain);',
  },
  {
    id: 7, severity: 'warning', category: 'typescript',
    title: 'blockchain parameter typed as any',
    description:
      'getPriority(blockchain: any) throws away type safety. A string-literal union catches typos at compile time and lets a Record replace the switch entirely.',
    currentCode: 'const getPriority = (blockchain: any): number => {\n  switch (blockchain) { ... }\n}',
    suggestedCode: "type Blockchain = 'Osmosis' | 'Ethereum'\n  | 'Arbitrum' | 'Zilliqa' | 'Neo';\nconst getPriority = (b: Blockchain): number =>\n  BLOCKCHAIN_PRIORITY[b] ?? -99;",
  },
  {
    id: 8, severity: 'warning', category: 'react',
    title: 'Array index used as key',
    description:
      'The list is filtered and sorted, so indexes shift as data changes. Index keys cause React to mis-reconcile rows, leading to wrong state reuse and unnecessary re-renders.',
    currentCode: '<WalletRow key={index} ... />',
    suggestedCode: '<WalletRow\n  key={`${balance.blockchain}-${balance.currency}`}\n  ... />',
  },
  {
    id: 9, severity: 'warning', category: 'react',
    title: 'children destructured but never rendered',
    description:
      'children is pulled out of props but the returned JSX only renders rows. Either render {children} or stop accepting it — silently dropping it is misleading to consumers.',
    currentCode: 'const { children, ...rest } = props;\nreturn <div {...rest}>{rows}</div>;',
    suggestedCode: 'return (\n  <div {...rest}>\n    {rows}\n    {children}\n  </div>\n);',
  },
  {
    id: 10, severity: 'warning', category: 'performance',
    title: 'prices is an unnecessary useMemo dependency',
    description:
      'The sortedBalances memo never reads prices, yet lists it as a dependency. Every price tick re-runs the filter and sort for nothing.',
    currentCode: 'useMemo(() => {\n  // only uses balances\n}, [balances, prices]);',
    suggestedCode: 'useMemo(() => {\n  ...\n}, [balances]); // prices only where used',
  },
  {
    id: 11, severity: 'warning', category: 'performance',
    title: 'getPriority called repeatedly during sort',
    description:
      'The comparator calls getPriority twice per comparison — O(n log n) redundant calls, on top of one call per item in the filter. Priorities can be computed once per item.',
    currentCode: '.sort((lhs, rhs) => {\n  const l = getPriority(lhs.blockchain);\n  const r = getPriority(rhs.blockchain);\n  ...',
    suggestedCode: '// O(1) lookup table instead of a switch,\n// or precompute priority per item before sorting\nBLOCKCHAIN_PRIORITY[b] ?? -99',
  },
  {
    id: 12, severity: 'improvement', category: 'react',
    title: 'React.FC<Props> with duplicated props typing',
    description:
      'The component is typed twice: React.FC<Props> and (props: Props). Type the destructured parameter once; React.FC adds little and its implicit children is unwanted here.',
    currentCode: 'const WalletPage: React.FC<Props> =\n  (props: Props) => { ... }',
    suggestedCode: 'const WalletPage =\n  ({ children, ...rest }: Props) => { ... }',
  },
  {
    id: 13, severity: 'improvement', category: 'react',
    title: 'getPriority defined inside the component',
    description:
      'The function has no dependency on props or state, yet is recreated on every render. Hoist it (and the priority table) to module scope.',
    currentCode: 'const WalletPage = (props) => {\n  const getPriority = (blockchain) => { ... }',
    suggestedCode: 'const BLOCKCHAIN_PRIORITY = { Osmosis: 100, ... };\nconst getPriority = (b) => ...;\nconst WalletPage = (props) => { ... }',
  },
  {
    id: 14, severity: 'improvement', category: 'performance',
    title: 'rows and USD values recomputed every render',
    description:
      'formattedBalances and rows run on every render even when inputs are unchanged. Folding format + USD calculation into the memoized pipeline computes them only when balances or prices change.',
    currentCode: 'const rows = sortedBalances.map((balance) => {\n  const usdValue = prices[balance.currency] * balance.amount;\n  ...',
    suggestedCode: 'const formattedBalances = useMemo(() =>\n  balances.filter(...).sort(...).map(...),\n[balances, prices]);',
  },
  {
    id: 15, severity: 'improvement', category: 'performance',
    title: 'Three separate passes over the same data',
    description:
      'filter, sort, and two map passes each walk the list. One chained, memoized pipeline is easier to read and does the formatting exactly once.',
    currentCode: 'sortedBalances = filter + sort\nformattedBalances = map (discarded)\nrows = map (again)',
    suggestedCode: 'balances\n  .filter(...)\n  .sort(...)\n  .map(...) // one pipeline, one memo',
  },
]

// Data-flow steps for the Overview tab; `flag` marks where a bug bites.
export const FLOW_STEPS: { label: string; flag: string | null }[] = [
  { label: 'Wallet balances', flag: null },
  { label: 'Filter balances', flag: 'lhsPriority bug' },
  { label: 'Sort by blockchain priority', flag: 'no return 0' },
  { label: 'Format amount', flag: 'result discarded' },
  { label: 'Calculate USD value', flag: null },
  { label: 'Render WalletRow', flag: 'index as key' },
]

export interface ExplanationGroup {
  title: string
  category: Category
  points: string[]
}

export const EXPLANATION_GROUPS: ExplanationGroup[] = [
  {
    title: 'Logic & correctness', category: 'logic', points: [
      'lhsPriority is never declared — the filter references a variable that does not exist and crashes at runtime.',
      'The amount <= 0 condition is inverted: the list keeps empty balances and drops real ones.',
      'formattedBalances is built and immediately abandoned; rows renders the unformatted list, so balance.formatted is undefined.',
      'The sort comparator never returns 0 for equal priorities, which is unspecified behavior and makes ordering unstable.',
    ],
  },
  {
    title: 'TypeScript', category: 'typescript', points: [
      'WalletBalance is missing the blockchain property that the whole pipeline depends on.',
      'getPriority takes any, disabling type checking; a string-literal union catches typos at compile time.',
      'sortedBalances items are cast to FormattedWalletBalance without actually having the formatted field — the types lie.',
    ],
  },
  {
    title: 'React', category: 'react', points: [
      'Array index as key breaks reconciliation for a list that is filtered and re-sorted.',
      'children is destructured from props but never rendered.',
      'React.FC<Props> plus (props: Props) types the component twice; typing the destructured parameter once is cleaner.',
      'getPriority lives inside the component and is recreated on every render despite depending on nothing.',
    ],
  },
  {
    title: 'Performance', category: 'performance', points: [
      'prices is a useMemo dependency but is never read inside — every price tick re-filters and re-sorts.',
      'A whole mapping pass (formattedBalances) is wasted work.',
      'getPriority runs twice per sort comparison instead of once per item, or once via a lookup table.',
      'rows and USD values are rebuilt on every render; folding them into the memoized pipeline computes them only when inputs change.',
    ],
  },
]

export const VERDICT =
  'The component computes correct-looking output by accident: the filter references an undefined variable, keeps only empty balances, and the formatted list is thrown away. The refactor collapses filter, sort, and format into one memoized pass with strict types.'

export const ORIGINAL_CODE = `interface WalletBalance {
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
}`

export const REFACTORED_CODE = `type Blockchain =
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
          key={\`\${balance.blockchain}-\${balance.currency}\`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};`
