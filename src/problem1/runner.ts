// Pure logic for Problem 1 — no React / DOM, so it is easy to unit-test.

export interface TestCase {
  input: number
  expected: number
}

export interface RunResult {
  name: string
  value: number | null
  passed: boolean
  error?: string
}

export const TEST_CASES: TestCase[] = [
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: 5, expected: 15 },
  { input: 10, expected: 55 },
  { input: 100, expected: 5050 },
]

/** Ground-truth sum 1..n via Gauss formula. Non-positive n yields 0. */
export function expectedSum(n: number): number {
  return n <= 0 ? 0 : (n * (n + 1)) / 2
}

/** Compile the user's code and run all three implementations against n. */
export function execCode(code: string, n: number): RunResult[] {
  const expected = expectedSum(n)
  try {
    // Strip TypeScript type annotations so new Function can run plain JS
    const js = code.replace(/:\s*(number|string|boolean|void|any)/g, '')
    const factory = new Function(`
      "use strict";
      ${js}
      return { sum_to_n_a, sum_to_n_b, sum_to_n_c };
    `)
    const fns = factory() as Record<string, (n: number) => number>
    return (['sum_to_n_a', 'sum_to_n_b', 'sum_to_n_c'] as const).map((name) => {
      try {
        const value = fns[name](n)
        return { name: `${name}(${n})`, value, passed: value === expected }
      } catch (e) {
        // A recursive solution (O(n) call stack) overflows for large n — this is
        // the expected trade-off, not a bug. Surface it as a clear message.
        const error =
          e instanceof RangeError && /call stack/i.test(e.message)
            ? 'Stack overflow — n too deep for recursion (O(n) call stack)'
            : String(e)
        return { name: `${name}(${n})`, value: null, passed: false, error }
      }
    })
  } catch (e) {
    return [{ name: 'Error', value: null, passed: false, error: String(e) }]
  }
}

export type ValidationResult =
  | { ok: true; value: number }
  | { ok: false; error: string }

/**
 * Validate a custom test input against the problem constraints:
 * integer, non-negative (assumption), unique, result < MAX_SAFE_INTEGER.
 */
export function validateCustomInput(raw: string, existing: number[]): ValidationResult {
  const trimmed = raw.trim()
  if (trimmed === '' || !/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: 'Please enter a valid integer' }
  }
  const value = Number.parseInt(trimmed, 10)
  // Assumption: n is a non-negative integer (n >= 0)
  if (value < 0) {
    return { ok: false, error: 'n must be >= 0 (see assumption)' }
  }
  const builtIn = TEST_CASES.some((tc) => tc.input === value)
  if (builtIn || existing.includes(value)) {
    return { ok: false, error: `n = ${value} is already in the list` }
  }
  // Constraint: the result must stay below Number.MAX_SAFE_INTEGER
  if (expectedSum(value) > Number.MAX_SAFE_INTEGER) {
    return { ok: false, error: 'Result would exceed Number.MAX_SAFE_INTEGER' }
  }
  return { ok: true, value }
}
