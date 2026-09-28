# Contributing

[Documentation home](README.md)

## Local setup

Use Node.js 24.21 or later in the Node 24 line and npm. Install with `npm ci`.
Use `npm install` when changing dependencies, and include the updated lockfile.
Start `npm run storybook` for interactive development at http://localhost:6006.
`npm run dev` watches library builds; it does not launch a web application.

## Structure

```text
.storybook/                  # Explorer configuration and shared MUI theme
docs/                        # Consumer documentation and checked examples
src/
  index.ts                   # Public library exports
  components/MaterialTable/
    index.tsx                # Root component and public component exports
    types.ts                 # Public and internal contracts
    context.tsx              # Shared table state and callbacks
    helpers.ts               # Formatting and CSV functions
    constants.ts, styles.ts
    components/, hooks/      # Private table implementation
    *.stories.tsx            # Storybook examples
    *.test.ts, *.test.tsx     # Behavior and helper tests
  test/setup.ts              # DOM matchers and cleanup
eslint.config.js
tsup.config.ts               # Explicit library build entries
vitest.config.ts
tsconfig.json
tsconfig.docs.json           # Public-import example validation
```

## Commands

| Command                   | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `npm run build`           | Clean and build `dist/`: ESM, CommonJS, declarations, maps.     |
| `npm run dev`             | Watch library sources and rebuild.                              |
| `npm run storybook`       | Local component explorer.                                       |
| `npm run build-storybook` | Static explorer in `storybook-static/`.                         |
| `npm run typecheck`       | Check source, stories, tests, and Storybook config.             |
| `npm run typecheck:docs`  | Check complete documentation examples.                          |
| `npm run lint`            | ESLint with zero allowed warnings.                              |
| `npm run lint:fix`        | Apply supported lint fixes.                                     |
| `npm run format`          | Format source, config, and documentation.                       |
| `npm run format:check`    | Verify formatting without edits.                                |
| `npm test`                | Run Vitest once.                                                |
| `npm run test:watch`      | Watch affected tests.                                           |
| `npm run test:coverage`   | Text, HTML, and LCOV reports under `coverage/`.                 |
| `npm pack`                | Run prepack type check/build and create an installable tarball. |

## Add a component

1. Create `src/components/<Name>/` with implementation and public types.
2. Export its public API from `src/index.ts`. Use `export type` for types and avoid name collisions.
3. Keep component-specific internals inside its folder.
4. Add representative `*.stories.tsx` states with typed args and callback spies.
5. Add behavior tests for interactions, edge cases, and callbacks. See [testing conventions](docs/testing.md).
6. Document props, defaults, examples, and limitations; link the guide from README.
7. If a dedicated package entry is needed, add it to `tsup.config.ts` and all import/require/types mappings in `package.json`.

React/MUI/Emotion stay external peers. Shared utilities should move to a shared
folder only when another component actually needs them. Do not export internals
just to make tests easier; test public behavior where possible.

## Before submitting changes

```sh
npm run lint
npm run format:check
npm run typecheck
npm run typecheck:docs
npm test
npm run build
npm run build-storybook
```

Update examples and stories when changing public behavior. Describe the changed
behavior and validation in the change description. Generated `dist/`, coverage,
and Storybook output are ignored; dependency changes belong in the lockfile.

## Packaging and release

GitHub workflows build on master/PR changes, tag new package versions, and publish
production/preview Storybook sites. Follow the [repository setup](docs/automation.md)
before expecting live deployments. Run `npm run test:workflows` to validate site assembly.

1. Run the checks above.
2. Choose the final package name, version, license, and repository metadata. None of this workflow publishes automatically.
3. Run `npm pack --dry-run` and inspect the included files. The allowlist contains `dist/`, `docs/`, and `CONTRIBUTING.md`; npm also includes README and package metadata.
4. Run `npm pack`, install the tarball in a consuming app, and verify root/component imports and peer resolution.
5. Publish only as a separate release action once package ownership and release details are decided.

Tests and stories are not build entries. Documentation example sources are
included under `docs/` for readers; they are not executable package exports.
`prepack` runs the main TypeScript check and build, not the full test/lint suite.
