# BrightWork Landing Pages — Project Context for Claude Code

Maintained by MKTNG.co on behalf of Ben Olsen, BrightWork Realty Advocates.
Questions: scott@mktng.co

---

## Project Purpose

This monorepo holds all BrightWork Realty Advocates program landing pages.
Each page is a standalone lead capture site for a specific program Ben offers.
Pages are plain HTML/CSS/vanilla JS. No framework. No build step.

MCC site (moragacountryclubrealestate.com) is a separate Astro project in a
separate repo and is NOT part of this codebase.

---

## Repo Structure

```
brightwork-landing-pages/
├── CLAUDE.md                  ← you are here
├── shared/
│   ├── posthog-init.js        ← shared PostHog snippet (cross-subdomain)
│   ├── brand.css              ← CSS custom properties / token reference
│   └── logo.png               ← BrightWork logo (same file across all pages)
├── offmarket/                 → offmarket.brightworkrealty.com
│   ├── index.html
│   └── images/
├── buybefore/                 → buybefore.brightworkrealty.com
│   ├── index.html
│   └── images/
├── quiet/                     → quiet.brightworkrealty.com  [TO BUILD]
├── revive/                    → revive.brightworkrealty.com  [TO BUILD]
├── relaunch/                  → relaunch.brightworkrealty.com  [TO BUILD]
└── finaloffer/                → finaloffer.brightworkrealty.com  [TO BUILD]
```

Each subdirectory is a self-contained page. All CSS and JS inline in
index.html unless a file becomes large enough to warrant extraction.
Images live in a local /images/ folder per page.

---

## Tech Stack

| Layer        | Solution                                      |
|--------------|-----------------------------------------------|
| Hosting      | Cloudflare Pages (one deployment per folder)  |
| DNS          | Cloudflare (on brightworkrealty.com zone)     |
| Form backend | bw-fub-proxy Cloudflare Worker                |
| CRM          | Follow Up Boss                                |
| Analytics    | PostHog (shared init, per-page events)        |
| Fonts        | Google Fonts — Montserrat only                |
| Framework    | None. Plain HTML, CSS, vanilla JS.            |

---

## Hosting: Cloudflare Pages

Each page has its own Cloudflare Pages deployment pointing to its subdirectory.
No build command. No output directory configuration needed (static HTML).

Deployment pattern:
- Build root: `/offmarket` (or whichever page folder)
- Build command: (none)
- Output directory: (none / root)
- Branch: main

DNS pattern for each subdomain:
```
Type  Host         Value                      Proxied
CNAME quiet        [pages-deployment].pages.dev  Yes
```

DNS for brightworkrealty.com is managed via Cloudflare. MKTNG.co has
access. No external DNS requests needed for new subdomains.

When adding a new page:
1. Create the folder and index.html
2. Create a new Cloudflare Pages project, set root to the folder
3. Add the custom domain in Pages settings
4. DNS record is auto-created via Cloudflare integration

---

## FUB Proxy — bw-fub-proxy

All forms POST to this Cloudflare Worker, which proxies to Follow Up Boss.

```
URL: https://bw-fub-proxy.scott-5f5.workers.dev
Method: POST
Content-Type: application/json
```

Required payload shape — wrap everything in a `person` object or the
Worker returns 400:

```javascript
{
  person: {
    firstName: "Jane",
    lastName:  "Smith",
    emails: [{ value: "jane@email.com", type: "work" }],
    phones: [{ value: "(925) 555-0100", type: "mobile" }],
    tags:   ["[lead-tag]", "[source-string]"]
  }
}
```

The FUB API key lives as an environment variable inside the Worker.
It is NOT in this repo and must never be committed here.

CORS: The Worker accepts requests from *.brightworkrealty.com (wildcard
configured after monorepo migration). If a new page doesn't get through,
check the Worker's allowed origins list in the Cloudflare dashboard.

### Per-page FUB tags

