# Shared page shell

Every program landing page shares a minimal nav (BrightWork logo link and phone number), plus the smart-way strip footer component. A visitor sees these on initial load without scrolling to the form.

## Sub-features

- `nav-logo` shows the BrightWork Realty Advocates logo or fallback text linking to brightworkrealty.com.
- `nav-phone` shows a clickable `(925) 200-6000` tel link in the fixed nav.
- `smart-way-strip` renders the "The Smart Way to Real Estate" cross-program strip above the footer.

## How to get to it (user POV)

- Open any program page at its local serve URL (for example `http://localhost:4173/` after `launch --page offmarket`).
- Look at the top nav and scroll to the footer area for the smart-way strip.

## Driving it with control-brightwork

Preconditions:

- A program folder is serving locally.
- `control-brightwork.mjs doctor` reports `"ok": true`.

- **Load page.** Run `control-brightwork.mjs browser goto --url /`. Document title contains "BrightWork".
- **Nav logo.** Run `control-brightwork.mjs browser snapshot --path /tmp/nav.aria.txt` after goto. ARIA tree includes a link named like "BrightWork Realty Advocates" or "BrightWork Realty".
- **Phone link.** Assert link `(925) 200-6000` is present. Run `control-brightwork.mjs drive --feature shared-page-shell --evidence-dir <dir>`. JSON output shows `phoneLink: true`.
- **Smart-way strip.** Same drive command checks `.smart-way-strip` or `#smartWayStrip` count greater than zero.
- **Proof.** `shared-page-shell.png` in evidence dir shows nav and strip region.

## Gotchas

- Logo image may 404 locally if `images/logo.png` is missing; fallback text `#navLogoText` should still appear. Assert on the link role, not the image asset.
- External logo link opens `brightworkrealty.com`. Do not follow it during headless drives unless testing outbound links explicitly.
- `seniors/workshop/` uses the same shell pattern but different hero copy. Launch that subfolder separately.
