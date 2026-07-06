import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import './Problem1Page.scss'
import {
  FiCode, FiSun, FiMoon, FiHelpCircle, FiRotateCcw,
  FiShield, FiInfo, FiStar, FiMinus, FiPlus, FiPlay, FiCheck, FiX, FiAlertTriangle,
} from 'react-icons/fi'
import { LuClipboardList, LuLightbulb } from 'react-icons/lu'
import { SiJavascript } from 'react-icons/si'
import solutionCode from './solution.js?raw'
import { TEST_CASES, execCode, expectedSum, validateCustomInput, type RunResult } from './runner'

export default function Problem1Page({
  dark,
  onToggleDark,
}: {
  dark: boolean
  onToggleDark: () => void
}) {
  const navigate = useNavigate()
  const [code, setCode] = useState(solutionCode)
  const [n, setN] = useState(5)
  const [results, setResults] = useState<RunResult[] | null>(null)
  const [customInput, setCustomInput] = useState('')
  const [customCases, setCustomCases] = useState<number[]>([])
  const [customError, setCustomError] = useState('')

  // Resize state
  const [leftWidth, setLeftWidth] = useState(288)
  const [rightWidth, setRightWidth] = useState(400)
  const dragging = useRef<'left' | 'right' | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = side
    startX.current = e.clientX
    startWidth.current = side === 'left' ? leftWidth : rightWidth

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current
      if (dragging.current === 'left') {
        setLeftWidth(Math.max(200, Math.min(500, startWidth.current + delta)))
      } else {
        setRightWidth(Math.max(280, Math.min(600, startWidth.current - delta)))
      }
    }

    const handleMouseUp = () => {
      dragging.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleRun = useCallback(() => {
    setResults(execCode(code, n))
  }, [code, n])

  const handleReset = () => {
    setCode(solutionCode)
    setResults(null)
    setCustomCases([])
    setCustomInput('')
    setCustomError('')
  }

  const handleAddCustom = () => {
    const result = validateCustomInput(customInput, customCases)
    if (!result.ok) {
      setCustomError(result.error)
      return
    }
    const val = result.value
    setCustomCases((prev) => [...prev, val])
    setCustomInput('')
    setCustomError('')
    // Immediately run the newly added case for instant feedback
    setN(val)
    setResults(execCode(code, val))
  }

  const handleRemoveCustom = (val: number) => {
    setCustomCases((prev) => prev.filter((v) => v !== val))
  }

  const handleTestCaseClick = (input: number) => {
    setN(input)
    setResults(execCode(code, input))
  }

  const allCases = [
    ...TEST_CASES.map((tc) => ({ ...tc, custom: false })),
    ...customCases.map((input) => ({
      input,
      expected: expectedSum(input),
      custom: true,
    })),
  ]

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      className="h-screen flex flex-col font-sans antialiased overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'Archivo, system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 shrink-0 border-b"
        style={{ height: 56, borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-[17px] tracking-tight cursor-pointer bg-transparent border-0 p-0"
          style={{ color: 'var(--fg)' }}
        >
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[15px]"
            style={{ background: '#b6f24a', color: '#0a0b0d' }}
          >
            <FiCode />
          </span>
          Code Challenge
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDark}
            className="w-9 h-9 flex items-center justify-center rounded-lg border cursor-pointer bg-transparent text-[18px]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            title="Toggle theme"
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>
          <button
            className="flex items-center gap-[6px] px-4 py-[7px] rounded-lg text-[13px] font-medium border cursor-pointer bg-transparent"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            <FiHelpCircle className="text-[15px]" /> Help
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-[6px] px-4 py-[7px] rounded-lg text-[13px] font-semibold border cursor-pointer"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}
          >
            <FiRotateCcw /> Reset
          </button>
        </div>
      </header>

      {/* ── 3-column body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: problem description ── */}
        <aside
          className="shrink-0 overflow-y-auto p-5 border-r space-y-5"
          style={{ width: leftWidth, borderColor: 'var(--border)' }}
        >
          <span
            className="inline-block font-mono text-[11px] tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ background: 'rgba(99,118,255,0.15)', color: '#818cf8' }}
          >
            Problem 1
          </span>

          <h1 className="text-[22px] font-bold leading-tight m-0" style={{ color: 'var(--fg)' }}>
            Three ways to sum to n
          </h1>

          {/* Task */}
          <section>
            <div className="flex items-center gap-2 mb-2 font-semibold text-[13px]" style={{ color: 'var(--fg)' }}>
              <LuClipboardList className="text-[15px]" /> Task
            </div>
            <p className="text-[13px] leading-relaxed m-0 mb-3" style={{ color: 'var(--muted)' }}>
              Provide 3 unique implementations of the following function in JavaScript.
            </p>
            <ul className="m-0 pl-4 space-y-2 text-[13px]" style={{ color: 'var(--fg)' }}>
              <li>
                <b>Input:</b> <code className="font-mono">n</code> — any integer
                <p className="m-0 mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>
                  Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.
                </p>
              </li>
              <li>
                <b>Output:</b> <code className="font-mono">return</code> — summation to n, i.e.
                <p className="m-0 mt-1 font-mono text-[12px]" style={{ color: 'var(--muted)' }}>
                  sum_to_n(5) === 1+2+3+4+5 === 15
                </p>
              </li>
            </ul>
          </section>

          {/* Example */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'rgba(99,118,255,0.08)', border: '1px solid rgba(99,118,255,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2 font-semibold text-[13px]" style={{ color: '#818cf8' }}>
              <LuLightbulb className="text-[15px]" /> Example
            </div>
            <p className="font-mono text-[13px] m-0" style={{ color: 'var(--fg)' }}>
              sum_to_n(5) → <b>15</b>
            </p>
            <p className="font-mono text-[12px] m-0 mt-1" style={{ color: 'var(--muted)' }}>
              1 + 2 + 3 + 4 + 5 = 15
            </p>
          </section>

          {/* Constraints */}
          <section>
            <div className="flex items-center gap-2 mb-2 font-semibold text-[13px]" style={{ color: 'var(--fg)' }}>
              <FiShield className="text-[15px]" /> Constraints
            </div>
            <p className="text-[13px] m-0" style={{ color: 'var(--muted)' }}>
              The result will always be less than <code className="font-mono">Number.MAX_SAFE_INTEGER</code>.
            </p>
          </section>

          {/* Assumption */}
          <section>
            <div className="flex items-center gap-2 mb-2 font-semibold text-[13px]" style={{ color: 'var(--fg)' }}>
              <FiInfo className="text-[15px]" /> Assumption
            </div>
            <p className="text-[13px] m-0 font-mono" style={{ color: 'var(--muted)' }}>
              n is an integer. Negative n sums -1 + -2 + ... + n.
            </p>
          </section>
        </aside>

        {/* ── Left resize handle ── */}
        <div
          onMouseDown={handleMouseDown('left')}
          className="shrink-0 w-[4px] cursor-col-resize hover:bg-[#6366f1] transition-colors"
          style={{ background: 'transparent' }}
        />

        {/* ── Center: code editor ── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* editor toolbar */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-semibold text-[15px]">Implement your functions</span>
            <div
              className="flex items-center gap-2 px-3 py-[5px] rounded-lg text-[12px] font-mono border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}
            >
              <SiJavascript className="text-[14px] text-[#f7df1e]" />
              <span style={{ color: 'var(--muted)' }}>JavaScript</span>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              theme={dark ? 'vs-dark' : 'light'}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Menlo, monospace',
                fontLigatures: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Explanation strip */}
          <div
            className="border-t px-5 py-4 shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p className="text-[12px] font-semibold mb-3 m-0" style={{ color: 'var(--muted)' }}>
              Explanation &amp; Complexity <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { dot: '#6366f1', label: 'sum_to_n_a', sub: '(Loop)', time: 'O(n)', space: 'O(1)', note: 'Simple and intuitive.' },
                { dot: '#22c55e', label: 'sum_to_n_b', sub: '(Recursion)', time: 'O(n)', space: 'O(n)', note: 'Elegant but uses call stack.' },
                { dot: '#eab308', label: 'sum_to_n_c', sub: '(Formula)', time: 'O(1)', space: 'O(1)', note: 'Best for large inputs.' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-[3px] min-w-[130px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.dot }} />
                    <span className="font-mono text-[12px] font-semibold" style={{ color: 'var(--fg)' }}>{item.label}</span>
                  </div>
                  <span className="text-[11px] pl-4" style={{ color: 'var(--muted)' }}>{item.sub}</span>
                  <span className="text-[11px] pl-4" style={{ color: 'var(--muted)' }}>Time: {item.time}</span>
                  <span className="text-[11px] pl-4" style={{ color: 'var(--muted)' }}>Space: {item.space}</span>
                  <span className="text-[11px] pl-4 italic" style={{ color: 'var(--muted)' }}>{item.note}</span>
                </div>
              ))}

              {/* Best pick */}
              <div
                className="flex flex-col gap-[3px] ml-auto rounded-xl px-4 py-3"
                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)' }}
              >
                <div className="flex items-center gap-2">
                  <FiStar className="text-[14px]" style={{ color: '#eab308' }} />
                  <span className="text-[12px] font-semibold" style={{ color: '#eab308' }}>Best for large n</span>
                </div>
                <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>
                  <code className="font-mono">sum_to_n_c</code> is the most
                </p>
                <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>
                  <b style={{ color: 'var(--fg)' }}>efficient</b> with constant
                </p>
                <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>
                  time and space.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* ── Right resize handle ── */}
        <div
          onMouseDown={handleMouseDown('right')}
          className="shrink-0 w-[4px] cursor-col-resize hover:bg-[#6366f1] transition-colors"
          style={{ background: 'transparent' }}
        />

        {/* ── Right: test panel ── */}
        <aside
          className="shrink-0 overflow-y-auto border-l"
          style={{ width: rightWidth, borderColor: 'var(--border)' }}
        >
          <div className="p-5 space-y-6">

            {/* Header */}
            <h2 className="text-[16px] font-bold m-0" style={{ color: 'var(--fg)' }}>Test your code</h2>

            {/* Input + Run */}
            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--muted)' }}>
                Input (n)
              </label>
              <div className="flex gap-3">
                {/* Stepper */}
                <div
                  className="flex items-center gap-1 flex-1 p-1 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <button
                    type="button"
                    onClick={() => setN((v) => v - 1)}
                    aria-label="Decrease"
                    className="stepper-btn flex items-center justify-center w-9 h-9 rounded-lg text-[16px] font-medium cursor-pointer border-0 shrink-0 transition-colors"
                    style={{ background: 'var(--bg)', color: 'var(--fg)' }}
                  >
                    <FiMinus />
                  </button>
                  <input
                    type="number"
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="min-w-0 flex-1 text-center bg-transparent text-[15px] font-mono outline-none"
                    style={{ color: 'var(--fg)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setN((v) => v + 1)}
                    aria-label="Increase"
                    className="stepper-btn flex items-center justify-center w-9 h-9 rounded-lg text-[16px] font-medium cursor-pointer border-0 shrink-0 transition-colors"
                    style={{ background: 'var(--bg)', color: 'var(--fg)' }}
                  >
                    <FiPlus />
                  </button>
                </div>
                <button
                  onClick={handleRun}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] font-semibold cursor-pointer border-0 shrink-0"
                  style={{ background: '#6366f1', color: '#fff' }}
                >
                  <FiPlay className="text-[13px]" /> Run
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div>
                <p className="text-[13px] font-semibold mb-3 m-0" style={{ color: 'var(--fg)' }}>Results</p>
                <div className="space-y-2">
                  {results.map((r, i) =>
                    r.error ? (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.35)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[13px]" style={{ color: 'var(--fg)' }}>{r.name}</span>
                          <span
                            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-[2px] rounded-full"
                            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}
                          >
                            <FiAlertTriangle className="text-[12px]" /> Error
                          </span>
                        </div>
                        <p className="flex items-start gap-2 m-0 mt-2 text-[12px] leading-snug" style={{ color: '#f87171' }}>
                          <FiAlertTriangle className="text-[13px] mt-[2px] shrink-0" />
                          <span>{r.error}</span>
                        </p>
                      </div>
                    ) : (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{
                          background: 'var(--surface)',
                          border: `1px solid ${r.passed ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.35)'}`,
                        }}
                      >
                        <span className="font-mono text-[13px]" style={{ color: 'var(--muted)' }}>{r.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[15px]" style={{ color: '#6366f1' }}>
                            {r.value}
                          </span>
                          <span className={r.passed ? 'text-green-400' : 'text-red-400'}>
                            {r.passed ? <FiCheck className="text-[16px]" /> : <FiX className="text-[16px]" />}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Custom test */}
            <div>
              <p className="text-[13px] font-semibold mb-1 m-0" style={{ color: 'var(--fg)' }}>Custom Test</p>
              <p className="text-[12px] mb-2 m-0" style={{ color: 'var(--muted)' }}>Add custom input to test your functions</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter an integer"
                  value={customInput}
                  onChange={(e) => { setCustomInput(e.target.value); if (customError) setCustomError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[13px] border outline-none"
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${customError ? '#f87171' : 'var(--border)'}`,
                    color: 'var(--fg)',
                  }}
                />
                <button
                  onClick={handleAddCustom}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold border cursor-pointer shrink-0"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}
                >
                  Add
                </button>
              </div>
              {customError && (
                <p className="text-[12px] mt-2 m-0" style={{ color: '#f87171' }}>{customError}</p>
              )}
            </div>

            {/* Test cases */}
            <div>
              <p className="text-[13px] font-semibold mb-3 m-0" style={{ color: 'var(--fg)' }}>Test Cases</p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                <div
                  className="grid px-4 py-2 text-[11px] font-semibold tracking-wider uppercase"
                  style={{ gridTemplateColumns: '1fr 1fr auto', color: 'var(--muted)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
                >
                  <span>Input (n)</span>
                  <span>Expected Output</span>
                  <span className="w-5" />
                </div>
                {allCases.map((tc, i) => (
                  <div
                    key={i}
                    onClick={() => handleTestCaseClick(tc.input)}
                    className="test-row group w-full grid items-center px-4 py-[10px] text-[13px] cursor-pointer transition-colors"
                    style={{
                      gridTemplateColumns: '1fr 1fr auto',
                      background: n === tc.input ? 'rgba(99,102,241,0.08)' : 'transparent',
                      borderBottom: i < allCases.length - 1 ? '1px solid var(--border)' : 'none',
                      color: 'var(--fg)',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>{tc.input}</span>
                      {tc.custom && (
                        <span
                          className="text-[10px] font-mono px-[6px] py-[1px] rounded-full"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
                        >
                          custom
                        </span>
                      )}
                    </span>
                    <span style={{ color: 'var(--muted)' }}>{tc.expected}</span>
                    {tc.custom ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveCustom(tc.input) }}
                        aria-label={`Remove n = ${tc.input}`}
                        className="remove-btn flex items-center justify-center w-5 h-5 rounded text-[13px] leading-none cursor-pointer border-0 bg-transparent"
                        style={{ color: 'var(--muted)' }}
                      >
                        <FiX />
                      </button>
                    ) : (
                      <span className="w-5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  )
}