Every page uses two tags: a lead type tag and a source string.
Both go into the `tags` array on the person object.

| Page       | Lead tag                    | Source string                    |
|------------|-----------------------------|----------------------------------|
| offmarket  | off-market-lead             | Off-Market Landing Page          |
| buybefore  | buy-before-you-sell-lead    | Buy Before You Sell Landing Page |
| quiet      | quiet-listing-lead          | Quiet Listing Landing Page       |
| revive     | pre-sale-construction-lead  | Pre-Sale Construction Page       |
| relaunch   | relaunch-lead               | Relaunch Strategy Page           |
| finaloffer | final-offer-lead            | Final Offer Landing Page         |

If a form has a qualifying dropdown (e.g., "where are you in the process?"),
pass the selected value as an additional tag in the array.

---

## PostHog Analytics

PostHog tracks cross-page behavior so the COS agent can see a lead's full
path before Ben calls them.

Shared init file: `shared/posthog-init.js`
Every page loads it: `<script src="../shared/posthog-init.js"></script>`

Critical config — cross-subdomain cookie must be true so a user visiting
multiple subdomains is tracked as one person:

```javascript
posthog.init('YOUR_PROJECT_ID', {
  api_host: 'https://us.i.posthog.com',
  cross_subdomain_cookie: true,   // ← required for *.brightworkrealty.com
  loaded: function(posthog) {
    if (location.hostname === 'localhost') posthog.opt_out_capturing();
  }
});
```

PostHog project ID: [ADD WHEN CONFIGURED — do not hardcode a placeholder]

### Identity linking

When a form submits successfully, call posthog.identify() with the
lead's email before the FUB proxy call fires. This links the anonymous
browsing session to the named lead:

```javascript
posthog.identify(emailValue, {
  email: emailValue,
  name: firstName + ' ' + lastName,
  fub_source: LEAD_SOURCE
});
```

### Standard events to capture per page

Capture these on every page using posthog.capture():

```javascript
// Page-specific interest (fire on page load)
posthog.capture('page_view_program', { program: 'quiet-listing' });

// Form started (fire when first field is focused)
posthog.capture('form_started', { program: 'quiet-listing' });

// Form submitted successfully (fire after FUB proxy returns 200)
posthog.capture('lead_submitted', { program: 'quiet-listing', source: LEAD_SOURCE });
```

Use the page folder name as the `program` value.

---

## Brand Tokens

These are the canonical CSS custom properties used across all pages.
Define them in `:root` at the top of every index.html (or in shared/brand.css).

```css
:root {
  --cyan:        #0bbfe0;   /* primary action color */
  --cyan-dark:   #0099b8;   /* hover state */
  --cyan-light:  #e6f9fd;   /* light tint backgrounds */
  --yellow:      #f5c800;   /* badges, highlights, CTA buttons */
  --navy:        #1a2f45;   /* dark backgrounds, headings */
  --teal:        #005d7a;   /* trust bars, section backgrounds */
  --white:       #ffffff;
  --off-white:   #f7fafc;   /* light section backgrounds */
  --text:        #1e2d3d;   /* body text */
  --muted:       #5a7184;   /* secondary text, descriptions */
  --border:      #d8edf4;   /* card borders, dividers */
  --page-gutter: 60px;      /* horizontal padding for full-width sections */
}
```

---

## Typography

