# BrightWork landing pages verification map

This directory is the maintained source for verifying user-facing behavior across BrightWork program landing pages. Read this index before driving, then open the matching feature file for the recipe.

## Baseline preconditions

- Work from the repo root (`brightwork-landing-pages/`).
- Install harness deps: `cd .cursor/skills/verify-brightwork-landing-pages/harness && npm install && npx playwright install chromium`
- Set `BW_VERIFY_RUN_ID` to a unique value per run (for example `proof-$(date +%s)`).
- Launch one program folder with `control-brightwork.mjs launch --page <folder> --port 4173`.
- Run `control-brightwork.mjs doctor` and require `"ok": true` before driving.
- Never drive a server you did not start in this run.
- Never submit real leads to `bw-fub-proxy` or live `*.brightworkrealty.com` domains.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Prefer ARIA roles and stable IDs (`#leadForm`, `#successState`) over CSS position.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `control-brightwork.mjs browser` or `drive --feature`.
- Run HTTP checks through `control-brightwork.mjs fetch --path <path>`.
- Form submits use harness dry-run intercept only.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes a screenshot and an ARIA snapshot with the success message visible.
- HTTP proof includes status code and a content preview for agent files.
- Record the feature ID and program folder with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-brightwork` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Off-Market lead form](./offmarket-lead-form.md) covers hero CTA scroll, form fill, dry-run submit, and success state on `offmarket`.
- [Shared page shell](./shared-page-shell.md) covers nav logo, phone link, and smart-way strip on a launched program page.
- [Agent discoverability files](./agent-discoverability.md) covers `llms.txt`, `agents.json`, and `robots.txt` on a served program folder.
- [Program catalog load](./program-catalog.md) covers all eight program `index.html` pages loading with a lead form present.
