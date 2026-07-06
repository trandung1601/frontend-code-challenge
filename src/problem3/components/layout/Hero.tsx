import { SiReact, SiTypescript } from 'react-icons/si'
import { ISSUES } from '../../reviewContent'
import './Hero.scss'

// Severity roll-up for the summary bar. ISSUES is static, so this is computed
// once at module load rather than on every render.
const COUNTS = {
  total: ISSUES.length,
  critical: ISSUES.filter((i) => i.severity === 'critical').length,
  warning: ISSUES.filter((i) => i.severity === 'warning').length,
  improvement: ISSUES.filter((i) => i.severity === 'improvement').length,
}

// Title block: eyebrow, heading, tech tags, blurb and the severity summary bar.
export default function Hero() {
  return (
    <header className="p3-hero">
      <div className="p3-eyebrow">
        <span>PROBLEM 3</span><span className="p3-slash">/</span><span>CODE REVIEW</span>
      </div>
      <h1 className="p3-title">Messy React</h1>
      <div className="p3-tags">
        <span className="p3-tag"><SiReact /> ReactJS</span>
        <span className="p3-tag"><SiTypescript /> TypeScript</span>
        <span className="p3-tag">Performance</span>
        <span className="p3-tag">Code Quality</span>
      </div>
      <p className="p3-lede">
        Analysis of computational inefficiencies, logic bugs, TypeScript issues, and React
        anti-patterns in the <code>WalletPage</code> component.
      </p>

      <div className="p3-summary">
        <div className="p3-summary-total">
          <span className="p3-summary-num">{COUNTS.total}</span>
          <span className="p3-summary-lbl">Issues Found</span>
        </div>
        <span className="p3-summary-div" />
        <div className="p3-summary-stat">
          <span className="p3-dot sev-critical" />
          <span><strong>{COUNTS.critical}</strong> Critical</span>
        </div>
        <div className="p3-summary-stat">
          <span className="p3-dot sev-warning" />
          <span><strong>{COUNTS.warning}</strong> Warnings</span>
        </div>
        <div className="p3-summary-stat">
          <span className="p3-dot sev-improvement" />
          <span><strong>{COUNTS.improvement}</strong> Improvements</span>
        </div>
      </div>
    </header>
  )
}
