# Frontend Code Challenge

An interactive coding challenge application built with React, TypeScript, and Vite. Users solve problems directly in the browser with a Monaco code editor and instant test feedback.

## Tech Stack

- **React 19** + **TypeScript 5.8**
- **Vite 6** (build tool)
- **Tailwind CSS 4** (styling)
- **React Router v7** (routing)
- **Monaco Editor** (in-browser code editor)
- **Vitest** (testing)
- **ESLint** (linting)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run test` | Run tests (single run) |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── problem1/          # Problem 1: Three ways to sum to n
│   ├── Problem1Page.tsx
│   ├── solution.js
│   ├── runner.ts
│   └── runner.test.ts
├── problem2/          # Problem 2: Fancy Form (Swap Token Demo)
│   └── Problem2Page.tsx
├── problem3/          # Problem 3: Messy React (Code Review)
│   ├── Problem3Page.tsx   # shell: theme, top bar, hero, tab nav
│   ├── components/
│   │   ├── layout/        # TopBar, Hero (page chrome)
│   │   └── tabs/          # Overview / Issues / Refactored / Explanation
│   ├── reviewContent.ts   # findings, code snippets, flow & explanation content
│   └── highlight.tsx      # tiny TS syntax highlighter
├── App.tsx            # Root component with routing
├── HomePage.tsx       # Landing page
└── main.tsx           # Entry point
```

## Problems

### Problem 1 — Three Ways to Sum to N

Implement 3 unique functions that compute the summation from 1 to `n`. Includes a live code editor with test runner and custom test case support.

### Problem 2 — Fancy Form (Swap Token)

A polished currency-swap form UI demo with token selection. **Note:** This page is for demo purposes only — no real data or transactions are involved.
