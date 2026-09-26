# Ledger dashboard hosting (GitHub Pages)

Serves criterion **T** (a stranger can check the public ledger in a browser without trusting us) and **U** (a single link, no install). Would a real user trust and use it? Only if the page they open is the same static code that is in the repository. That is why the site is built from an allow-list and scanned for secrets before it is deployed.

## Live URL

`https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/` — **PROPOSED**. It goes live only after the one-time settings below are made and `.github/workflows/ledger-pages.yml` has run successfully. The site root redirects to it.

## What gets published

The build job in `.github/workflows/ledger-pages.yml` builds the artifact from an allow-list:

- `dashboard/`: the ledger dashboard, its sample JSON and `verify-min.*`. Docs (`*.md`), tests, Node scripts (`*.mjs`) and `.gitkeep` are left out.
- `shared/*.js`, without `vitest.config.js`, `node_modules`, tests or scripts.
- `contracts/keys/*.json`.
- A root `index.html` that redirects to `dashboard/ledger/`.
- At the root: `security.html`, `security.js` and `security-score.json`, taken from the latest successful `security-score` run on `main`, when one can be downloaded (see "Shared Pages site" below).

The build fails in any of these cases:

- The site contains a file that is not `.html`, `.js`, `.css` or `.json`.
- Gitleaks 8.24.3 (the same checksum-pinned install and `.gitleaks.toml` that `checks.yml` uses) finds a secret.
- A grep for `private_key` or `BEGIN … PRIVATE KEY` matches.

The workflow runs on:

- a push to `main` or `claude/nifty-edison-mibetp` that touches `dashboard/**`, `shared/**`, `contracts/keys/**` or the workflow file itself;
- every completed `security-score` run on `main`;
- `workflow_dispatch`.

## One-time repository settings (repo admin)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Environments → `github-pages` → Deployment branches and tags:** add `claude/nifty-edison-mibetp`, or any other branch that is not `main` and should deploy. By default the environment only accepts the default branch, so a deploy from the feature branch is rejected until this is done.

## One server setting (Azure App Service)

In the ANCHOR server's App Service, open **Configuration → Application settings**. The app setting `VUKA_DASHBOARD_ORIGINS` must include `https://lethabomh14.github.io`. Without it, the browser blocks the two cross-origin GET routes (`/v1/anchor/latest` and `/v1/anchor/proof/{head}`). WebSockets are not subject to CORS, so `/ws/panel` needs no CORS change. That code lives on `feat/lethabo-guardian-delivery`, not in this checkout (`ASSUMPTION`: the setting name comes from that branch's `docs/DASHBOARD-INTEGRATION.md` and was not verified here).

## Hedera mirror node

The dashboard reads `https://testnet.mirrornode.hedera.com/api/v1/topics/{id}/messages[/{seq}]` directly from the browser. The public mirror node allows cross-origin reads, so no proxy is needed (`ASSUMPTION`: this is Hedera's documented public behaviour; this session's sandbox proxy blocked the check, so the CORS header was not verified here).

## Shared Pages site: known interaction

GitHub Pages serves **one** artifact per repository, and `security-score.yml` also deploys to Pages on push to `main`, publishing `security.html` alone. Whichever deploy runs last replaces the whole site. To stop that erasing the ledger, this workflow runs again after each `security-score` run on `main` and carries the security page along. Until someone reconciles the two workflows into one deploy, two side effects remain:

- For a few minutes after a push to `main`, the ledger may be missing.
- A deploy from `claude/nifty-edison-mibetp` publishes that branch's dashboard, not `main`'s.

## Pinning

The `checkout`, `upload-pages-artifact` and `deploy-pages` actions use the same commit SHAs as the repo's existing workflows. `actions/configure-pages` is not used anywhere else in the repo, so no SHA for it could be verified from the checkout. It is pinned to the major tag `@v5`, which a human should replace with a verified SHA.
