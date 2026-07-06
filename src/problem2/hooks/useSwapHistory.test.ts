// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSwapHistory, type SwapRecord } from './useSwapHistory'

const KEY = 'flux-swap-history'

const swap = (n: number): Omit<SwapRecord, 'id' | 'time'> => ({
  fromSym: 'ETH',
  toSym: 'USDC',
  fromAmount: n,
  toAmount: n * 1646,
  fromUsd: n * 1646,
  rate: 1646,
  fromAddr: '0xfrom',
  toAddr: '0xto',
})

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('useSwapHistory', () => {
  it('starts empty and prepends new swaps most-recent-first', () => {
    const { result } = renderHook(() => useSwapHistory())
    expect(result.current.history).toEqual([])

    act(() => result.current.addSwap(swap(1)))
    act(() => result.current.addSwap(swap(2)))

    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[0].fromAmount).toBe(2) // newest first
    expect(result.current.history[0].id).toBeTruthy()
    expect(result.current.history[0].time).toBeGreaterThan(0)
  })

  it('persists to localStorage and hydrates on the next mount', () => {
    const first = renderHook(() => useSwapHistory())
    act(() => first.result.current.addSwap(swap(3)))
    first.unmount()

    const second = renderHook(() => useSwapHistory())
    expect(second.result.current.history).toHaveLength(1)
    expect(second.result.current.history[0].fromAmount).toBe(3)
  })

  it('caps the log at 50 records', () => {
    const { result } = renderHook(() => useSwapHistory())

    act(() => {
      for (let i = 0; i < 55; i++) result.current.addSwap(swap(i))
    })

    expect(result.current.history).toHaveLength(50)
    expect(result.current.history[0].fromAmount).toBe(54) // newest kept
  })

  it('clears both state and storage', () => {
    const { result } = renderHook(() => useSwapHistory())
    act(() => result.current.addSwap(swap(1)))

    act(() => result.current.clearHistory())

    expect(result.current.history).toEqual([])
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([])
  })

  it('treats corrupted storage as an empty log', () => {
    localStorage.setItem(KEY, '{broken')
    const { result } = renderHook(() => useSwapHistory())
    expect(result.current.history).toEqual([])

    localStorage.setItem(KEY, JSON.stringify({ not: 'an array' }))
    const { result: r2 } = renderHook(() => useSwapHistory())
    expect(r2.current.history).toEqual([])
  })
})
