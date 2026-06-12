# Shared assets

Canonical copies of assets reused across BrightWork landing pages. Each page deploys as its own Cloudflare Worker static bundle, so **production pages cannot reference `../shared/` paths**. Copy needed files into each page folder (or inline snippets directly in HTML).

## PostHog — `posthog-init.js`

**Reference only.** Do not load this file via `<script src="../shared/posthog-init.js">` or any sibling path — it will 404 in production.

PostHog is inlined directly in each page's `<head>`. This file is the single source of truth for the stub loader and `posthog.init()` config. When anything changes here, re-inline the full contents across all 9 HTML files:

- `offmarket/index.html`
- `buybefore/index.html`
- `quiet/index.html`
- `relaunch/index.html`
- `brightflip/index.html`
- `finaloffer/index.html`
- `invest/index.html`
- `seniors/index.html`
- `seniors/workshop/index.html`

**Working pattern (deployed):**

1. **Stub loader** — current PostHog snippet (`__SV=1.7`) loads `array.js` from the assets host (derived from `api_host`). Uses `crossOrigin="anonymous"` and a `__loaded` guard to prevent double-init.
2. **`posthog.init()` config:**
   - Project key: `phc_D4PErHHVrdiiphQqEZ8qmintbxdNLtzCShtmgmwWC79i`
   - `api_host: 'https://us.i.posthog.com'` — event ingestion
   - `ui_host: 'https://us.posthog.com'` — PostHog UI links
   - `asset_host: 'https://us-assets.i.posthog.com'` — SDK asset delivery
   - `defaults: '2026-01-30'`
   - `cross_subdomain_cookie: true` — required for cross-subdomain session stitching on `*.brightworkrealty.com`
   - `person_profiles: 'identified_only'`
   - `loaded` callback opts out on `localhost`

**Do not revert to:** `ph.js` stub, `api_host`-only config without `ui_host`/`asset_host`, or external script src tags.

On form submit, call `posthog.identify(email, {...})` before the FUB proxy fetch.

## Other shared files

| File | Usage |
|---|---|
| `widget-tracker.js` | Copy to each page folder; load as `<script src="widget-tracker.js"></script>` immediately after PostHog |
| `animations.js` | Copy to each program page folder (not seniors/workshop); load before `</body>` |
| `brand.css` | Reference pattern varies by page |
| `BrightWork_logo.png` / `logo.png` | Copy into each page's `images/` folder |
| `nav-shrink.js`, `smart-way-strip.css`, `smart-way-strip.js` | Copied per page where used |
