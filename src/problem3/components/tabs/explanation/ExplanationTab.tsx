import { EXPLANATION_GROUPS } from '../../../reviewContent'
import './ExplanationTab.scss'

// Explanation tab: the findings grouped into prose bullet lists per concern
// (logic, TypeScript, React, performance).
export default function ExplanationTab() {
  return (
    <div className="p3-explanation">
      {EXPLANATION_GROUPS.map((group) => (
        <section key={group.category} className="p3-card">
          <div className="p3-expl-head">
            <span className={`p3-dot cat-${group.category}`} />
            <h3>{group.title}</h3>
          </div>
          <div className="p3-expl-points">
            {group.points.map((pt, i) => (
              <div key={i} className="p3-expl-point">
                <span className="p3-expl-bullet">•</span>
                <p>{pt}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
