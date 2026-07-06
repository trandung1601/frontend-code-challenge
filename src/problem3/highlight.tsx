import { Fragment, type ReactNode } from 'react'

// Lightweight TS/TSX highlighter for the read-only before/after panels.
// One regex, five capture groups → five token classes (see Problem3Page.scss).
// Deliberately tiny: it only needs to colour the two static snippets on this
// page, not be a general-purpose lexer.
const TOKEN_RE =
  /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|return|interface|extends|type|switch|case|default|if|else|function|new)\b|\b(React|useMemo|Record|number|string|boolean|any|WalletBalance|FormattedWalletBalance|Blockchain|Props|BoxProps|WalletPage|WalletRow)\b|(\b\d+(?:\.\d+)?\b)/g

// Capture group index (1-based) → token class suffix.
const GROUP_CLASS = ['comment', 'string', 'keyword', 'type', 'number'] as const

export function highlight(code: string): ReactNode {
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  let m: RegExpExecArray | null

  TOKEN_RE.lastIndex = 0
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) out.push(<Fragment key={key++}>{code.slice(last, m.index)}</Fragment>)

    let groupIdx = 0
    for (let g = 1; g <= 5; g++) {
      if (m[g] !== undefined) { groupIdx = g - 1; break }
    }
    out.push(
      <span key={key++} className={`tok-${GROUP_CLASS[groupIdx]}`}>
        {m[0]}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < code.length) out.push(<Fragment key={key}>{code.slice(last)}</Fragment>)

  return out
}
