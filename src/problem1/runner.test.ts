import { describe, it, expect } from 'vitest'
import { execCode, expectedSum, validateCustomInput, TEST_CASES } from './runner'
import solutionCode from './solution.js?raw'

describe('expectedSum', () => {
  it('computes the Gauss sum for positive n', () => {
    expect(expectedSum(5)).toBe(15)
    expect(expectedSum(100)).toBe(5050)
  })

  it('returns 0 for zero', () => {
    expect(expectedSum(0)).toBe(0)
  })

  it('computes the descending negative sum for negative n', () => {
    expect(expectedSum(-1)).toBe(-1)
    expect(expectedSum(-5)).toBe(-15)
  })
})

describe('execCode with the shipped solution.js', () => {
  it('all three implementations pass every built-in test case', () => {
    for (const { input } of TEST_CASES) {
      const results = execCode(solutionCode, input)
      expect(results).toHaveLength(3)
      for (const r of results) {
        expect(r.passed, `${r.name} → ${r.value}`).toBe(true)
        expect(r.error).toBeUndefined()
      }
    }
  })

  it('names the results after each implementation', () => {
    const [a, b, c] = execCode(solutionCode, 5)
    expect(a.name).toBe('sum_to_n_a(5)')
    expect(b.name).toBe('sum_to_n_b(5)')
    expect(c.name).toBe('sum_to_n_c(5)')
    expect([a.value, b.value, c.value]).toEqual([15, 15, 15])
  })

  it('reports a stack-overflow message for the recursive impl on huge n', () => {
    const results = execCode(solutionCode, 200_000)
    const recursive = results.find((r) => r.name.startsWith('sum_to_n_b'))!
    expect(recursive.passed).toBe(false)
    expect(recursive.error).toMatch(/stack overflow/i)
    // The loop and formula still succeed at that size
    const loop = results.find((r) => r.name.startsWith('sum_to_n_a'))!
    const formula = results.find((r) => r.name.startsWith('sum_to_n_c'))!
    expect(loop.passed).toBe(true)
    expect(formula.passed).toBe(true)
  })

  it('flags a wrong implementation as not passed', () => {
    const wrong = 'const sum_to_n_a = () => 0, sum_to_n_b = () => 0, sum_to_n_c = () => 0;'
    const results = execCode(wrong, 5)
    expect(results.every((r) => r.passed)).toBe(false)
  })

  it('all three implementations handle negative n consistently', () => {
    const results = execCode(solutionCode, -5)
    expect(results).toHaveLength(3)
    for (const r of results) {
      expect(r.passed, `${r.name} → ${r.value}`).toBe(true)
      expect(r.value).toBe(-15)
    }
  })

  it('returns a single Error result when the code cannot compile', () => {
    const results = execCode('this is not valid js {{{', 5)
    expect(results).toHaveLength(1)
    expect(results[0].error).toBeDefined()
  })
})

describe('validateCustomInput', () => {
  it('accepts a valid, unique integer', () => {
    expect(validateCustomInput('7', [])).toEqual({ ok: true, value: 7 })
    expect(validateCustomInput('-7', [])).toEqual({ ok: true, value: -7 })
  })

  it('rejects non-integer input', () => {
    expect(validateCustomInput('abc', [])).toMatchObject({ ok: false })
    expect(validateCustomInput('3.5', [])).toMatchObject({ ok: false })
    expect(validateCustomInput('', [])).toMatchObject({ ok: false })
  })

  it('rejects duplicates of built-in or existing custom cases', () => {
    expect(validateCustomInput('5', [])).toMatchObject({ ok: false }) // built-in
    expect(validateCustomInput('42', [42])).toMatchObject({ ok: false }) // existing
  })

  it('rejects n whose result exceeds Number.MAX_SAFE_INTEGER', () => {
    const res = validateCustomInput('200000000', [])
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/too large/)
  })
})
