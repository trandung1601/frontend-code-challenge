# Frontend Code Challenge  <!-- omit in toc -->

[![License: MIT][license-badge]][license-docs]
[![Lint and Test][lint-test-badge]][lint-test-workflow]

A frontend interview challenge workspace built with React, TypeScript, and
Vite. The application is organized by problem folder, where each problem is
self-contained with its own page, supporting logic, and related assets, while
shared app wiring and tooling live at the repository root.

-   Interactive problem pages can be developed and reviewed independently
-   A single `npm install` at the root sets up the entire frontend workspace
-   Root-level scripts cover local development, testing, linting, build, and deployment
-   `problem1` ships with an in-browser Monaco editor and test runner for live coding

## Table of Contents  <!-- omit in toc -->

- [Getting Started](#getting-started)
- [Problems](#problems)
- [Building and Testing](#building-and-testing)
- [Contribution Guidelines](#contribution-guidelines)
- [Feedback](#feedback)
- [About](#about)
  - [Maintainers](#maintainers)
  - [Contributors](#contributors)
  - [License](#license)

## Getting Started

```bash
npm install
npm run dev
```

Running `npm install` at the repository root installs all dependencies for the
frontend app. `npm run dev` then starts the local Vite development server so
you can open and work through the challenge in the browser.

```text
frontend-code-challenge/
├── package.json
├── package-lock.json
├── README.md
├── src/
│   ├── problem1/          # algorithm playground
│   ├── problem2/          # swap UI, grouped by feature folders
│   ├── problem3/          # review dashboard, grouped by tab folders
│   ├── App.tsx
│   ├── HomePage.tsx
│   └── main.tsx
└── dist/
```

## Problems

- `problem1`: Three ways to sum to `n`, with a Monaco editor, test runner, and custom test cases in [src/problem1](src/problem1)
- `problem2`: polished token swap UI demo with live prices, wallet/network session persistence, and colocated feature folders for swap and modal components in [src/problem2](src/problem2)
- `problem3`: code review and refactor presentation for a messy React component, with each dashboard tab isolated in its own folder in [src/problem3](src/problem3)

`problem1` is the most interactive deliverable: users can edit JavaScript
implementations directly in the browser and validate them immediately. `problem3`
is structured as a review artifact with findings, refactor notes, explanation
content, and presentational components.

## Building and Testing

All commands are run from the repository root:

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run ESLint across the codebase |
| `npm run lint:fix` | Run ESLint with automatic fixes |
| `npm run build` | Type-check and build the production bundle into `dist/` |
| `npm run preview` | Build the app, then preview it with Wrangler locally |
| `npm run deploy` | Build the app, then deploy it with Wrangler |

To run the app in a production-like local mode:

```bash
npm run build
npm run preview
```

> `preview` runs a fresh production build before starting the local preview. For
> iterative development, use `npm run dev` instead so changes reload immediately.

Unit tests are written with [Vitest](https://vitest.dev). Logic tests run in
the node environment; UI and hook tests (problem 2's modals, swap components,
hooks, and page gating) run in jsdom with
[Testing Library](https://testing-library.com), opting in per file via the
`// @vitest-environment jsdom` pragma.

## Contribution Guidelines

This repository is an interview challenge deliverable and is not open for
external contributions. Feel free to fork it for your own use.

## Feedback

You can leave your feedback in the [issues channel][issues].

## About

### Maintainers

- [Tran Tien Dung][profile]

### Contributors

- [Tran Tien Dung][profile]

### License

[![License: MIT][license-badge]][license-docs]

Distributed under the [MIT License](LICENSE).

[license-docs]: LICENSE
[license-badge]: https://img.shields.io/badge/License-MIT-informational
[lint-test-badge]: https://github.com/trandung1601/frontend-code-challenge/actions/workflows/lint.yml/badge.svg?branch=main
[lint-test-workflow]: https://github.com/trandung1601/frontend-code-challenge/actions/workflows/lint.yml
[profile]: https://github.com/trandung1601
[issues]: https://github.com/trandung1601/frontend-code-challenge/issues
