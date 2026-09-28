---
name: verify-brightwork-landing-pages
description: "Drive BrightWork Realty Advocates program landing pages (plain HTML on Cloudflare Workers) the way a user does. Use after landing page, form, agent discoverability, or shared component changes; before claiming a page works locally or in CI."
---

# Verify BrightWork landing pages

BrightWork ships eight self-contained program folders (`offmarket`, `buybefore`, `seniors`, `quiet`, `relaunch`, `brightflip`, `finaloffer`, `invest`) plus `seniors/workshop/`. Each folder is plain HTML, CSS, and vanilla JS served as a static bundle. Forms POST to `bw-fub-proxy` in production. PostHog opts out on `localhost`. Agent discoverability files (`llms.txt`, `agents.json`, `robots.txt`) are generated per folder from `shared/agent-source-data.mjs`.

**Surface:** browser UI (static landing pages with lead forms, nav, hero CTAs, FAQ, smart-way strip).

**Harness:** `control-brightwork.mjs` (Playwright + local `npx serve`).

**Feature map:** `.cursor/skills/verify-brightwork-landing-pages/features/`

## Launch

From the repo root, install harness deps once:

```bash
cd .cursor/skills/verify-brightwork-landing-pages/harness && npm install
```

Start a disposable local server for one program folder (default port `4173`):

```bash
export BW_VERIFY_RUN_ID="proof-$(date +%s)"
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs launch --page offmarket --port 4173
```

Ready when the command prints JSON with `"ok": true` and `baseUrl` like `http://localhost:4173`. The server PID and port are stored under `/tmp/bw-verify-$BW_VERIFY_RUN_ID/`.

**Important:** Use `localhost`, not `127.0.0.1`. Program pages redirect HTTP on `127.0.0.1` to HTTPS, which breaks local serve.

Prefer `npx serve <folder>` over opening `index.html` directly. Relative asset paths and agent files resolve correctly only over HTTP.

**Teardown:** see Cleanup. Do not kill processes by name.

## Doctor

Run after launch and before every drive. Read-only.

```bash
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs doctor
```

Expect JSON with `"ok": true`, the launched `page`, `baseUrl`, and checks:

- `process`: PID from this run is alive
- `index`: `/` returns HTML containing `id="leadForm"`

Exit code `1` means do not drive. Fix launch or pick a different port, then relaunch.

## Drive

Use the feature map recipes. Low-level browser steps go through:

```bash
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs browser goto --url /
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs browser click --role link --name "Get Private Access"
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs browser fill --id firstName --value "Verify"
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs browser screenshot --path /tmp/shot.png
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs browser snapshot --path /tmp/body.aria.txt
```

High-level feature drives:

```bash
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs drive --feature offmarket-lead-form --evidence-dir .cursor/skills/verify-brightwork-landing-pages/evidence/proof-<run-id>
```

Mapped features: `offmarket-lead-form`, `shared-page-shell`, `agent-discoverability`, `program-catalog`.

**Stable handles:** `#leadForm`, `#firstName`, `#lastName`, `#email`, `#phone`, `#consent`, `#submitBtn`, `#successState`, `.hero-cta`, nav phone link `(925) 200-6000`, `.smart-way-strip`.

**Boundaries (do not cross in verification):**

- `bw-fub-proxy` (`https://bw-fub-proxy.scott-5f5.workers.dev`): the harness intercepts fetch and returns a dry-run success. Never drive form submit against production live domains.
- PostHog: captures are disabled on `localhost` by design. Do not treat missing events as failure.
- Follow Up Boss widget tracker, Calendly, Google Fonts, and external `brightworkrealty.com` links: out of scope unless a feature explicitly covers them.
- `seniors/workshop/` is a separate route inside the `seniors` folder; use `launch --page seniors/workshop` for workshop-specific checks.

## Evidence

Proof artifacts live under `.cursor/skills/verify-brightwork-landing-pages/evidence/` (committed for baseline proofs, or named per run).

Each proof should include:

1. The user action (hero CTA click, form fill, submit)
2. The resulting UI state (success heading visible, form hidden)
3. Side-effect confirmation (dry-run intercept fired, not a real FUB person)
4. Screenshot plus ARIA snapshot where the feature is visual

`drive --feature` writes `*-log.json`, `*.png`, and `*.aria.txt` into the evidence directory.

Standards:

- Exercise the real user path, not internal setters
- Capture action and resulting state, not only the final screen
- Mocks only at production boundaries (FUB proxy intercept is allowed)
- Verify dry-run actually skipped the network: log shows `dryRun: true` response shape

## Cleanup

Stop the server started by this run and remove `/tmp` state. Evidence survives.

```bash
node .cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs cleanup
```

Confirm evidence still exists:

```bash
ls .cursor/skills/verify-brightwork-landing-pages/evidence/proof-<run-id>/
```

Cleanup must not delete the evidence directory. Run cleanup after failed iterations too so ports and PIDs do not leak.

## Helpers

| Script | Purpose |
|--------|---------|
| `.cursor/skills/verify-brightwork-landing-pages/harness/control-brightwork.mjs` | Launch, doctor, drive, browser, fetch, cleanup |
| `.cursor/skills/verify-brightwork-landing-pages/harness/package.json` | Playwright dependency pin |
| `.cursor/skills/verify-brightwork-landing-pages/features/` | Feature map (user paths and recipes) |

Install Playwright browsers once after `npm install`:

```bash
cd .cursor/skills/verify-brightwork-landing-pages/harness && npx playwright install chromium
```

## Maintenance

Run `/maintain-verification-skill` when program pages, forms, or agent discoverability change. That pass re-reads source per feature, drives every mapped feature live, and ships at most one PR of proven corrections.
