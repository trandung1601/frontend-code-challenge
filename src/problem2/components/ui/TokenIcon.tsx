import { useState } from 'react'
import { iconUrl } from '../../lib/tokens'

// Renders the token's SVG icon, falling back to a coloured monogram if the
// repo has no image for that symbol (many long-tail tokens 404).
export default function TokenIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    const hue = [...symbol].reduce((h, c) => (h * 17 + c.charCodeAt(0)) % 360, 0)
    return (
      <span
        className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          background: `hsl(${hue} 65% 45%)`,
          color: '#fff',
        }}
      >
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={iconUrl(symbol)}
      alt={symbol}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="rounded-full shrink-0 block"
      style={{ width: size, height: size }}
    />
  )
}
