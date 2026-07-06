import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { highlight } from '../../../highlight'
import { ORIGINAL_CODE, REFACTORED_CODE } from '../../../reviewContent'
import './RefactoredTab.scss'

type Which = 'original' | 'refactored'

// A single read-only code window with a traffic-light dot and copy button.
function CodeWindow({
  code, name, dotClass, copied, onCopy,
}: {
  code: string
  name: string
  dotClass: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <section className="p3-window">
      <div className="p3-window-bar">
        <span className={`p3-dot ${dotClass}`} />
        <span className="p3-window-name">{name}</span>
        <button className="p3-copy" onClick={onCopy}>
          {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Code</>}
        </button>
      </div>
      <pre className="p3-code">{highlight(code)}</pre>
    </section>
  )
}

// Refactored tab: original vs refactored side by side, both syntax-highlighted
// and copyable.
export default function RefactoredTab() {
  const [copied, setCopied] = useState<Which | null>(null)

  function copy(which: Which, text: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(which)
    setTimeout(() => setCopied((c) => (c === which ? null : c)), 1600)
  }

  return (
    <div className="p3-refactored">
      <CodeWindow
        code={ORIGINAL_CODE}
        name="Original Code"
        dotClass="sev-critical"
        copied={copied === 'original'}
        onCopy={() => copy('original', ORIGINAL_CODE)}
      />
      <CodeWindow
        code={REFACTORED_CODE}
        name="Refactored Code"
        dotClass="sev-improvement"
        copied={copied === 'refactored'}
        onCopy={() => copy('refactored', REFACTORED_CODE)}
      />
    </div>
  )
}
