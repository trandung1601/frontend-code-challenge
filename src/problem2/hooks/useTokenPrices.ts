import { useCallback, useEffect, useState } from 'react'
import { buildTokens, PRICES_URL, type PriceRow, type Token } from '../lib/tokens'

type State = {
  tokens: Token[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Fetches the live price feed and reduces it to a clean, de-duplicated token
// list. Exposes loading / error state so the UI can react gracefully.
export function useTokenPrices(): State {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Bumping this key re-runs the fetch effect (used by refetch).
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(PRICES_URL)
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        const rows: PriceRow[] = await res.json()
        if (!cancelled) setTokens(buildTokens(rows))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load prices')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchKey])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    setFetchKey((k) => k + 1)
  }, [])

  return { tokens, loading, error, refetch }
}
