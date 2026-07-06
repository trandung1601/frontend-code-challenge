import { useCallback, useState } from 'react'

// One completed swap, persisted to localStorage so the log survives reloads.
export type SwapRecord = {
  id: string
  time: number // epoch ms
  fromSym: string
  toSym: string
  fromAmount: number
  toAmount: number
  fromUsd: number // notional value of the swap in USD, at swap time
  rate: number // toToken per 1 fromToken
  fromAddr: string // sender address
  toAddr: string // recipient address
}

const KEY = 'flux-swap-history'
const MAX = 50 // keep the log bounded

function load(): SwapRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(records: SwapRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records))
  } catch {
    /* storage full / unavailable — history stays in-memory only */
  }
}

export function useSwapHistory() {
  const [history, setHistory] = useState<SwapRecord[]>(load)

  // Most-recent-first, capped at MAX.
  const addSwap = useCallback((rec: Omit<SwapRecord, 'id' | 'time'>) => {
    setHistory((prev) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const next = [{ ...rec, id, time: Date.now() }, ...prev].slice(0, MAX)
      save(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    save([])
  }, [])

  return { history, addSwap, clearHistory }
}
