import { useState } from 'react'
import { ISSUES, CATEGORY_LABELS, type Category, type Severity } from '../../../reviewContent'
import './IssuesTab.scss'

type Filter = 'all' | Category

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'logic', label: 'Logic' },
  { key: 'typescript', label: 'TypeScript' },
  { key: 'react', label: 'React' },
  { key: 'performance', label: 'Performance' },
]

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  improvement: 'Improvement',
}

// Issues tab: category filter pills + one card per finding, each showing the
// current code beside the suggested fix.
export default function IssuesTab() {
  const [filter, setFilter] = useState<Filter>('all')
  const filteredIssues = ISSUES.filter((i) => filter === 'all' || i.category === filter)

  return (
    <div className="p3-issues">
      <div className="p3-filters">
        {FILTERS.map((f) => {
          const count = f.key === 'all'
            ? ISSUES.length
            : ISSUES.filter((i) => i.category === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`p3-filter ${filter === f.key ? 'p3-filter-on' : ''}`}
            >
              {f.label} ({count})
            </button>
          )
        })}
      </div>

      {filteredIssues.map((issue) => (
        <article key={issue.id} className="p3-card p3-issue">
          <div className="p3-issue-head">
            <span className={`p3-badge sev-${issue.severity}`}>{SEVERITY_LABELS[issue.severity]}</span>
            <span className="p3-issue-cat">{CATEGORY_LABELS[issue.category]}</span>
            <span className="p3-issue-id">#{issue.id}</span>
          </div>
          <h3 className="p3-issue-title">{issue.title}</h3>
          <p className="p3-issue-desc">{issue.description}</p>
          <div className="p3-issue-code">
            <div className="p3-codeblock">
              <span className="p3-codeblock-label bad">CURRENT CODE</span>
              <pre className="p3-pre bad">{issue.currentCode}</pre>
            </div>
            <div className="p3-codeblock">
              <span className="p3-codeblock-label good">SUGGESTED FIX</span>
              <pre className="p3-pre good">{issue.suggestedCode}</pre>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
