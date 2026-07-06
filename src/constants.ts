export const USER = {
  name: 'Dung Tran',
  role: 'Frontend Engineer',
  initials: 'DT',
  github: 'https://github.com/trandung1601',
  linkedin: 'https://www.linkedin.com/in/dungtrantien-dev/',
  email: 'mailto:trantiedung1601@gmail.com',
  repo: 'https://github.com/trandung1601/frontend-code-challenge',
} as const

export const PROBLEMS = [
  {
    n: '01',
    title: 'Three Ways to Sum to N',
    tag: 'Algorithms',
    tech: 'JavaScript',
    path: '/problem1',
    desc: 'Three distinct implementations that compute the sum from 1 to n — iterative, formulaic, and recursive — weighed for readability and runtime.',
  },
  {
    n: '02',
    title: 'Fancy Form',
    tag: 'UI / UX',
    tech: 'React',
    path: '/problem2',
    desc: 'A polished currency-swap form with live validation, token selection, and considered micro-interactions from empty to submitted state.',
  },
  {
    n: '03',
    title: 'Messy React',
    tag: 'Refactor',
    tech: 'React + TS',
    path: '/problem3',
    desc: 'A deliberately messy component untangled — anti-patterns named, wasteful re-renders removed, and the logic rewritten cleanly.',
  },
] as const
