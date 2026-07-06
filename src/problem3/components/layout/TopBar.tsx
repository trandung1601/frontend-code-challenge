import { useNavigate } from 'react-router-dom'
import { FiCode, FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi'
import './TopBar.scss'

// Sticky top bar shared with the other problem pages: brand → home, back
// button and the dark/light toggle.
export default function TopBar({
  dark,
  onToggleDark,
}: {
  dark: boolean
  onToggleDark: () => void
}) {
  const navigate = useNavigate()

  return (
    <header className="p3-topbar">
      <button onClick={() => navigate('/')} className="p3-brand" title="Back to challenges">
        <span className="p3-brand-mark"><FiCode /></span>
        Code Challenge
      </button>
      <div className="p3-topbar-right">
        <button onClick={() => navigate('/')} className="p3-back">
          <FiArrowLeft /> Home
        </button>
        <button onClick={onToggleDark} className="p3-icon-btn" title="Toggle theme">
          {dark ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  )
}
