# Problem 1 — Three Ways to Sum to N  <!-- omit in toc -->

An interactive algorithm challenge for implementing three unique JavaScript
functions that compute the summation to `n`.

-   Includes a Monaco editor preloaded with the solution
-   Runs all three implementations against built-in and custom test cases
-   Supports positive, zero, and negative integer inputs
-   Keeps execution logic isolated from React for straightforward unit testing

## Table of Contents  <!-- omit in toc -->

- [Challenge](#challenge)
- [Implementations](#implementations)
- [Interactive Page](#interactive-page)
- [Files](#files)
- [Testing](#testing)

## Challenge

Implement three unique functions that compute the summation to `n`:

```js
sum_to_n(5) // 1 + 2 + 3 + 4 + 5 = 15
sum_to_n(-5) // -1 + -2 + -3 + -4 + -5 = -15
```

**Assumption:** `n` is an integer and the result stays below
`Number.MAX_SAFE_INTEGER`.

## Implementations

See [solution.js](./solution.js).

| Function | Approach | Time | Space |
| -------- | -------- | ---- | ----- |
| `sum_to_n_a` | Iterative loop | O(n) | O(1) |
| `sum_to_n_b` | Recursion | O(n) | O(n) call stack |
| `sum_to_n_c` | Gauss formula | O(1) | O(1) |

- **`sum_to_n_a`** is the straightforward readable baseline.
- **`sum_to_n_b`** is recursive; for large absolute values of `n`, it can overflow
  the call stack. The UI surfaces that trade-off as a clear stack overflow error.
- **`sum_to_n_c`** is the closed-form solution and the best practical choice for
  large inputs.

## Interactive Page

[Problem1Page.tsx](./Problem1Page.tsx) renders the live playground.

The page includes:

- A Monaco code editor preloaded with the solution.
- A test runner that compiles the editor content and runs `sum_to_n_a`,
  `sum_to_n_b`, and `sum_to_n_c`.
- Built-in test cases for common positive and zero inputs.
- Custom test input validation for integer, unique, and safe-result values.

## Files

```text
problem1/
├── solution.js        # three implementations
├── runner.ts          # pure test/exec logic with no React dependency
├── runner.test.ts     # Vitest unit tests
├── Problem1Page.tsx   # interactive editor and test runner UI
└── Problem1Page.scss  # page styles
```

## Testing

Run the unit tests from the repository root:

```bash
npm test
```
