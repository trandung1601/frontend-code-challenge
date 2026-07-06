# Problem 1 — Three Ways to Sum to N

Implement three unique functions that compute the summation from `1` to `n`:

```
sum_to_n(5) // 1 + 2 + 3 + 4 + 5 = 15
```

**Assumption:** `n` is a non-negative integer and the result stays below
`Number.MAX_SAFE_INTEGER`.

## The three implementations

See [solution.js](./solution.js).

| Function | Approach | Time | Space |
|---|---|---|---|
| `sum_to_n_a` | Iterative loop | O(n) | O(1) |
| `sum_to_n_b` | Recursion | O(n) | O(n) — call stack |
| `sum_to_n_c` | Gauss formula `n(n+1)/2` | O(1) | O(1) |

- **`sum_to_n_a`** — the straightforward, readable baseline.
- **`sum_to_n_b`** — recursive; note that for large `n` it overflows the call
  stack (O(n) depth). That is the expected trade-off of the recursive approach,
  not a bug — the UI surfaces it as a clear "stack overflow" message.
- **`sum_to_n_c`** — the closed-form solution; constant time and the one you'd
  ship in practice.

## Interactive page

[Problem1Page.tsx](./Problem1Page.tsx) renders a live playground:

- A Monaco code editor pre-loaded with the solution.
- A **test runner** that compiles the code and runs all three functions against
  a set of built-in cases (`0, 1, 5, 10, 100`), showing pass/fail per function.
- **Custom test inputs** with validation (integer, non-negative, unique, within
  the safe-integer range) — see `validateCustomInput` in [runner.ts](./runner.ts).

## Files

```
problem1/
├── solution.js        # the three implementations
├── runner.ts          # pure test/exec logic (no React) — easy to unit-test
├── runner.test.ts     # Vitest unit tests
└── Problem1Page.tsx   # interactive editor + test runner UI
```

Run the unit tests with `npm run test`.
