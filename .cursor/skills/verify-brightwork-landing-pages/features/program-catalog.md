# Program catalog load

All eight BrightWork program landing pages load as static HTML with a lead capture form. This feature confirms each folder serves `index.html` containing `#leadForm` and BrightWork branding.

## Sub-features

- `offmarket-load` serves `offmarket/index.html` with lead form.
- `buybefore-load` serves `buybefore/index.html` with lead form.
- `seniors-load` serves `seniors/index.html` with lead form.
- `quiet-load` serves `quiet/index.html` with lead form.
- `relaunch-load` serves `relaunch/index.html` with lead form.
- `brightflip-load` serves `brightflip/index.html` with lead form.
- `finaloffer-load` serves `finaloffer/index.html` with lead form.
- `invest-load` serves `invest/index.html` with lead form.

## How to get to it (user POV)

- Visit each live subdomain: `offmarket.brightworkrealty.com`, `buybefore.brightworkrealty.com`, and the other six program hosts.
- Locally, serve each folder in turn and open `/`.

## Driving it with control-brightwork

Preconditions:

- Harness deps installed.
- No other process owns port `4174` (catalog default) or set `BW_VERIFY_CATALOG_PORT`.

- **Drive catalog.** Run `control-brightwork.mjs drive --feature program-catalog --evidence-dir <dir>`. Command sequentially serves each of the eight folders, fetches `/`, and records `hasLeadForm` per program.
- **Proof.** `program-catalog.json` in evidence dir lists all eight programs with `"ok": true`.

## Gotchas

- This feature spins up eight short-lived servers. It does not use the long-lived instance from `launch`.
- `seniors/workshop/index.html` is intentionally excluded. It is a workshop registration page, not one of the eight deployed program Workers.
- Each page uses different hero CTA anchor targets. Catalog load only checks form presence, not CTA scroll paths.
- Catalog drive takes longer than single-page features. Allow up to two minutes.