Font family: Montserrat only. Loaded from Google Fonts.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
```

Usage by role:
- Hero h1: 800 weight, clamp(40px, 5.5vw, 68px), letter-spacing -0.025em
- Section h2: 800 weight, clamp(26px, 2.5vw, 38px), letter-spacing -0.02em
- Body copy: 300 weight, 15px, line-height 1.9
- Labels / eyebrows: 700 weight, 10-11px, letter-spacing 0.2em, uppercase
- Nav / buttons: 600-700 weight, 12-14px

No other fonts. Do not substitute Inter, DM Sans, or any system fonts.

---

## Page Structure Pattern

Every page follows this section order. Do not deviate unless there is a
specific content reason documented in the page folder.

```
1. <head>   meta, OG tags, theme-color, font link
2. nav      fixed, 72px height, logo left + phone right
3. hero     full-bleed bg image, dark overlay, badge + h1 + p + CTA button
4. trust-bar  4 credibility items, navy or teal background
5. [content sections]  varies by program
6. split    left: program summary / checklist  |  right: lead capture form (cyan bg)
7. disclaimer-bar  compliance notice, navy background
8. footer   DRE, address, privacy policy link
```

### Nav

```html
<nav>
  <a href="https://brightworkrealty.com" class="nav-logo" target="_blank" rel="noopener noreferrer">
    <img src="images/logo.png" alt="BrightWork Realty Advocates" ... />
    <span class="nav-logo-text" id="navLogoText">BrightWork Realty</span>
  </a>
  <a href="tel:9252006000" class="nav-phone">
    <!-- phone svg + (925) 200-6000 -->
  </a>
</nav>
```

Logo fallback: if img fails to load, the span with id="navLogoText" becomes
visible. Always include both. The onerror handler on the img triggers this.

### Hero badge

```html
<div class="hero-badge">
  <div class="badge-dot"></div>  <!-- optional blinking dot for urgency -->
  BADGE TEXT
</div>
```

Use the badge for program category, not a sales claim.

### Form panel (split-right)

Background: --cyan. Form fields use semi-transparent white inputs.
Submit button: --yellow with --navy text. Always uppercase, letter-spaced.
Consent checkbox required above submit. Links to:
https://brightworkrealty.com/terms-and-conditions

Success state: hide the form, show .success-state div with yellow circle check.

### Disclaimer bar

Required on all pages. Content varies by program but must always appear.
Navy background, yellow info icon, subdued body text.

### Footer

```html
<footer>
  <p>BrightWork Realty Advocates &middot; DRE# 02014153 &middot; 455 Moraga Road, Suite 1, Moraga, CA 94556</p>
  <div>
    <a href="https://brightworkrealty.com/terms-and-conditions">Privacy Policy</a>
    <a href="https://brightworkrealty.com">BrightWork Realty</a>
  </div>
</footer>
```

---

## Form Submission JS Pattern

Every page uses the same submission pattern. Copy this exactly and update
the three config constants at the top:

```javascript
const FUB_PROXY_URL = 'https://bw-fub-proxy.scott-5f5.workers.dev';
const LEAD_TAG      = '[page-specific-tag]';     // see FUB tags table above
const LEAD_SOURCE   = '[Page Source String]';    // see FUB tags table above

