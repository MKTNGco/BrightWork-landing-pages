# BrightWork Landing Pages — Agent Instructions

Maintained by MKTNG.co | Questions: scott@mktng.co

## Read This First

All brand rules, component patterns, copy standards, per-page specs, and the new-page checklist live in `artifacts/handbook.md`. Read it before writing any code or copy. It is the authoritative source.

Agent discoverability (`robots.txt`, `llms.txt`, `agents.json`, WebMCP, bw-agent-root Worker) is documented in `artifacts/agent-discoverability.md`. Read it before editing `shared/agent-source-data.mjs`, generated agent files, or the root Worker.

---

## Project

Plain HTML/CSS/vanilla JS landing pages for BrightWork Realty Advocates programs. No framework. No build step. Each subdirectory is a self-contained page deployed to its own Cloudflare Workers instance.

All eight program pages are built and deployed. GitHub Actions deploys on push to `main`.

MCC site (moragacountryclubrealestate.com) is a separate Astro repo. Not in this repository.

---

## Repo Structure

```
brightwork-landing-pages/
├── AGENTS.md
├── CLAUDE.md                  ← Claude Code bridge to AGENTS.md
├── artifacts/
│   ├── handbook.md              ← read this (brand, pages, copy)
│   └── agent-discoverability.md ← read this (agent layer, WebMCP, root Worker)
├── shared/
│   ├── agent-source-data.mjs
│   ├── agent-response-builders.mjs
│   ├── posthog-init.js
│   ├── widget-tracker.js
│   ├── animations.js
│   ├── brand.css
│   └── BrightWork_logo.png
├── offmarket/               → offmarket.brightworkrealty.com  [EXISTS]
├── buybefore/               → buybefore.brightworkrealty.com  [EXISTS]
├── quiet/                   → quiet.brightworkrealty.com      [EXISTS]
├── relaunch/                → relaunch.brightworkrealty.com   [EXISTS]
├── brightflip/              → brightflip.brightworkrealty.com [EXISTS]
├── finaloffer/              → finaloffer.brightworkrealty.com [EXISTS]
├── invest/                  → invest.brightworkrealty.com     [EXISTS]
├── seniors/                 → seniors.brightworkrealty.com    [EXISTS]
├── bw-agent-root/           → apex robots.txt / llms.txt / agents.json via Luxury Presence redirects (not a Worker Route)
└── mcp-diagnostic/          → bw-mcp-diagnostic Worker only. Do not bind to mcp.brightworkrealty.com (live COS MCP tunnel).
```

---

## Hosting: Cloudflare Workers

Each page deploys as its own Workers static site. One deployment per folder.

Deployment pattern:

- CI: GitHub Actions (`.github/workflows/deploy.yml`) deploys on push to `main`
- Each page has its own `wrangler.toml` with `[assets] directory = "."`
- Build command: none (plain HTML, no build step)

**Deployment note:** The wrangler-action runs from the repo root using `command: deploy --config ${{ matrix.page }}/wrangler.toml`. Do not set `workingDirectory` to the page folder. That causes wrangler to install dependencies inside the page folder, which then get picked up as static assets and exceed Cloudflare's 25MB limit. Each page directory has a `.assetsignore` file excluding `node_modules/`, `package.json`, `package-lock.json`, and `.wrangler/`.

DNS: `brightworkrealty.com` zone is in Cloudflare. MKTNG owns the full zone. Add a CNAME for each new subdomain pointing to the Workers deployment URL.

**Before binding any new hostname on this zone, export the live DNS records first.** A 404 does not mean the name is free. `mcp.brightworkrealty.com` is a live COS MCP tunnel (separate project). Do not rebind it. Removing a `[[routes]]` block and redeploying does not guarantee Cloudflare dropped the binding; verify against the zone route list.

Cloudflare account: scott@mktng.co  
Account ID: `5f50d138eb76f9beb59f76d0f356543f`

---

## Form Backend: bw-fub-proxy

