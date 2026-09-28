# Off-Market lead form

A visitor on the Off-Market Access page clicks the hero CTA, scrolls to the VIP list form, fills required fields, and sees a success message after submit. Verification uses dry-run intercept so no real lead reaches Follow Up Boss.

## Sub-features

- `hero-cta-scroll` clicks "Get Private Access" and brings `#leadForm` into view.
- `form-fill` enters first name, last name, email, phone, and checks consent.
- `form-submit-dry-run` submits with FUB proxy intercepted; success UI appears.
- `success-state` hides `#leadForm` and shows `#successState` with "You're on the list!".

## How to get to it (user POV)

- Open `http://localhost:4173/` after launching the `offmarket` folder.
- Click the hero link labeled "Get Private Access".
- Fill the form in the `#get-access` section and click the submit button ("Join the VIP List").

## Driving it with control-brightwork

Preconditions:

- `offmarket` is serving at `http://localhost:4173`.
- `control-brightwork.mjs doctor` reports `"ok": true`.
- Harness dry-run intercept is active (default for all browser sessions).

- **Load page.** Open the home URL. Run `control-brightwork.mjs browser goto --url /`. Page title contains "Off-Market" and `#leadForm` exists.
- **Hero CTA.** Click "Get Private Access". Run `control-brightwork.mjs browser click --role link --name "Get Private Access"`. `#leadForm` is visible in the viewport.
- **Fill fields.** Enter test data. Run fills on `#firstName`, `#lastName`, `#email`, `#phone`, and check `#consent`. All fields accept input.
- **Submit dry-run.** Click submit. Run `control-brightwork.mjs drive --feature offmarket-lead-form --evidence-dir <dir>`. `#successState` becomes visible; `#leadForm` is hidden; heading reads "You're on the list!".
- **Proof.** Artifacts in evidence dir: `offmarket-lead-form-success.png`, `offmarket-lead-form-success.aria.txt`, `offmarket-lead-form-log.json`. Log shows `submit-dry-run` with `form-hidden: true`.

## Gotchas

- Opening `index.html` via `file://` breaks relative paths and form fetch. Always serve over HTTP.
- Use `localhost`, not `127.0.0.1`. The inline redirect script sends `127.0.0.1` HTTP traffic to HTTPS.
- Local form submit to the real FUB proxy often fails CORS. The harness intercept is required for local proof.
- PostHog `form_started` and `lead_submitted` events do not fire on localhost. Do not assert on them.
- The consent checkbox is `required`. Skipping it blocks submit.
- Hero CTA target is `#get-access` on offmarket only. Other programs use different anchor IDs (`#contact`, `#get-started`, etc.).
