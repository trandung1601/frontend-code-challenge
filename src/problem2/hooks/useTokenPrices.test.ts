// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useTokenPrices } from './useTokenPrices'
import { PRICES_URL, type PriceRow } from '../lib/tokens'

const ROWS: PriceRow[] = [
  { currency: 'ETH', date: '2023-08-29T09:00:00.000Z', price: 1646.13 },
  { currency: 'USDC', date: '2023-08-29T09:00:00.000Z', price: 1 },
  { currency: 'ETH', date: '2023-08-29T08:00:00.000Z', price: 1000 }, // stale dupe
]

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as Response

afterEach(() => vi.unstubAllGlobals())

describe('useTokenPrices', () => {
  it('fetches the feed and exposes the de-duplicated token list', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(ROWS))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useTokenPrices())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith(PRICES_URL)
    expect(result.current.error).toBeNull()
    expect(result.current.tokens.map((t) => t.symbol)).toEqual(['ETH', 'USDC'])
    expect(result.current.tokens[0].price).toBe(1646.13) // newest of the dupes
  })

  it('surfaces HTTP errors with the status code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 } as Response))

    const { result } = renderHook(() => useTokenPrices())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Request failed (503)')
    expect(result.current.tokens).toEqual([])
  })

  it('surfaces network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    const { result } = renderHook(() => useTokenPrices())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('offline')
  })

  it('refetch clears the error and retries the request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
      .mockResolvedValueOnce(okResponse(ROWS))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useTokenPrices())
    await waitFor(() => expect(result.current.error).toBe('Request failed (500)'))

    act(() => result.current.refetch())
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.tokens).toHaveLength(2)
  })
})
