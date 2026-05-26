# BrightWork Landing Pages — Claude Code Context

Maintained by MKTNG.co | Questions: scott@mktng.co

## Read This First

All brand rules, component patterns, copy standards, per-page specs, and
the new-page checklist live in `artifacts/handbook.md`. Read it before
writing any code or copy. It is the authoritative source.

---

## Project

Plain HTML/CSS/vanilla JS landing pages for BrightWork Realty Advocates
programs. No framework. No build step. Each subdirectory is a self-contained
page deployed to its own Cloudflare Workers instance.

All eight program pages are built and deployed. GitHub Actions deploys on push to `main`.

MCC site (moragacountryclubrealestate.com) is a separate Astro repo. Not here.

---

## Repo Structure
```
brightwork-landing-pages/
├── CLAUDE.md
├── artifacts/
│   └── handbook.md          ← read this
├── shared/
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
└── seniors/                 → seniors.brightworkrealty.com    [EXISTS]
```

---

## Hosting: Cloudflare Workers

Each page deploys as its own Workers static site. One deployment per folder.

Deployment pattern:
- CI: GitHub Actions (`.github/workflows/deploy.yml`) deploys on push to `main`
- Each page has its own `wrangler.toml` with `[assets] directory = "."`
- Build command: (none) — plain HTML, no build step

**Deployment note:** The wrangler-action runs from the repo root using `command: deploy --config ${{ matrix.page }}/wrangler.toml`. Do not set `workingDirectory` to the page folder — it causes wrangler to install its dependencies inside the page folder, which then get picked up as static assets and exceed Cloudflare's 25MB limit. Each page directory has a `.assetsignore` file excluding `node_modules/`, `package.json`, `package-lock.json`, and `.wrangler/`.

DNS: `brightworkrealty.com` zone is in Cloudflare. MKTNG has access.
Add a CNAME for each new subdomain pointing to the Workers deployment URL.

Cloudflare account: scott@mktng.co
Account ID: `5f50d138eb76f9beb59f76d0f356543f`

---

## Form Backend: bw-fub-proxy

URL: `https://bw-fub-proxy.scott-5f5.workers.dev`

Payload must wrap data in a `person` object or the Worker returns 400.
FUB API key is an env variable inside the Worker. Never commit it here.

CORS: Worker accepts `*.brightworkrealty.com`. If a new page gets a 403,
check the allowed origins list in the Cloudflare dashboard for the Worker.

---

## PostHog

Shared init file: `shared/posthog-init.js`
Every page loads it: `<script src="../shared/posthog-init.js"></script>`

The init must include `cross_subdomain_cookie: true` so users across
subdomains are tracked as one person. Key: `phc_D4PErHHVrdiiphQqEZ8qmintbxdNLtzCShtmgmwWC79i`

On form submit, call `posthog.identify(email, {...})` before the FUB fetch.

---

## Follow Up Boss Widget Tracker

Shared loader: `shared/widget-tracker.js` (duplicate into each Workers folder like PostHog). Every page loads it in `<head>` immediately after PostHog: `<script src="widget-tracker.js"></script>`

---

## Common Session Tasks

Reference existing pages as patterns:
`@offmarket/index.html` or `@buybefore/index.html`

Check consistency across pages:
`grep -r "LEAD_TAG\|LEAD_SOURCE\|Suite" */index.html`

Fix Suite I (letter, not numeral 1):
`sed -i 's/Suite 1, Moraga/Suite I, Moraga/g' */index.html`
