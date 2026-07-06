import { useState } from 'react'
import TopBar from './components/layout/TopBar'
import Hero from './components/layout/Hero'
import OverviewTab from './components/tabs/OverviewTab'
import IssuesTab from './components/tabs/IssuesTab'
import RefactoredTab from './components/tabs/RefactoredTab'
import ExplanationTab from './components/tabs/ExplanationTab'
import './Problem3Page.scss'

type Tab = 'overview' | 'issues' | 'refactored' | 'explanation'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'issues', label: 'Issues' },
  { key: 'refactored', label: 'Refactored Code' },
  { key: 'explanation', label: 'Explanation' },
]

// Problem 3 — a code-review dashboard for the messy WalletPage component.
// This file only wires the shell together (theme, top bar, hero, tab nav);
// each tab lives in its own component under ./components so the content can be
// read and reasoned about in isolation.
export default function Problem3Page({
  dark,
  onToggleDark,
}: {
  dark: boolean
  onToggleDark: () => void
}) {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      className="p3 min-h-screen font-sans antialiased"
      style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'Archivo, system-ui, sans-serif' }}
    >
      <TopBar dark={dark} onToggleDark={onToggleDark} />

      <div className="p3-wrap">
        <Hero />

        <nav className="p3-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`p3-tab ${tab === t.key ? 'p3-tab-on' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'issues' && <IssuesTab />}
        {tab === 'refactored' && <RefactoredTab />}
        {tab === 'explanation' && <ExplanationTab />}

        <footer className="p3-footer">
          <span>Submitted by <b>Dung Tran</b> · Frontend Engineer</span>
          <span>99Tech Code Challenge · 2026</span>
        </footer>
      </div>
    </div>
  )
}
