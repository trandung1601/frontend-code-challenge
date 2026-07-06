import { ISSUES, FLOW_STEPS, CATEGORY_LABELS, CATEGORY_LONG, VERDICT, type Category } from '../../reviewContent'
import './OverviewTab.scss'

// Per-category counts + the largest, used to scale the bar widths.
const CATEGORY_COUNTS = (Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => ({
  cat,
  count: ISSUES.filter((i) => i.category === cat).length,
}))
const MAX_CATEGORY_COUNT = Math.max(...CATEGORY_COUNTS.map((c) => c.count))

// Overview tab: the data-flow trace (left) plus the category rollup and the
// plain-language verdict (right).
export default function OverviewTab() {
  return (
    <div className="p3-overview">
      <section className="p3-card">
        <div className="p3-card-label">DATA FLOW</div>
        <div className="p3-flow">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="p3-flow-item">
              <div className="p3-flow-row">
                <span className="p3-flow-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="p3-flow-label">{step.label}</span>
                {step.flag && <span className="p3-flow-flag">{step.flag}</span>}
              </div>
              {i < FLOW_STEPS.length - 1 && <div className="p3-flow-arrow">↓</div>}
            </div>
          ))}
        </div>
      </section>

      <div className="p3-overview-right">
        <section className="p3-card">
          <div className="p3-card-label">ISSUES BY CATEGORY</div>
          <div className="p3-cats">
            {CATEGORY_COUNTS.map(({ cat, count }) => (
              <div key={cat} className="p3-cat-row">
                <span className="p3-cat-name">{CATEGORY_LONG[cat]}</span>
                <div className="p3-cat-track">
                  <div
                    className={`p3-cat-bar cat-${cat}`}
                    style={{ width: `${(count / MAX_CATEGORY_COUNT) * 100}%` }}
                  />
                </div>
                <span className="p3-cat-count">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p3-card p3-verdict">
          <div className="p3-card-label">VERDICT</div>
          <p>{VERDICT}</p>
        </section>
      </div>
    </div>
  )
}
