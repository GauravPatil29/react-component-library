# AI agent context

## Project

`react-library` is a TypeScript React component library built with Material UI.
`MaterialTable` is the first public component. The package is currently named
`react-library` and is not assumed to be published yet.

## Source layout

- `src/index.ts`: root public exports.
- `src/components/MaterialTable/index.tsx`: component entry and public exports.
- `src/components/MaterialTable/types.ts`: public contracts and enums.
- `src/components/MaterialTable/context.tsx`: table state and interaction callbacks.
- `src/components/MaterialTable/helpers.ts`: formatting, sorting, scroll styles, and CSV helpers.
- `src/components/MaterialTable/components/`: internal table pieces.
- `src/components/MaterialTable/hooks/`: internal hooks.
- `src/components/MaterialTable/*.stories.tsx`: Storybook examples.
- `src/components/MaterialTable/*.test.*`: component/helper tests.
- `docs/`: consumer documentation and checked TypeScript examples.
- `.storybook/`: Storybook configuration and the shared MUI theme.
- `.github/workflows/`: CI, tagging, Pages deployment, and PR preview automation.
- `.github/PULL_REQUEST_TEMPLATE.md` and `.github/ISSUE_TEMPLATE/`: contribution forms.

Keep implementation details private unless they are intentionally part of the
component API. Add a new component under `src/components/<Name>/`, export its
public API from `src/index.ts`, and add a dedicated `tsup`/package export only when
the component needs a subpath import.

## Public behavior to preserve

- `MaterialTable` requires `tableKey`, `isLoading`, `columns`, `data`, `defaultSort`, and `paginationType`.
- `dimension` is optional and renders before metric columns. Client search filters only `dimension.apiKey`.
- `paginationType='client'` filters, sorts, and slices the complete row set locally.
- `paginationType='server'` renders supplied rows and reports user changes through `onChange`; the parent fetches data.
- `page` and `defaultSort` initialize state on mount. Ref methods update search/sort/page size without calling `onChange`.
- Default page size is 10; available sizes are 10, 25, 50, and 100.
- `dataFormatter` returns primitive `DataType` values and is used for cell/CSV output; JSX renderers are not supported.
- `onExportData` receives rows but does not perform a download automatically. Use `CSV_HELPER_FUNCTIONS` when appropriate.
- Summaries are parent-supplied and show only when `showSummaryRow` is true and at least one value is nonempty/nonzero.

Check `docs/material-table.md` before changing behavior; document intentional API
changes there and update the examples and Storybook stories.

## Development commands

Run these from the repository root after dependency installation:

```sh
npm run lint
npm run format:check
npm run typecheck
npm run typecheck:docs
npm test
npm run test:workflows
npm run build
npm run build-storybook
```

Use `npm run format` for formatting, `npm run test:watch` during development, and
`npm run test:coverage` to inspect coverage. `npm pack` runs the prepack type check
and library build and creates an installable tarball.

## Testing conventions

Tests use Vitest, jsdom, React Testing Library, user-event, and jest-dom. Prefer
observable behavior, accessible roles/names, callback assertions, and small
deterministic fixtures. Add a regression test for every bug fix. jsdom does not
verify real layout, scrolling, or visual output; use Storybook for manual visual
review. Do not add snapshots or tests that only mirror implementation details.

## Style and types

- Use TypeScript with strict checking and React JSX.
- Use `export type` for type-only public exports; preserve runtime enum exports.
- Keep React, React DOM, MUI, and Emotion external peer dependencies.
- Use Prettier settings from `.prettierrc.json` and ESLint flat config from `eslint.config.js`.
- Husky's `.husky/pre-commit` runs lint, format checking, tests, and the library build; keep it aligned with the required local checks.
- Do not edit `dist/`, `coverage/`, or `storybook-static/`; they are generated and ignored.
- Use `apply_patch` for focused source/config edits and run formatting afterward.

## GitHub automation

- `ci.yml` validates master pushes and pull requests and uploads Storybook/library artifacts.
- A successful master build creates `v<package.json version>` only when that tag does not exist.
- `storybook-deploy.yml` publishes production at the Pages root and PR previews at `/pr-<number>/`.
- Successful previews update one idempotent PR comment with the preview URL.
- A closed or merged PR removes its preview directory; the merged master build publishes production.
- The deployment workflow must first be merged into the default `master` branch because GitHub registers `workflow_run` from the default branch.
- Do not execute untrusted PR code in a privileged deployment job. The deployment job checks out trusted `master` and consumes the unprivileged build artifact.
- GitHub Pages must use **Settings → Pages → Source → GitHub Actions**.

## Before handing off changes

Run the relevant checks above, summarize what changed and what passed, and call out
any external setup still required. Do not publish packages, merge branches, push
tags, or change GitHub settings unless the user explicitly requests that external
action and the necessary access is available.