document.getElementById('leadForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn     = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');

  btn.disabled = true;
  btnText.textContent = 'Submitting...';
  spinner.style.display = 'block';

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const emailVal  = document.getElementById('email').value.trim();
  const phoneVal  = document.getElementById('phone').value.trim();

  // PostHog identity link — must fire before FUB call
  if (typeof posthog !== 'undefined') {
    posthog.identify(emailVal, { email: emailVal, name: firstName + ' ' + lastName });
    posthog.capture('lead_submitted', { program: LEAD_TAG, source: LEAD_SOURCE });
  }

  const payload = {
    person: {
      firstName,
      lastName,
      emails: [{ value: emailVal, type: 'work' }],
      phones: [{ value: phoneVal, type: 'mobile' }],
      tags:   [LEAD_TAG, LEAD_SOURCE]
    }
  };

  try {
    const res = await fetch(FUB_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      document.getElementById('leadForm').style.display = 'none';
      document.getElementById('successState').style.display = 'block';
    } else {
      throw new Error('Proxy error');
    }
  } catch (err) {
    alert('Something went wrong. Please call us at (925) 200-6000.');
    btn.disabled = false;
    btnText.textContent = 'Submit';   // update to match page CTA label
    spinner.style.display = 'none';
  }
});
```

---

## HTTPS Redirect

Every page includes this snippet at the top of `<head>` to force HTTPS:

```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
<script>
  if (location.protocol === 'http:' && location.hostname !== 'localhost')
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
</script>
```

---

## Responsive Breakpoint

All pages break at 800px. Below 800px:
- --page-gutter drops to 28px
- Two-column splits stack to single column
- Trust bars reduce gap and padding
- Hero min-height reduces

```css
@media (max-width: 800px) {
  :root { --page-gutter: 28px; }
  .split { grid-template-columns: 1fr; }
  /* etc */
}
```

---

## Brand Voice Constraints

These apply to all copy written for or in this repo. Non-negotiable.

- NO EM DASHES. Not one. Use a comma, a period, or rewrite the sentence.
- No mention of Side Real Estate in any copy. It is a back-office brokerage
  relationship. BrightWork Realty Advocates is the only brand that appears.
- No mention of Ben's direct cell (925-255-9727) on most pages.
  Use office line (925) 200-6000 unless the page specifically calls for it.
- Ben's title: Founder | Realtor, BrightWork Realty Advocates
- No "Broker" title. Ben is a REALTOR, not a Broker.
- DRE for brokerage promotion: 02014153
- DRE for Ben personally: 01409268 (only when promoting Ben as an individual)
- Tagline: "The Smart Way to Real Estate"
- No hype words: cutting-edge, game-changing, revolutionary, seamless,
  robust, leverage (verb), transformative, unprecedented.
- Write outcomes, not features. "More informed buyers" not "we use 3D tours."

---

## Ben Olsen Contact Reference

```
Name:    Ben Olsen
Title:   Founder | Realtor, BrightWork Realty Advocates
Office:  (925) 200-6000  [use on all pages]
Direct:  (925) 255-9727  [do not publish unless page specifically warrants it]
Email:   ben@brightworkrealty.com
Web:     brightworkrealty.com
DRE:     01409268 (personal) / 02014153 (brokerage)
Address: 455 Moraga Road, Suite 1, Moraga, CA 94556
```

---

## Adding a New Page: Checklist

When building a new page in this repo:

- [ ] Create `[pagename]/index.html` and `[pagename]/images/`
- [ ] Copy logo.png from shared/ or reference `../shared/logo.png`
- [ ] Add `<script src="../shared/posthog-init.js"></script>` before closing `</head>`
- [ ] Set correct LEAD_TAG and LEAD_SOURCE constants (see table above)
- [ ] Include posthog.identify() and posthog.capture() in form submission handler
- [ ] Include HTTPS redirect snippet in `<head>`
- [ ] Include consent checkbox linking to brightworkrealty.com/terms-and-conditions
- [ ] Include disclaimer bar before footer
- [ ] Footer uses standard DRE/address format
- [ ] No em dashes anywhere in copy
- [ ] No mention of Side Real Estate
- [ ] Create Cloudflare Pages deployment with build root = /[pagename]
- [ ] Add CNAME DNS record for new subdomain

---

## Common Tasks for Claude Code Sessions

When asked to build a new page, reference an existing page as the pattern:
`@offmarket/index.html` or `@buybefore/index.html`

When asked to update shared config (PostHog, brand tokens):
Edit `shared/posthog-init.js` or `shared/brand.css`, then verify the
reference path is correct in each page's index.html.

When debugging a form submission:
Check browser console for the fetch response. 400 usually means the
payload is missing the `person` wrapper. 403 usually means the origin
is not in the Worker's CORS allowlist.

When checking for consistency across pages:
`grep -r "LEAD_TAG\|LEAD_SOURCE\|FUB_PROXY" */index.html`

---

## Cloudflare Account Reference

Account: scott@mktng.co
Account ID: 5f50d138eb76f9beb59f76d0f356543f
Worker: bw-fub-proxy (handles all BrightWork form submissions)
Separate worker: moraga-country-club-realestate (MCC site — not this repo)