URL: `https://bw-fub-proxy.scott-5f5.workers.dev`

Payload must wrap data in a `person` object or the Worker returns 400. FUB API key is an env variable inside the Worker. Never commit it here.

CORS: Worker accepts `*.brightworkrealty.com`. If a new page gets a 403, check the allowed origins list in the Cloudflare dashboard for the Worker.

---

## PostHog

PostHog is loaded via an inline `<script>` block directly in each page's `<head>`. Do NOT use an external script tag referencing `../shared/posthog-init.js`. Cloudflare Workers deploys each page as an isolated static bundle and cannot resolve sibling directory paths at runtime.

**Working pattern (deployed):**

1. **Stub loader:** current PostHog snippet (`__SV=1.7`) that loads `array.js` (not the deprecated `ph.js` stub). The loader sets `crossOrigin="anonymous"` and guards against double-init with `window.posthog.__loaded`.
2. **`posthog.init()` config:**
   - Project key: `phc_D4PErHHVrdiiphQqEZ8qmintbxdNLtzCShtmgmwWC79i`
   - `api_host: 'https://us.i.posthog.com'` (event ingestion)
   - `ui_host: 'https://us.posthog.com'` (PostHog UI links)
   - `asset_host: 'https://us-assets.i.posthog.com'` (SDK asset delivery)
   - `defaults: '2026-01-30'`
   - `cross_subdomain_cookie: true` (required for cross-subdomain session stitching on `*.brightworkrealty.com`)
   - `person_profiles: 'identified_only'`
   - `loaded` callback opts out capturing on `localhost`

The canonical snippet source is `shared/posthog-init.js`. When updating the stub loader or any config option, update that file AND re-inline the full block across all 9 HTML files (including `seniors/workshop/index.html`). Do not reference it via script src.

On form submit, call `posthog.identify(email, {...})` before the FUB fetch.

---

## Follow Up Boss Widget Tracker

Shared loader: `shared/widget-tracker.js` (duplicate into each Workers folder like PostHog). Every page loads it in `<head>` immediately after PostHog: `<script src="widget-tracker.js"></script>`

---

## Agent discoverability (program landing pages)

Full reference: **`artifacts/agent-discoverability.md`**.

Office and program facts for WebMCP tools, `agents.json`, and `llms.txt` live in **`shared/agent-source-data.mjs`**. After editing copy there, regenerate static agent files and the browser bundle:

```bash
node scripts/generate-agent-discoverability.mjs
```

That script writes `robots.txt`, `llms.txt`, `agents.json`, and `webmcp-data.js` into each of the eight Worker folders (not `seniors/workshop/`). It also updates `shared/webmcp-data.js`. Program pages load `webmcp-data.js` before `webmcp-core.js`. Do not hand-edit generated files.

**Do not drift these field names:**

- `CREDENTIALS` is `bio`, `specialtyAreas`, `personalTrackRecord`, `reviewsUrl`, `firmTrackRecord`, `differentiator`. The old `trackRecord` / `localAuthority` / `background` shape is gone.
- Program objects use `howItWorks` only. Do not reintroduce `howAccessWorks` or `approach`.
- `AGENT_PROTOCOL_VERSION` is one shared constant (currently `1.1`). Do not hardcode a version per surface.
- `specialtyAreas` is root-only. Do not duplicate it onto program pages.

**Root domain:** apex `robots.txt` / `llms.txt` / `agents.json` are Luxury Presence redirects to `bw-agent-root.scott-5f5.workers.dev` (full path required). Apex/`www` CNAME to Luxury Presence, so Worker Routes on those hostnames never see the traffic. Keep the redirect approach. Do not flip proxy status to try an on-origin 200.

Commit and push as the final step of any agent-layer change.

---

## Common Session Tasks

Reference existing pages as patterns: `offmarket/index.html` or `buybefore/index.html`

Check consistency across pages:

```bash
grep -r "LEAD_TAG\|LEAD_SOURCE\|Suite" */index.html
```

