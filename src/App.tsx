import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.scss'
import HomePage from './HomePage'
import Problem1Page from './problem1/Problem1Page'
import Problem2Page from './problem2/Problem2Page'
import Problem3Page from './problem3/Problem3Page'

export default function App() {
  const [dark, setDark] = useState(true)
  const toggleDark = () => setDark((d) => !d)

  return (
    <Routes>
      <Route path="/" element={<HomePage dark={dark} onToggleDark={toggleDark} />} />
      <Route path="/problem1" element={<Problem1Page dark={dark} onToggleDark={toggleDark} />} />
      <Route
        path="/problem2"
        element={<Problem2Page dark={dark} onToggleDark={toggleDark} />}
      />
      <Route
        path="/problem3"
        element={<Problem3Page dark={dark} onToggleDark={toggleDark} />}
      />
      {/* Unknown paths fall back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
