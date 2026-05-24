# BrightWork Realty Advocates — Landing Pages

Marketing and lead capture pages for [BrightWork Realty Advocates](https://brightworkrealty.com).  
Maintained by [MKTNG.co](https://mktng.co) on behalf of Ben Olsen.  
Questions: scott@mktng.co

---

## What This Is

Each subdirectory is a standalone landing page for one of Ben's programs.  
Plain HTML, CSS, and vanilla JS. No framework. No build step.

---

## Pages

| Folder | URL | Status |
|---|---|---|
| `offmarket/` | offmarket.brightworkrealty.com | Live |
| `buybefore/` | buybefore.brightworkrealty.com | Live |
| `seniors/` | seniors.brightworkrealty.com | Live |
| `quiet/` | quiet.brightworkrealty.com | Build |
| `relaunch/` | relaunch.brightworkrealty.com | Build |
| `brightflip/` | brightflip.brightworkrealty.com | Build |
| `finaloffer/` | finaloffer.brightworkrealty.com | Build |
| `invest/` | invest.brightworkrealty.com | Build |

---

## Repo Structure

```
brightwork-landing-pages/
├── CLAUDE.md                  ← Claude Code session context
├── artifacts/
│   └── handbook.md            ← full spec: brand rules, page patterns, per-page copy
├── shared/
│   ├── posthog-init.js        ← PostHog analytics snippet (all pages load this)
│   ├── brand.css              ← CSS token reference
│   └── BrightWork_logo.png    ← logo file (copied into each page's images/ folder)
└── [pagename]/
    ├── index.html             ← entire page, CSS and JS inline
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

## Analytics

PostHog tracks cross-page behavior. All pages load `shared/posthog-init.js`.  
`cross_subdomain_cookie: true` is required so users across subdomains are
tracked as one person.

On form submit, `posthog.identify()` fires before the FUB call to link the
anonymous session to the named lead.

---

## Reference Docs

- **`artifacts/handbook.md`** — start here. Contains brand tokens, all CSS
  patterns, page structure, per-page copy specs, voice rules, the new-page
  checklist, and schema templates.
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
