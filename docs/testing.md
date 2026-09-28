# Testing

[Documentation home](../README.md) · [Contributor guide](../CONTRIBUTING.md)

## Run tests

```sh
npm test
npm run test:watch
npm run test:coverage
npm test -- src/components/MaterialTable/helpers.test.ts
```

Tests use Vitest with jsdom, React Testing Library, user-event, and jest-dom
matchers. Configuration is in `vitest.config.ts`; `src/test/setup.ts` adds matchers
and cleans up rendered components after every test. Mocks are restored between tests.

## Conventions

- Put `*.test.ts` or `*.test.tsx` beside the code being tested.
- Import `describe`, `it`, `expect`, and `vi` explicitly from Vitest.
- Prefer roles, accessible names, and visible text when locating controls. Use test IDs when the UI has no suitable semantic target.
- Use `userEvent.setup()` and await interactions. Wait for observable asynchronous updates instead of relying on arbitrary delays where possible.
- Assert callbacks and rendered results. Avoid large markup snapshots or tests that only repeat implementation details.
- Keep fixtures small and deterministic. Test locale-dependent numbers against the intended runtime locale behavior.
- When fixing a bug, add a regression test that fails without the fix.

The current suite covers sorting, client/server pagination, search, page-size
changes, loading/empty states, summaries, drill-down, imperative search, and CSV
formatting/escaping. It does not exhaustively test browser downloads, error
boundaries, keyboard accessibility, or every breadcrumb interaction.

## Coverage and limits

Coverage includes library TypeScript/TSX and excludes tests, stories, test setup,
and `types.ts`. The V8 provider generates text, `coverage/index.html`, and
`coverage/lcov.info`. No minimum threshold is enforced. Use the report to find
untested behavior rather than treating a percentage as proof of correctness.

jsdom does not validate real layout, scrolling, or visual appearance. Storybook
currently supplies manual examples; stories are not automatically run as browser
tests. Type checking remains separate from Vitest: run `npm run typecheck` and
`npm run typecheck:docs` too.

## Tool choices, best fit first

| Setup                                            | Benefits                                                         | Tradeoffs                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Vitest + React Testing Library + jsdom (current) | Fits Vite; helper and interaction tests; no browser installation | Simulated DOM cannot verify layout or visual rendering                |
| Vitest + Storybook browser tests                 | Reuses stories and exercises a browser; results in Storybook     | Browser binaries and more CI configuration; helper tests still needed |
| Jest + React Testing Library                     | Established ecosystem; useful for teams already using Jest       | Additional configuration for this ESM/TypeScript project              |

These choices are alternatives for the test runner, not a requirement to install
all of them. Browser tests would complement the existing helper and component suite.
