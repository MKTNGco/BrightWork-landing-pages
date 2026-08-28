# BrightWork Realty Advocates — Landing Pages

Marketing and lead capture pages for [BrightWork Realty Advocates](https://brightworkrealty.com).  
Maintained by [MKTNG.co](https://mktng.co) on behalf of Ben Olsen.  
Questions: scott@mktng.co

---

## What This Is

Each subdirectory is a standalone landing page for one of Ben's programs.  
Plain HTML, CSS, and vanilla JS. No framework. No build step.

All eight program pages are built and deployed to Cloudflare Workers. CI deploys on push to `main`.

Each program page also exposes an AI-agent discovery layer (plain-text and JSON facts, plus optional WebMCP tools). The root domain (`brightworkrealty.com`) is covered by the `bw-agent-root` Worker. See **Agent discoverability** below.

---

## Agent discoverability

In addition to human-facing landing pages, this repo serves structured facts for AI agents and crawlers:

| Layer | Files | Reach |
|---|---|---|
| 1 | `robots.txt` | Any crawler |
| 2 | `llms.txt` | Plain-text/Markdown agents |
| 3 | `agents.json` | Structured JSON, no JS required |
| 4 | `agents.txt` + WebMCP | Action-capable browser agents (forward-looking) |

**Single source of truth:** `shared/agent-source-data.mjs`

**Generate program-page output** after editing source data:

```bash
node scripts/generate-agent-discoverability.mjs
```

That writes `robots.txt`, `llms.txt`, `agents.json`, and `webmcp-data.js` into each of the eight program folders. Do not hand-edit generated files.

**Root domain:** `bw-agent-root/` is a scripted Cloudflare Worker (not static assets) that serves `/robots.txt`, `/llms.txt`, and `/agents.json` for `brightworkrealty.com` via Luxury Presence redirects to `bw-agent-root.scott-5f5.workers.dev`.

Full architecture, content principles, maintenance checklist, and testing protocol: **`artifacts/agent-discoverability.md`**

---

## Pages

| Folder | URL | Status |
|---|---|---|
| `offmarket/` | offmarket.brightworkrealty.com | Live |
| `buybefore/` | buybefore.brightworkrealty.com | Live |
| `seniors/` | seniors.brightworkrealty.com | Live |
| `quiet/` | quiet.brightworkrealty.com | Live |
| `relaunch/` | relaunch.brightworkrealty.com | Live |
| `brightflip/` | brightflip.brightworkrealty.com | Live |
| `finaloffer/` | finaloffer.brightworkrealty.com | Live |
| `invest/` | invest.brightworkrealty.com | Live |

---

## Repo Structure

```
brightwork-landing-pages/
├── CLAUDE.md                  ← Claude Code session context
├── artifacts/
│   ├── handbook.md            ← full spec: brand rules, page patterns, per-page copy
│   └── agent-discoverability.md ← agent layer: llms.txt, agents.json, WebMCP, root Worker
├── shared/
│   ├── agent-source-data.mjs  ← canonical office + program facts (agent layer source)
│   ├── agent-response-builders.mjs ← root-domain response builders (bw-agent-root)
│   ├── posthog-init.js        ← PostHog analytics snippet (all pages load this)
│   ├── animations.js          ← scroll-reveal (program pages; seniors/workshop omits)
│   ├── brand.css              ← CSS token reference
│   └── BrightWork_logo.png    ← logo file (copied into each page's images/ folder)
├── bw-agent-root/             ← scripted Worker for brightworkrealty.com agent files
├── bw-fub-proxy/              ← form submission proxy to Follow Up Boss
├── scripts/
│   └── generate-agent-discoverability.mjs ← regenerates llms.txt, agents.json, webmcp-data.js
└── [pagename]/
    ├── index.html             ← entire page, CSS and JS inline
    ├── llms.txt               ← generated agent-readable Markdown
    ├── agents.json            ← generated structured facts
    ├── robots.txt             ← generated crawler hints
    ├── wrangler.toml          ← Cloudflare Workers config
    ├── .assetsignore
    └── images/
        └── logo.png           ← local copy of shared logo
```

---

## Local Development

No install, no build. Open `index.html` directly in a browser, or use any
static server:

```bash
npx serve offmarket
```

Forms will fail locally (CORS on the FUB proxy). That's expected.  
PostHog will opt out automatically on localhost.

---

## Deployment

Each page is deployed as its own Cloudflare Workers static site.

- Cloudflare account: scott@mktng.co  
- Account ID: `5f50d138eb76f9beb59f76d0f356543f`  
- One Workers deployment per page folder  
- Build command: none  
- CI: push to `main` triggers `.github/workflows/deploy.yml`  
- Custom domain set in Workers settings per subdomain  
- DNS lives in Cloudflare on the `brightworkrealty.com` zone

**Deployment note:** The wrangler-action runs from the repo root using `command: deploy --config ${{ matrix.page }}/wrangler.toml`. Do not set `workingDirectory` to the page folder — it causes wrangler to install its dependencies inside the page folder, which then get picked up as static assets and exceed Cloudflare's 25MB limit. Each page directory has a `.assetsignore` file excluding `node_modules/`, `package.json`, `package-lock.json`, and `.wrangler/`.

To deploy a new page: create the folder, add `wrangler.toml` and `.assetsignore`, add the page to the deploy workflow matrix, push to main, and add the custom domain in Workers settings. DNS record is auto-created via Cloudflare integration.

---

## Form Backend

All forms POST to a shared Cloudflare Worker that proxies to Follow Up Boss.

```
Worker: bw-fub-proxy
URL: https://bw-fub-proxy.scott-5f5.workers.dev
```

The FUB API key is an environment variable inside the Worker.  
It is not in this repo. Do not commit it here.

Payload must wrap all fields in a `person` object or the Worker returns 400.  
If a page gets a 403, the origin is not in the Worker's CORS allowlist —
check the Cloudflare dashboard.

---

## bw-fub-proxy Worker

The `bw-fub-proxy/` directory contains the Cloudflare Worker that proxies form
submissions from all BrightWork landing pages to the Follow Up Boss API.

- Worker name in Cloudflare: `bw-fub-proxy`
- Account ID: `5f50d138eb76f9beb59f76d0f356543f`
- Source of truth: this repo (`bw-fub-proxy/src/index.js`)
- Deploy: automatic via GitHub Actions on push to main (deploy-proxy job)
- Accepts POST requests from `*.brightworkrealty.com` and `moragacountryclubrealestate.com`
- Passes FUB_API_KEY from Cloudflare Worker environment secrets (not in this repo)

### History
Originally deployed directly in Cloudflare with no versioned source. Brought into
this repo on June 12, 2026 when PostHog identity stitching was added. As of that
date this repo is the single source of truth for the worker.

---

## Analytics

PostHog tracks cross-page behavior. All pages load `shared/posthog-init.js`.  
`cross_subdomain_cookie: true` is required so users across subdomains are
tracked as one person.

On form submit, `posthog.identify()` fires before the FUB call to link the
anonymous session to the named lead.

---

## Reference Docs

- **`artifacts/handbook.md`** — start here for human-facing pages. Contains brand tokens, all CSS
  patterns, page structure, per-page copy specs, voice rules, the new-page
  checklist, and schema templates.
- **`artifacts/agent-discoverability.md`** — start here for the agent layer. Covers the four-layer
  discovery model, single source of truth, per-page file reference, root Worker,
  content principles, maintenance checklist, and testing protocol.
- **`CLAUDE.md`** — Claude Code session context: hosting, form backend,
  PostHog config, Cloudflare account reference.

---

## Brand Constraints (Short Version)

- **Dark backgrounds:** teal `#005d7a` (`--teal`) only. Never `#1e2d3d` (deprecated) or navy for section backgrounds.
- **No em dashes.** Anywhere.
- **No mention of Side Real Estate** in any page copy. Back-office only.
- **Ben's title is REALTOR**, not Broker.
- **Address:** 455 Moraga Road, Suite I (letter I, not numeral 1), Moraga, CA 94556
- **Office phone:** (925) 200-6000
- **DRE:** 02014153

Full brand and copy rules are in `artifacts/handbook.md`.
