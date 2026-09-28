# GitHub automation

[Documentation home](../README.md)

## Events and output

| Event                                         | Validation/build                                         | Tag                                         | Storybook                               |
| --------------------------------------------- | -------------------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| Push/merge to `master`                        | Lint, format, types, examples, tests, library, Storybook | Creates `v<package.json version>` if absent | Production at Pages root                |
| PR opened, updated, reopened against `master` | Same checks on PR merge revision                         | None                                        | Testing site at `/pr-<number>/`         |
| PR closed/merged                              | No new preview build                                     | Master push handles merge tags              | Removes the preview                     |
| Manual Build and test on master               | Same checks                                              | None                                        | Republishes production if still current |

Build artifacts include the library tarball, Storybook, and coverage. Tags point
at validated master commits; no npm publication or GitHub Release object is created.
Bump package.json and its lockfile in your PR to get a new version tag. Existing
tags are never moved. Direct master pushes follow the same path as merges.

## One-time GitHub setup

The local repository currently has no remote. After pushing it to GitHub:

1. Set **master** as the default branch. The deployment workflow must be present there before PR builds can trigger it.
2. Under **Settings → Pages**, select **GitHub Actions** as the source.
3. Enable Actions and allow these workflows' job permissions. Repository rules must permit the Actions token to create tags and update `gh-pages`.
4. Allow deployments from master in the **github-pages** environment. Required reviewers, if configured, delay automatic publication.
5. Merge these files to master. Run **Build and test** manually on master if production needs initialization or rebuilding.

No custom secrets are required. Workflows use GITHUB_TOKEN and Pages OIDC.
The `gh-pages` branch stores combined site state; do not select branch-based Pages
publishing, because the workflow publishes through `actions/deploy-pages`.

Typical project URLs:

```text
https://<owner>.github.io/<repository>/          production
https://<owner>.github.io/<repository>/pr-123/   PR testing site
```

The actual deployment URL is in the Actions job summary. No PR bot comments are
posted. Previews share the Pages origin and visibility with production; they are
separate paths, not isolated domains or private environments.

## Build and deployment separation

`ci.yml` builds PR code with read-only repository permissions and no persisted
checkout credentials. Fork PRs may require approval to run under repository policy.

`storybook-deploy.yml` checks successful build events against the current master
or open PR head, then downloads that run's static artifact. Its privileged job
always checks out master and never executes PR code or installs PR dependencies.
Hidden artifact paths and links are rejected. `pull_request_target` is used only
for closed-PR cleanup with trusted master checkout.

Production updates preserve previews. Preview updates replace only their own
directory; closing a PR removes it. The site is stored in `gh-pages`, and a shared
concurrency group prevents simultaneous writes.

GitHub keeps only one pending run per concurrency group. A burst of events may
replace a pending deployment; rerun a missed deployment/cleanup from Actions.
Outdated master/PR builds are skipped. Artifacts expire after 14 days, so rebuild
if the needed artifact has expired.

## Checks and troubleshooting

```sh
npm run test:workflows
npm run build-storybook
```

Local workflow tests cover site merging, preview isolation, cleanup, and path
rejection. They do not exercise GitHub's hosted permissions or live Pages APIs.

| Failure                   | Check                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| No deployment run         | Master must be default; Build and test must succeed.             |
| Pages denied              | Enable Actions source and allow master in environment rules.     |
| Tag/branch write denied   | Check rulesets and Actions permissions.                          |
| Version tag exists        | Expected for unchanged versions; bump the version for a new tag. |
| Old PR preview skipped    | The PR closed or its head changed; build its current revision.   |
| Deploy failed after build | Rerun Deploy Storybook while the artifact is retained.           |

References: [workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows),
[secure use](https://docs.github.com/en/actions/reference/security/secure-use),
[Pages deployment action](https://github.com/actions/deploy-pages).
