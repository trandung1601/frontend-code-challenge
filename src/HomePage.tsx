import { Fragment, useEffect, useRef } from 'react'
import type { IconType } from 'react-icons'
import { useNavigate } from 'react-router-dom'
import { FiArrowDown, FiArrowUpRight, FiArrowRight, FiSun, FiMoon, FiGithub, FiLinkedin, FiMail, FiCode } from 'react-icons/fi'
import { SiJavascript, SiReact, SiTypescript } from 'react-icons/si'
import { USER, PROBLEMS } from './constants'
import './HomePage.scss'

// Brand logos for the tech tag on each problem row. The tech string is split
// on "+" and each token swapped for its logo (so "React + TS" → ⚛ + TS), keeping
// the "+" separator. Rendered in the recognisable brand colours.
const TECH_ICONS: { re: RegExp; Icon: IconType; color: string }[] = [
  { re: /javascript/i,          Icon: SiJavascript, color: '#f7df1e' },
  { re: /react/i,               Icon: SiReact,      color: '#61dafb' },
  { re: /\bts\b|typescript/i,   Icon: SiTypescript, color: '#3178c6' },
]

export default function HomePage({
  dark,
  onToggleDark,
}: {
  dark: boolean
  onToggleDark: () => void
}) {
  const navigate = useNavigate()
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            setTimeout(() => el.classList.add('visible'), Number(el.dataset.delay ?? 0))
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.15 }
    )
    rowRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      className="min-h-screen font-sans antialiased transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'Archivo,system-ui,sans-serif' }}
    >
      <div className="max-w-[1180px] mx-auto px-8">

        {/* Nav */}
        <nav className="nav-animate flex items-center justify-between py-[26px] border-b border-[var(--border)]">
          <span className="font-black text-[21px] tracking-tight" style={{ color: 'var(--fg)' }}>
            99<span className="text-[#b6f24a]">TECH</span>
          </span>

          <div className="flex items-center gap-4">
            {/* User info card */}
            <div className="user-card flex items-center gap-3">
              <span className="user-avatar">{USER.initials}</span>
              <div className="user-info hidden sm:flex flex-col">
                <span className="font-semibold text-[14px] leading-none mb-[4px]" style={{ color: 'var(--fg)' }}>
                  {USER.name}
                </span>
                <span className="font-mono text-[11px] tracking-[.1em] uppercase" style={{ color: 'var(--muted)' }}>
                  {USER.role}
                </span>
              </div>
              <div className="flex items-center gap-[6px]">
                <a href={USER.github} target="_blank" rel="noreferrer" className="user-link" title="GitHub">
                  <FiGithub />
                </a>
                <a href={USER.linkedin} target="_blank" rel="noreferrer" className="user-link" title="LinkedIn">
                  <FiLinkedin />
                </a>
                <a href={USER.email} className="user-link" title="Email">
                  <FiMail />
                </a>
              </div>
            </div>

            <span className="divider hidden sm:block" />

            <button
              onClick={onToggleDark}
              className="btn-theme flex items-center gap-2 font-mono text-[13px] cursor-pointer px-4 py-2 rounded-full border transition-colors duration-200"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}
            >
              {dark ? <FiMoon className="text-[15px]" /> : <FiSun className="text-[15px]" />}
              {dark ? 'Dark' : 'Light'}
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-24 pb-[72px]">
          <div className="hero-label font-mono text-[14px] tracking-[.16em] uppercase text-[#b6f24a] mb-[26px]">
            // Code Challenge 2026
          </div>
          <h1 className="hero-h1 m-0 text-[96px] leading-[.92] font-black tracking-[-0.035em] uppercase" style={{ color: 'var(--fg)' }}>
            Three problems.<br />
            <span className="text-[#b6f24a]">One proof</span> of work.
          </h1>
          <p className="hero-p mt-8 max-w-[58ch] text-[19px] leading-[1.55]" style={{ color: 'var(--muted)' }}>
            Three focused engineering tasks — an algorithm, a form, and a refactor — solved and documented as a single frontend submission for 99Tech.
          </p>
          <div className="hero-ctas flex flex-wrap gap-[14px] mt-9">
            <a
              href="#solutions"
              className="btn-primary flex items-center gap-[10px] font-semibold text-[15px] no-underline px-6 py-[14px] rounded-full bg-[#b6f24a] text-[#0a0b0d] transition-all duration-200"
            >
              <FiCode className="text-[17px]" /> View the solutions <FiArrowDown />
            </a>
            <a
              href={USER.repo}
              className="btn-secondary flex items-center gap-[10px] font-mono text-[14px] no-underline px-6 py-[14px] rounded-full border transition-colors duration-200"
              style={{ border: '1px solid var(--border)', color: 'var(--fg)' }}
            >
              <FiGithub className="text-[16px]" /> View repository <FiArrowUpRight />
            </a>
          </div>
        </section>

        {/* Solutions list */}
        <section id="solutions" className="border-t border-[var(--border)]">
          {PROBLEMS.map((p, i) => (
            <a
              key={p.n}
              href={p.path}
              onClick={(e) => { e.preventDefault(); navigate(p.path) }}
              className="problem-row grid gap-8 items-center py-[38px] px-2 border-b border-[var(--border)] no-underline"
              style={{ gridTemplateColumns: '150px 1fr auto', color: 'var(--fg)', cursor: 'pointer' }}
              ref={el => { rowRefs.current[i] = el }}
              data-delay={i * 120}
            >
              <div>
                <span className="problem-num block font-mono text-[78px] font-semibold leading-none text-[#b6f24a]">
                  {p.n}
                </span>
              </div>
              <div>
                <div className="font-mono text-[12px] tracking-[.14em] uppercase mb-[11px]" style={{ color: 'var(--muted)' }}>
                  {p.tag}
                </div>
                <h2 className="m-0 mb-3 text-[38px] font-bold tracking-[-0.015em] uppercase" style={{ color: 'var(--fg)' }}>
                  {p.title}
                </h2>
                <p className="m-0 max-w-[60ch] text-[16px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
                  {p.desc}
                </p>
              </div>
              <div className="flex flex-col items-end gap-[18px]">
                <span
                  className="inline-flex items-center gap-[8px] font-mono text-[12px] rounded-full px-[14px] py-[7px] whitespace-nowrap"
                  style={{ border: '1px solid var(--border)', color: 'var(--fg)' }}
                  title={p.tech}
                >
                  {p.tech.split('+').map((part, idx) => {
                    const key = part.trim()
                    const found = TECH_ICONS.find(({ re }) => re.test(key))
                    const Icon = found?.Icon
                    return (
                      <Fragment key={idx}>
                        {idx > 0 && <span style={{ color: 'var(--muted)' }}>+</span>}
                        {Icon
                          ? <Icon className="text-[16px]" style={{ color: found!.color }} aria-label={key} />
                          : <span>{key}</span>}
                      </Fragment>
                    )
                  })}
                </span>
                <FiArrowRight className="text-[34px] text-[#b6f24a]" />
              </div>
            </a>
          ))}
        </section>

        {/* Footer */}
        <footer className="footer-animate flex items-center justify-between flex-wrap gap-3 py-9 pb-14 font-mono text-[13px]" style={{ color: 'var(--muted)' }}>
          <span>Submitted by <b style={{ color: 'var(--fg)' }}>{USER.name}</b> · {USER.role}</span>
          <span>99Tech Code Challenge · 2026</span>
        </footer>

      </div>
    </div>
  )
}