Fix Suite I (letter, not numeral 1):

```bash
sed -i 's/Suite 1, Moraga/Suite I, Moraga/g' */index.html
```

---

## Perf journeys

Scott/Ziggy named these (2026-09-24). Agents **must not invent** journey names or scope without sign-off. One named journey per perf-focused Cloud Agent run. Habit: mktng-brain `shop/perf-loop.md`.

| Name | Start | End | Why it matters | Suggested lab proxy | Mobile-heavy? |
|------|-------|-----|----------------|---------------------|---------------|
| `hero-first-view` | Cold load of `https://<program>.brightworkrealty.com/` from an ad, QR, or SMS link | Hero headline, subhead, and primary CTA are visible and tappable, with no layout jump | Most traffic lands cold on a phone; a blank or shifting hero loses them before they read. | Lighthouse CLI, mobile preset, median of 3 runs per program URL. Track LCP, CLS, TBT, transfer bytes; shared JS (PostHog, widget tracker, animations) must be `defer`/`async`, not render-blocking. | Y |
| `cta-to-form-ready` | Page loaded; user taps hero CTA (anchor) or scrolls to the form | Form fields rendered, focusable, and accept the first keystroke with no shift | Handoff from interest to intent; scroll stutter or first-field lag stalls the lead. | Playwright mobile + CPU throttle: CTA click → ms until first `input` focusable; CLS during scroll; INP-style latency on first field tap. | Y |
| `form-submit-confirm` | Tap Submit with valid test data | Success state after bw-fub-proxy returns 2xx | Slowest felt moment; hangs and double-submits cost real leads. | **Blocked until** bw-fub-proxy has a dry-run/test path (no real FUB leads / PostHog pollution). Then: Playwright submit → success DOM, p50/p95 over 10 runs; record Worker response time separately. | Y |
| `relaunch-case-study-nav` | Tap Case Study in relaunch nav, or open `/case-study/` | Case study hero / before-after media readable, no layout thrash | Proof path is unique to relaunch and image-heavy. | Lighthouse mobile on `https://relaunch.brightworkrealty.com/case-study/` + scripted nav tap → LCP. | Y |

Shared JS weight is a budget check under `hero-first-view`, not its own journey.

When claiming a perf win, fill the proof-card **Speed** rows (Journey, Metric, Before, After, Lab proxy, Ratchet locked?, Taste gate).

---

## Cursor Cloud specific instructions

- **Stack:** No framework and no build step. Each program folder is plain HTML/CSS/vanilla JS deployed as its own Cloudflare Workers static bundle.
- **Smoke-check:** Open the page folder in a browser (file URL) or serve it with a simple static server. There is no root `package.json`; do not add one for landings work.
- **Agent layer:** After editing `shared/agent-source-data.mjs`, run `node scripts/generate-agent-discoverability.mjs` and commit the generated outputs (`robots.txt`, `llms.txt`, `agents.json`, `webmcp-data.js` per page folder, plus `shared/webmcp-data.js`).
- **Deploy:** Production deploy is CI on `main` only (`.github/workflows/deploy.yml`). Cloud Agents open PRs; do not push directly to `main`.
- **Wrangler:** Deploy from the repo root with `--config <page>/wrangler.toml`. Never set `workingDirectory` to the page folder (25MB asset trap). Each page folder has `.assetsignore` for `node_modules/`, `package.json`, `package-lock.json`, and `.wrangler/`.
- **DNS / hostnames:** Never rebind `mcp.brightworkrealty.com`. Export live DNS from the zone before binding any new hostname on `brightworkrealty.com`; verify route list after removing bindings.
- **Perf:** Use only named journeys under **Perf journeys**. Do not invent journeys. Do not run `form-submit-confirm` against live FUB until dry-run exists.
- **PRs:** Include a filled proof card on every PR (task, branch, agent, commands run, artifacts, not run / blocked). Speed rows required when claiming a perf improvement.
