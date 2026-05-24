# BrightWork Realty Advocates — Agent Handbook

**Maintained by:** MKTNG.co on behalf of Ben Olsen, BrightWork Realty Advocates  
**For:** ai-pdlc subagents maintaining landing pages in this repo  
**Questions:** scott@mktng.co

---

## 1. Project Overview

This repo holds all BrightWork Realty Advocates program landing pages. Each page is a standalone lead capture site for a specific program Ben Olsen offers. Pages are plain HTML/CSS/vanilla JS — no framework, no build step.

**Deployment status:** All eight program landing pages are built and deployed to Cloudflare Workers. GitHub Actions deploys on push to `main` via `.github/workflows/deploy.yml`.

**Client:** Ben Olsen, Founder and REALTOR, BrightWork Realty Advocates  
**Agency:** MKTNG.co (Scott Eggert)  
**Market:** Lamorinda — Moraga, Lafayette, Orinda — East Bay, CA  
**Main site:** https://brightworkrealty.com (Luxury Presence CMS, do not modify)  
**MCC site:** https://moragacountryclubrealestate.com (separate Astro repo, not this codebase)

---

## 2. Hard Rules — Non-Negotiable

Every agent must internalize these before writing a single line of code or copy.

**Identity**
- Ben's title is **REALTOR**, never Broker. This has leaked before. Watch for it.
- Brand name: **BrightWork Realty Advocates** — full name on first use per page, BrightWork thereafter
- Tagline: **"The Smart Way to Real Estate"**
- **Side Real Estate is invisible to clients.** Never mention it in any page copy, hero, footer, or section. It appears only in the legal footer line as required: `Brokered by Side Real Estate`
- Do not center Ben's mother or family legacy. Correct tenure framing: "The BrightWork team has operated in Lamorinda since 1977"

**Copy**
- **NO EM DASHES.** Not one. Use a comma, a period, or rewrite the sentence.
- No hype words: cutting-edge, game-changing, revolutionary, seamless, robust, leverage (verb), transformative, unprecedented, groundbreaking, multifaceted, pivotal
- Write outcomes, not features. "More informed buyers" not "we use 3D tours"
- No specific dollar amounts or lender names for capital programs
- Never say "pocket listing" — always "private buyer network" or "private listing"
- Do not guarantee outcomes. Use "a real shot at a different result," not "we'll sell your home"

**Contact / Legal**
- Office phone: **(925) 200-6000** — use on all pages
- Direct cell (925) 255-9727: do NOT publish unless a page specifically warrants it
- Email: ben@brightworkrealty.com
- Address: **455 Moraga Road, Suite I, Moraga, CA 94556** — Suite I is the LETTER I, not the numeral 1
- Brokerage DRE: **02014153** (use when promoting BrightWork)
- Ben's personal DRE: 01409268 (use only when promoting Ben as an individual)

**Technical**
- Font: **Montserrat only** — loaded from Google Fonts. No Inter, DM Sans, or system fonts.
- All pages must include the HTTPS redirect snippet
- All pages must include the PostHog init script from `../shared/posthog-init.js`
- Suite I fix: `sed -i 's/Suite 1, Moraga/Suite I, Moraga/g'` if needed

**Color**
- Dark backgrounds (hero scrim, footer, disclaimer, trust bar, case-study bands) use **`--teal` (`#005d7a`) only**
- Never use **`#1e2d3d`** — deprecated dark blue that crept into early builds; grep the repo and remove if found
- Never use `var(--navy)` or `#1a2f45` for section backgrounds — `--navy` is typography on light backgrounds only
- Labels and accents **on teal backgrounds** use **`--yellow` (`#ffe200`)**, not cyan
- `theme-color` meta tag: **`#005d7a`**

---

## 3. Brand Tokens

Use these exact CSS custom properties in every page `:root` block. Reference copy also lives in `shared/brand.css`.

```css
:root {
  --cyan:        #0bbfe0;   /* primary action color on light backgrounds */
  --cyan-dark:   #0099b8;   /* hover state */
  --cyan-light:  #e6f9fd;   /* light tint backgrounds */
  --yellow:      #ffe200;   /* badges, hero h1 spans, labels on teal backgrounds */
  --teal:        #005d7a;   /* dark brand color — hero scrim, footer, disclaimer, trust bars, dark section backgrounds */
  --navy:        #1a2f45;   /* headings and body text on light backgrounds only — not for dark bands */
  --white:       #ffffff;
  --off-white:   #f7fafc;   /* light section backgrounds */
  --text:        #1a2f45;   /* body text on light backgrounds — same as --navy */
  --muted:       #5a7184;   /* secondary text, descriptions */
  --border:      #d8edf4;   /* card borders, dividers */
  --page-gutter: 60px;      /* horizontal padding, drops to 28px at 800px */
}
```

### Color roles

| Token | Hex | Use |
|---|---|---|
| `--teal` | `#005d7a` | Hero scrim base, footer, disclaimer, trust bar, case-study bands, any dark section background |
| `--navy` / `--text` | `#1a2f45` | Headings, nav links, body copy on white or off-white sections |
| `--yellow` | `#ffe200` | Hero h1 accent spans, eyebrows/labels on teal backgrounds, disclaimer icons |
| `--cyan` | `#0bbfe0` | CTAs, nav hover, links on light backgrounds |
| ~~`#1e2d3d`~~ | — | **Banned.** Do not use anywhere. Replace with `--teal` for backgrounds or `--navy` for text. |

Every page `:root` must declare `--teal: #005d7a`. Copy the dark-section CSS below — do not substitute `var(--navy)` for backgrounds.

### Dark section CSS — copy exactly

**Hero** — teal base + teal-tinted gradient overlay; yellow accent on h1 span:

```css
.hero-bg {
  position: absolute;
  inset: 0;
  background-color: var(--teal);
  background-image: url('images/hero.jpg');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 45, 60, 0.82) 0%,
    rgba(0, 55, 72, 0.62) 48%,
    rgba(0, 65, 85, 0.28) 85%,
    rgba(0, 70, 90, 0.12) 100%
  );
}
.hero h1 span { color: var(--yellow); }
```

**Trust bar, disclaimer bar, MLS bar, footer** — all use `background: var(--teal)` with light text:

```css
.trust-bar,
.disclaimer-bar,
.mls-bar {
  background: var(--teal);
  color: rgba(255,255,255,0.85);
}
.disclaimer-bar svg,
.mls-bar svg {
  stroke: var(--yellow);
}
footer {
  background: var(--teal);
  color: rgba(255,255,255,0.85);
}
```

Eyebrows and section labels sitting on teal use `color: var(--yellow)`, not `var(--cyan)`.

---

## 4. Typography

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
```

| Role | Weight | Size | Notes |
|---|---|---|---|
| Hero h1 | 800 | clamp(40px, 5.5vw, 68px) | letter-spacing: -0.025em |
| Section h2 | 800 | clamp(26px, 2.5vw, 38px) | letter-spacing: -0.02em |
| Body copy | 300 | 15px | line-height: 1.9 |
| Eyebrow / label | 700 | 10-11px | letter-spacing: 0.2em, uppercase |
| Nav / buttons | 600-700 | 12-14px | |

---

## 5. Repo Structure

```
brightwork-landing-pages/
├── CLAUDE.md
├── artifacts/
│   └── handbook.md            ← this file
├── shared/
│   ├── posthog-init.js
│   ├── animations.js          ← scroll-reveal (all program pages except seniors/workshop)
│   ├── brand.css
│   └── logo.png
├── offmarket/                 → offmarket.brightworkrealty.com  [EXISTS]
│   ├── index.html
│   ├── wrangler.toml
│   └── images/
│       └── logo.png           ← copy from shared/logo.png
├── buybefore/                 → buybefore.brightworkrealty.com  [EXISTS]
│   ├── index.html
│   ├── wrangler.toml
│   └── images/
│       └── logo.png
├── quiet/                     → quiet.brightworkrealty.com      [EXISTS]
│   ├── index.html
│   ├── wrangler.toml
│   └── images/
├── relaunch/                  → relaunch.brightworkrealty.com   [EXISTS]
│   ├── index.html
│   ├── wrangler.toml
│   └── images/
├── brightflip/                → brightflip.brightworkrealty.com [EXISTS]
│   ├── index.html
│   ├── wrangler.toml
│   └── images/
├── finaloffer/                → finaloffer.brightworkrealty.com [EXISTS]
│   ├── index.html
│   ├── wrangler.toml
│   └── images/
├── invest/                    → invest.brightworkrealty.com     [EXISTS]
│   ├── index.html
│   ├── wrangler.toml
│   └── images/
└── seniors/                   → seniors.brightworkrealty.com    [EXISTS]
    ├── index.html             ← permanent senior services page
    ├── workshop/
    │   └── index.html         ← workshop / interest-list page (/workshop)
    ├── images/
    │   ├── logo.png
    │   ├── logo-white.png
    │   ├── hero.jpg
    │   ├── ben-olsen.png
    │   └── REALTOR_EHO_white.png
    └── wrangler.toml
```

**Seniors deployment note:** Cloudflare Workers static assets deploy from the `seniors/` folder root. The workshop lives at `seniors/workshop/index.html` (URL: `seniors.brightworkrealty.com/workshop`). Copy all shared assets into `seniors/images/` — do not reference `../shared/` for images (Worker cannot access sibling folders). PostHog init: `../shared/posthog-init.js` on `seniors/index.html`, `../../shared/posthog-init.js` on `seniors/workshop/index.html`.

When building a new page: create `[pagename]/index.html` and `[pagename]/images/`. Copy `shared/logo.png` into `[pagename]/images/logo.png`. Reference the logo in nav and footer as `images/logo.png` (not `../shared/logo.png`). Each page is self-contained for Cloudflare Workers static asset deployment.

**Deployment note:** The wrangler-action runs from the repo root using `command: deploy --config ${{ matrix.page }}/wrangler.toml`. Do not set `workingDirectory` to the page folder — it causes wrangler to install its dependencies inside the page folder, which then get picked up as static assets and exceed Cloudflare's 25MB limit. Each page directory has a `.assetsignore` file excluding `node_modules/`, `package.json`, `package-lock.json`, and `.wrangler/`.

---

## 6. Page Structure — Required Section Order

Every page follows this order. Do not deviate without documented reason.

```
1. <head>     meta tags, OG tags, canonical, theme-color, font link, schema JSON-LD
2. nav        fixed 72px, logo left + optional nav-links center + phone right
3. hero       full-bleed bg image, teal overlay, badge + h1 + subhead + CTA
4. trust-bar  4 credibility items, teal background
5. [content]  varies by program — see per-page specs below
6. split      left: program summary / checklist  |  right: lead form (cyan bg)
7. faq        3-5 Q&A pairs before disclaimer
8. disclaimer teal background, compliance notice — required on all pages
9. footer     universal footer with programs column — see Section 9
```

---

## 7. Head — Required Elements

```html
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
  <script>
    if (location.protocol === 'http:' && location.hostname !== 'localhost')
      location.replace('https://' + location.host + location.pathname + location.search + location.hash);
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="[keyword-led description, 150-160 chars]" />
  <meta name="theme-color" content="#005d7a" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="BrightWork Realty Advocates" />
  <meta property="og:title" content="[Keyword Phrase] | BrightWork Realty Advocates" />
  <meta property="og:description" content="[Same as meta description]" />
  <meta property="og:url" content="https://[subdomain].brightworkrealty.com/" />
  <link rel="canonical" href="https://[subdomain].brightworkrealty.com/" />
  <title>[Keyword Phrase] | BrightWork Realty Advocates</title>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <!-- PostHog -->
  <script src="../shared/posthog-init.js"></script>
  <!-- Schema: paste RealEstateAgent + FAQPage + Service JSON-LD blocks here -->
</head>
```

**Title format:** Lead with keyword, end with brand. "Off-Market Homes in Lamorinda | BrightWork Realty Advocates" not "BrightWork Realty Advocates - Off-Market Listings"

---

## 8. Nav Component

Logo path is always `images/logo.png` (local copy per page). Do not use `../shared/logo.png` in nav or footer.

```html
<nav>
  <a href="https://brightworkrealty.com" class="nav-logo" target="_blank" rel="noopener noreferrer">
    <img src="images/logo.png" alt="BrightWork Realty Advocates" decoding="async"
         onerror="this.style.display='none';document.getElementById('navLogoText').classList.add('is-visible');" />
    <span class="nav-logo-text" id="navLogoText">BrightWork Realty</span>
  </a>

  <!-- Insert .nav-links div here only when specified in per-page spec -->
  <!-- <div class="nav-links">
    <a href="https://brightworkrealty.com/about-us" class="nav-link" target="_blank" rel="noopener">Our Team</a>
    <a href="https://brightworkrealty.com/properties" class="nav-link" target="_blank" rel="noopener">Properties</a>
  </div> -->

  <a href="tel:9252006000" class="nav-phone">
    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l1.06-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    (925) 200-6000
  </a>
</nav>
```

**Nav links by page:**

| Page | Center nav-links |
|---|---|
| offmarket | None — urgency page, minimal nav |
| buybefore | Our Team only |
| quiet | Our Team only |
| relaunch | None — skeptical audience from QR code |
| brightflip | Our Team only |
| finaloffer | Our Team + Properties |
| invest | Our Team + Properties |
| seniors | None — logo + phone only (services and workshop pages) |

**Nav CSS — add after existing `.nav-phone svg` rule:**

```css
.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}
.nav-link {
  color: var(--navy);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
  padding-bottom: 3px;
  transition: color 0.2s;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0;
  height: 1.5px;
  background: var(--cyan);
  transition: width 0.2s ease;
}
.nav-link:hover { color: var(--cyan-dark); }
.nav-link:hover::after { width: 100%; }
@media (max-width: 800px) {
  .nav-links { display: none; }
}
```

---

## 9. Universal Footer

Replace any existing footer HTML and CSS with this pattern on every page.

**Footer CSS:**

```css
footer {
  background: var(--teal);
  color: rgba(255,255,255,0.85);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.footer-top {
  padding: 52px 60px 40px;
  display: flex;
  justify-content: space-between;
  gap: 48px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer-name {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.02em;
}
.footer-tagline {
  font-size: 12px;
  font-weight: 300;
  font-style: italic;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.04em;
}
.footer-phone {
  font-size: 13px;
  font-weight: 600;
  color: var(--cyan);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-phone:hover { color: white; }
.footer-programs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 220px;
}
.footer-col-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 4px;
}
.footer-programs a {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-programs a:hover { color: var(--cyan); }
.footer-bar {
  padding: 20px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.footer-bar p {
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  font-weight: 300;
}
.footer-bar a {
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  font-size: 11px;
  transition: color 0.2s;
}
.footer-bar a:hover { color: var(--cyan); }
.footer-bar-links {
  display: flex;
  gap: 20px;
  align-items: center;
}
@media (max-width: 800px) {
  .footer-top { flex-direction: column; padding: 40px 28px 32px; gap: 32px; }
  .footer-bar { padding: 20px 28px; flex-direction: column; text-align: center; }
}
```

**Footer HTML:**

```html
<footer>
  <div class="footer-top">
    <div class="footer-brand">
      <p class="footer-name">BrightWork Realty Advocates</p>
      <p class="footer-tagline">The Smart Way to Real Estate</p>
      <a href="tel:9252006000" class="footer-phone">(925) 200-6000</a>
    </div>
    <div class="footer-programs">
      <p class="footer-col-label">Our Programs</p>
      <a href="https://offmarket.brightworkrealty.com">Off-Market Access</a>
      <a href="https://buybefore.brightworkrealty.com">Buy Before You Sell</a>
      <a href="https://quiet.brightworkrealty.com">Quiet Listing</a>
      <a href="https://relaunch.brightworkrealty.com">Relaunch Strategy</a>
      <a href="https://brightflip.brightworkrealty.com">BrightFlip</a>
      <a href="https://finaloffer.brightworkrealty.com">Final Offer</a>
      <a href="https://invest.brightworkrealty.com">Real Estate Investing</a>
      <a href="https://seniors.brightworkrealty.com">Senior Workshop</a>
    </div>
  </div>
  <div class="footer-bar">
    <p>BrightWork Realty Advocates &nbsp;&middot;&nbsp; DRE# 02014153 &nbsp;&middot;&nbsp; 455 Moraga Road, Suite I, Moraga, CA 94556</p>
    <div class="footer-bar-links">
      <a href="https://brightworkrealty.com/terms-and-conditions">Privacy Policy</a>
      <a href="https://brightworkrealty.com">BrightWork Realty</a>
    </div>
  </div>
</footer>
```

Note: on each page, omit or visually distinguish the current page's link in the footer-programs list.

---

## 10. Form Pattern — Use Exactly

```javascript
const FUB_PROXY_URL = 'https://bw-fub-proxy.scott-5f5.workers.dev';
const LEAD_TAG      = '[page-specific-tag]';   // see per-page specs
const LEAD_SOURCE   = '[Page Source String]';  // see per-page specs

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

  // PostHog identity — must fire before FUB call
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
    btnText.textContent = 'Submit';
    spinner.style.display = 'none';
  }
});
```

**FUB tags by page:**

| Page | LEAD_TAG | LEAD_SOURCE |
|---|---|---|
| offmarket | off-market-lead | Off-Market Landing Page |
| buybefore | buy-before-you-sell-lead | Buy Before You Sell Landing Page |
| quiet | quiet-listing-inquiry | Quiet Listing Landing Page |
| relaunch | relaunch-inquiry | Relaunch Strategy Page |
| brightflip | presale-improvement-inquiry | BrightFlip Landing Page |
| finaloffer | final-offer-inquiry | Final Offer Landing Page |
| invest | investment-inquiry | Real Estate Investing Page |
| seniors | senior-services-inquiry | Senior Services Page |
| seniors/workshop (active event) | workshop-registration | Workshop Registration |
| seniors/workshop (no event) | workshop-interest-list | Workshop Interest List |

If a form has a qualifying dropdown (e.g., "where are you in the process"), pass the selected value as an additional tag in the tags array.

---

## 11. Schema Templates

Include both blocks in every page `<head>`. Add the third block per program type.

### Block 1 — RealEstateAgent (identical on every page)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "BrightWork Realty Advocates",
  "url": "https://brightworkrealty.com",
  "telephone": "+19252006000",
  "email": "ben@brightworkrealty.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "455 Moraga Road, Suite I",
    "addressLocality": "Moraga",
    "addressRegion": "CA",
    "postalCode": "94556",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.835,
    "longitude": -122.13
  },
  "areaServed": ["Moraga, CA", "Lafayette, CA", "Orinda, CA", "Lamorinda", "East Bay, CA"],
  "slogan": "The Smart Way to Real Estate",
  "foundingDate": "1977",
  "employee": {
    "@type": "Person",
    "name": "Ben Olsen",
    "jobTitle": "REALTOR",
    "url": "https://brightworkrealty.com/about-us"
  }
}
</script>
```

### Block 2 — FAQPage (unique per page — must match visible FAQ HTML exactly)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text — must match visible h3 exactly]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer — plain language, 2-4 sentences, no CTAs, matches visible paragraph]"
      }
    }
  ]
}
</script>
```

### Block 3 — Service (per program page)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[Program name]",
  "provider": {
    "@type": "RealEstateAgent",
    "name": "BrightWork Realty Advocates",
    "url": "https://brightworkrealty.com"
  },
  "areaServed": "Lamorinda, CA",
  "url": "https://[subdomain].brightworkrealty.com",
  "description": "[One sentence plain-language description]"
}
</script>
```

**Additional schema by page:**

| Page | Additional schema |
|---|---|
| brightflip | HowTo — 3 steps matching the 3 improvement tiers |
| seniors (index) | RealEstateAgent + LocalBusiness, FAQPage (8 Qs), Service |
| seniors/workshop | FAQPage (6 Qs). Add Event schema when dates confirmed |

---

## 12. AEO / SEO Rules

- Page `<title>` leads with keyword, ends with brand
- One `<h1>` per page containing a natural keyword phrase
- `<link rel="canonical">` pointing to itself in every `<head>`
- FAQ section (3-5 Q&A pairs) placed before disclaimer bar on every page
- FAQ questions phrased as someone would type them into Google or ask an AI assistant
- FAQ schema and visible FAQ HTML must be identical text
- Image alt text: descriptive + local. "Lamorinda neighborhood aerial view" not "hero"
- Every page must mention: Ben Olsen, REALTOR, BrightWork Realty Advocates, and at least two of: Moraga / Lafayette / Orinda / Lamorinda
- AEO format: answer the question in the first sentence of a paragraph, then explain. Inverted pyramid. Not buried marketing copy.

---

## 13. Responsive Breakpoint

All pages break at 800px.

```css
@media (max-width: 800px) {
  :root { --page-gutter: 28px; }
  .split { grid-template-columns: 1fr; }
  .split-left { padding: 56px 28px; }
  .split-right { padding: 56px 28px; }
  .hero { min-height: max(56vh, 500px); }
  .trust-bar { gap: 24px; padding: 20px 28px; }
  .mls-bar, .disclaimer-bar { padding: 24px 28px; }
}
```

---

## 14. Per-Page Specifications

---

### PAGE 1: Off-Market Access
**Status:** EXISTS — deployed  
**URL:** https://offmarket.brightworkrealty.com  
**File:** `offmarket/index.html`

**Audience:** SF/Bay Area relocators, active buyers wanting an edge before MLS  
**One-line job:** Capture buyers who want off-market inventory before it hits Zillow  
**Nav:** No center links — urgency page  
**LEAD_TAG:** `off-market-lead`  
**LEAD_SOURCE:** `Off-Market Landing Page`

**Page title:** "Off-Market Homes in Lamorinda | BrightWork Realty Advocates"

**Hero:**
- Badge: "New Listings Available" (blinking dot)
- h1: "Find Homes Before They Hit The Market"
- Subhead: Get exclusive access to off-market properties not listed on Zillow. Skip the bidding wars and be the first to know.
- CTA: "Get Private Access" (scrolls to form)

**Trust bar items:** Private and Confidential / Instant Text Alerts / Exclusive VIP Access / Less Competition

**Split left — why off-market:**
- Privacy-First Sellers: Homeowners who want a quiet sale without open houses or public exposure
- Zero Competition: Fewer buyers means less pressure, negotiate on your own terms
- Pre-Market Head Start: Many listings available before sellers commit to a full public launch
- Instant Text Notification: The second a new property comes to us, you get a text

**Form:** First name, Last name, Email, Phone, consent checkbox  
**Form headline:** "Get Access To Our Private Listings"  
**Form subhead:** Fill out the form below and we'll text you the moment a new off-market property becomes available.  
**Submit CTA:** "Join the VIP List"

**Disclaimer bar:**  
"MLS regulations require us not to publish these listings publicly, which is why this must be a private conversation. By joining our VIP list, you gain access before anyone else, and your information is never shared with third parties."

**FAQ:**
1. What is an off-market listing in Lamorinda?
2. How do I get access to off-market homes before they hit Zillow?
3. Are off-market homes in Moraga and Lafayette available without an agent?
4. What areas does BrightWork's private buyer list cover?

**Design note:** Ben Olsen and BrightWork are not prominently featured. No agent bio. The page sells the concept of a private list, not the agent. This is deliberate for this audience.

---

### PAGE 2: Buy Before You Sell
**Status:** EXISTS — deployed  
**URL:** https://buybefore.brightworkrealty.com  
**File:** `buybefore/index.html`

**Audience:** Sellers who need to buy their next home before selling their current one  
**One-line job:** Eliminate the timing trap that forces sellers to compromise  
**Nav:** Our Team only  
**LEAD_TAG:** `buy-before-you-sell-lead`  
**LEAD_SOURCE:** `Buy Before You Sell Landing Page`

**Page title:** "Buy Before You Sell in Lamorinda | BrightWork Realty Advocates"

**Key messages:**
- The timing trap is real and it's optional
- Through programs BrightWork maintains access to, you can receive a purchase price on your current home and make a non-contingent offer on your next one
- The boosted payout when your home sells means you don't have to rush
- Do NOT name specific program providers, lenders, or dollar amounts

**FAQ:**
1. How does buy before you sell work in California?
2. What is the difference between buy before you sell and a bridge loan?
3. Can I make a non-contingent offer before selling my home in Lamorinda?
4. What happens if my current home sells for more than expected?

**Disclaimer bar:** Standard MLS and program disclaimer.

---

### PAGE 3: Quiet Listing
**Status:** EXISTS — deployed  
**URL:** https://quiet.brightworkrealty.com  
**File:** `quiet/index.html`

**Audience:** Lamorinda homeowners who want to sell privately — no open houses, no DOM counter, no public foot traffic  
**One-line job:** Convert curious sellers into a private listing conversation with Ben  
**Nav:** Our Team only  
**LEAD_TAG:** `quiet-listing-inquiry`  
**LEAD_SOURCE:** `Quiet Listing Landing Page`

**Page title:** "Quiet Listing in Lamorinda | Sell Your Home Privately | BrightWork Realty Advocates"

**Hero:**
- Badge: "Private Listings" (no blinking dot — calmer audience)
- h1 options (pick one): "Sell Your Home Without Selling It to Everyone" OR "Not Every Home Needs a Public Launch"
- Subhead: A quiet listing means your home is actively marketed to serious, qualified buyers while you stay off Zillow, off the DOM counter, and out of the neighborhood gossip loop. It's a structured strategy, not an informal arrangement.
- CTA: "Start the Conversation" (scrolls to form)

**Trust bar:** No DOM Pressure / Serious Buyers Only / Full MLS Option Always Available / Compliant with MLS Rules

**Who this is for — four seller types (body section 1):**

*The privacy-first seller:* You're not ready for a yard sign. Maybe you're a teacher, a local business owner, or someone who just doesn't want to explain to their neighbors why you're moving. A quiet listing means the people who see your home are people who are actually there to buy it.

*The previously unsold seller:* If your home sat on the market and didn't sell, the second time around doesn't have to look like that. We can reintroduce your home to a curated audience of qualified buyers without another public countdown. [Tone here is gentler than the Relaunch page — that audience arrived from direct mail; this audience arrived from search.]

*The senior or family transition seller:* Selling a home you've lived in for 25 years involves a lot of moving parts. A quiet listing reduces the chaos: fewer strangers through your home, more control over timing, a process that moves at a pace that works for your life.

*The testing-the-waters seller:* Not sure on price? Not sure on timing? A quiet listing is a low-risk way to test demand before you start the MLS clock.

**How it works (body section 2):**

Ben maintains an active list of buyers specifically looking in Lamorinda, many relocating from San Francisco and the broader Bay Area. These are people who've opted into early access because they're serious about this market. When a quiet listing comes available, they hear about it first. No public listing. No public drama. If that pool doesn't produce the right offer, you go to market better informed, with a clean slate.

Three stages: private (invitation-only, no MLS, no sign in most cases) / pre-market (coming soon signal, agent networks notified, controlled exposure) / on-market (full MLS and portal launch) if earlier stages don't produce the right result.

**Benefit section:**
- No days-on-market pressure: the MLS clock doesn't start until you decide it does
- Fewer showings, more serious buyers: no curiosity visitors, no open house tourists
- Privacy where it matters: no public listing history, your sale is your business
- A real option to pivot: if quiet doesn't produce the result, you go to market with real data and a fresh start
- One-to-one not broadcast: every buyer conversation is accurate and controlled

**Trust section:**
Ben has been in Lamorinda real estate since 2004. He grew up here, is a current member of Moraga Country Club, and knows which homes have changed hands quietly, which neighborhoods have buyers waiting. The BrightWork team has operated in Lamorinda since 1977. The private buyer list is built on relationships, not a database.

Compliance signal (include visibly): Every quiet listing is documented, structured, and conducted in full compliance with MLS rules. "Private" means selective exposure to qualified buyers, not a workaround. If you have questions about off-market seller representation and NAR's Clear Cooperation Policy, bring them up. Ben will address them directly.

**Form:**
- Headline: "Start the Quiet Conversation"
- Fields: First name, Last name, Phone, Email, Situation dropdown ("I'm just exploring" / "I want to move in the next 6 months" / "I had a listing that didn't sell"), consent
- Below form: No obligation. No listing agreement. Just a conversation about whether a quiet listing makes sense for your situation.
- Submit CTA: "Talk to Ben"

**FAQ:**
1. What is a quiet listing in real estate?
2. Do quiet listings in Lamorinda sell for less than MLS listings?
3. Is selling a home quietly legal in California?
4. How long does a quiet listing phase typically last before going to MLS?
5. What is the NAR Clear Cooperation Policy and does it affect quiet listings?

**Disclaimer bar:** "This page describes a private listing strategy conducted in full compliance with MLS rules and NAR's Clear Cooperation Policy. 'Private buyer network' refers to a curated list of qualified buyers who have opted in for early access. This is not a guarantee of sale, a specific sales price, or a commitment to any particular listing structure."

---

### PAGE 4: Relaunch Strategy
**Status:** EXISTS — deployed  
**URL:** https://relaunch.brightworkrealty.com  
**File:** `relaunch/index.html`

**Audience:** Homeowners whose listing expired with a previous agent — frustrated, skeptical, burned  
**One-line job:** QR code destination from direct mail packets. Warm continuation of a conversation already started.  
**Nav:** No center links — skeptical audience, minimal escape routes  
**LEAD_TAG:** `relaunch-inquiry`  
**LEAD_SOURCE:** `Relaunch Strategy Page`

**Critical tone note:** This page should NOT look or feel like the other BrightWork pages. The audience arriving here is skeptical and has been burned. More direct, less polished. Trust page, not a brand showcase. The person scanned a QR code from a personalized 10-page analysis packet they already received. Reference that connection without being presumptuous.

**Page title:** "Expired Listing Strategy in Lamorinda | BrightWork Realty Advocates"

**Hero:**
- No badge with blinking dot — that feels gimmicky for this audience
- h1 options (pick one): "Your Home Didn't Sell. The Plan Did." OR "Before We Talk About Relisting, Let's Talk About What Went Wrong"
- Subhead: When a listing expires, you don't just lose time. You lose confidence in the process. Ben Olsen's starting point isn't a new sign. It's an honest breakdown of what the previous listing actually missed, and a rebuilt plan that addresses it.
- CTA: "Request Your Listing Review"

**Trust bar:** Forensic Review First / No Re-List Without a New Strategy / Same Home, Different Approach / No Obligation to Proceed

**Who this is for — three types:**

*The frustrated first-timer:* You listed, you waited, it didn't sell. Every agent calling about your expired listing sounds like a variation on the same pitch: lower the price, try again. That's not a plan. That's a rerun.

*The skeptical seller:* If you're questioning whether any agent will actually do something different, you're not wrong to ask. Most won't. They'll update the photos, adjust the price, and wait for something to stick. What I do instead starts with a question most agents skip: what specifically went wrong, and why?

*The senior or long-time owner:* If you've been in your home for 20 years and it didn't sell, the emotional weight of going through it again is real. Ben's approach is built to reduce that friction, not add to it.

**The forensic review — core section:**

Section header: "We Start With the Review, Not the Agreement"

Before I ask you to sign anything, I do a forensic review of your previous listing. Five things I look at:

1. **Pricing in context** — Not just whether the number was high, but whether it was aligned with the home's condition and what comparable sales actually supported. Sometimes the price was in the right range but the presentation didn't back it up.

2. **Photography and visual storytelling** — Did the photos show someone a home they wanted to walk into, or did they just prove the home exists? Poor photography buries good homes.

3. **Listing copy and narrative** — Did the description speak to the buyers who value your home and your neighborhood? "Updated kitchen" means nothing. "Wolf range, custom cabinetry, and sightlines to the 5th fairway" means something.

4. **Portal placement and campaign execution** — Was your home featured where serious buyers actually spend their time? Zillow Showcase, which gives a listing enhanced placement on the site where most buyers start their search, makes a measurable difference. Most agents don't use it.

5. **Prep and improvement decisions** — Were you given a clear-eyed, prioritized list of what to fix? Were you given a realistic way to pay for it? There's a lot of ground between "this house needs everything" and "this house is perfect." The goal is "good enough" — meaning a buyer walks in and says "I could live here" rather than immediately pricing in six months of renovations.

**What actually changes on a relaunch:**

- New photography and video: re-shoot, not refresh
- Rewritten listing narrative: specific language built for how Lamorinda buyers actually evaluate a home
- A pricing conversation, not just a price cut: price alone rarely fixes a presentation or strategy problem
- A choice about how public to go: quiet reintroduction to Ben's private buyer network, or straight to a full MLS campaign
- Premium tools deployed properly: Zillow Showcase, 3D tours, Final Offer for competitive multi-offer situations, access to pre-sale capital programs if improvements are worth making

**Trust section:**

Ben Olsen has been in Lamorinda real estate since 2004. The BrightWork team has operated in Lamorinda since 1977. He reviews failed listings regularly — not to cold-call, but because the pattern of what goes wrong is clear after seeing enough of them, and he built a system specifically to do it differently.

**Form:**
- Headline: "Request Your Listing Review"
- Below headline: Ben will review your previous listing and come to the conversation with a specific point of view about what went wrong and what he'd do differently. You're not on a generic list.
- Fields: First name, Last name, Phone, Email, Property address, Optional open text "One thing that bothered you about your previous listing experience"
- Submit CTA: "Get My Free Review"

**FAQ:**
1. Why didn't my home sell in Lamorinda?
2. How is a relaunch different from relisting with a new agent?
3. What does a forensic listing review actually include?
4. How long should I wait after an expired listing before relisting?
5. Can expired listings in Moraga or Lafayette still sell for full market value?

**Disclaimer bar:** "Ben Olsen is a licensed REALTOR with BrightWork Realty Advocates, Brokered by Side Real Estate. Nothing on this page constitutes a guarantee of sale or a specific sale price. Results vary based on property condition, market conditions, and seller circumstances."

---

### PAGE 5: BrightFlip
**Status:** EXISTS — deployed  
**URL:** https://brightflip.brightworkrealty.com  
**File:** `brightflip/index.html`

**Program name:** BrightFlip (confirmed working name — "flip your own home")  
**Audience:** Lamorinda sellers with deferred maintenance or cosmetic issues who can't or won't fund renovation themselves  
**One-line job:** Explain the funded improvement program and generate consultations  
**Nav:** Our Team only  
**LEAD_TAG:** `presale-improvement-inquiry`  
**LEAD_SOURCE:** `BrightFlip Landing Page`

**Page title:** "Pre-Sale Home Improvements in Lamorinda | BrightFlip by BrightWork"

**Capital language rule:** Do NOT say "interest-free capital" — this is not always true. Use: "attractive terms," "multiple capital options," "structured so there are no monthly payments during the project and listing period, with repayment from your closing proceeds." Do NOT name specific lenders, program providers, or dollar maximums.

**Key positioning distinction from Compass Concierge:** Compass advances money. BrightFlip manages the work AND advances capital, makes the call on what's worth doing, and only recommends it when the numbers favor the seller.

**Hero:**
- Badge: "BrightFlip"
- h1 options: "Flip Your Own Home. Keep the Upside." OR "Stop Handing the Upside to Your Buyer"
- Subhead: Most sellers with a home that needs work face two bad options: sell as-is at a discount, or fund a renovation themselves before they're ready. Ben Olsen built a third path. Professional capital, professional project management, and a clear look at the numbers before anything starts, with nothing out of your pocket until the sale closes.
- CTA: "Get the As-Is vs. Improved Analysis"

**Trust bar:** No Money Out of Pocket Until Close / Ben Manages the Work / We Only Recommend It When the Math Works / Multiple Capital Options

**Who this is for:**

*The equity-rich seller who won't write the check:* You have significant equity in this home. You also have zero desire to spend tens of thousands before you've seen a single offer or live through a renovation while trying to pack up. That's not irrational. That's exactly the situation this program is built for.

*The as-is-or-nothing seller:* Some sellers have been told their only real option is to price for what the home is right now. That's true if you're selling on your own. It's not true if you have a capital partner and a project manager who can fix what's holding price down, and who gets paid from your proceeds instead of your bank account.

*The seller who already priced in the discount:* If you've adjusted your expectations for the home's condition, it's worth one conversation before you list. The gap between your current expectation and what the home could net after targeted improvements is often larger than sellers realize. Project buyers, who look for homes they can renovate at a discount, have already priced that upside in. They're not doing you a favor.

**How it works — three tiers:**

Intro: Not every home needs the same level of work, and not every investment makes sense. Before any project starts, we do a side-by-side: what the home realistically sells for as-is, and what it realistically sells for after a defined scope of work. If the math doesn't clearly favor the seller, we don't do the project.

*Tier 1: Cosmetic Refresh* — Paint, floors, lighting, fixtures, curb appeal, minor kitchen and bath updates. These are the high-return improvements that change how a buyer feels when they walk in. A targeted cosmetic refresh can meaningfully shift which buyer pool the home attracts — from buyers pricing in a project to buyers who are ready to move.

*Tier 2: Partial Remodel* — Kitchen refreshes, bathroom remodels, significant exterior work. Projects that change how a home competes, not just how it photographs. The decision is based on the after-renovation value and whether the net improvement to the seller's position justifies the scope. [Do not include specific dollar ranges.]

*Tier 3: Major Renovation and Partnered Projects* — For some homes the opportunity is bigger. An ADU (an accessory dwelling unit, sometimes called an in-law suite) can add living space and appraised value that justifies a more significant project. Costs are carried through the project and settled at closing. Selective and underwritten carefully. Not every home qualifies, and Ben will tell you directly if yours doesn't.

**Financial logic section:**

Header: "We Don't Recommend the Project Unless the Math Favors You"

On one side: what the home likely sells for today, as-is, to a project buyer who's pricing in the cost of the work they'll have to do. That discount is real, and it's usually larger than sellers expect.

On the other side: what the home realistically sells for after a defined scope of improvements. Not a best-case number. A realistic one, based on what comparable sales tell us about what buyers in this market will pay for a turnkey home.

Then we net it out: improvement costs, capital costs, normal transaction expenses. If the seller clearly comes out ahead, the conversation continues. If not, we don't recommend it.

**Ben manages the work section:**

Header: "You Don't Become the General Contractor"

The part most sellers dread about renovation isn't the cost. It's the management: finding contractors, getting bids, following up when timelines slip, making daily decisions about tile choices while trying to pack up a home you've lived in for 20 years. When we do a BrightFlip project, Ben's team handles project management. Contractors are vetted and coordinated. Work is scoped to what actually moves the needle on sale price. Timelines are built around the listing calendar.

**Trust:** Ben's background is unusual for a real estate agent — he entered the workforce in construction, which means he understands both the physical reality of what a project involves and when improvements create real value versus cosmetic noise. That perspective informs every recommendation. He can tell the difference between a paint and flooring refresh that shifts a home from the project-buyer pool to the turnkey-buyer pool, and an expensive renovation that doesn't move the needle.

**Form:**
- Headline: "Get the As-Is vs. Improved Analysis"
- Below headline: Ben will look at your specific home, run the comparison, and give you a straight answer about whether a pre-sale improvement strategy makes sense. No obligation to proceed.
- Fields: First name, Last name, Phone, Email, Property address, Optional "What's your biggest concern about the home's current condition?"
- Submit CTA: "See If the Numbers Work"

**FAQ:**
1. What home improvements add the most value before selling in Lamorinda?
2. How does pre-sale renovation financing work and who pays for it?
3. Who manages the contractors in a BrightFlip project?
4. What types of projects does BrightFlip cover?
5. How long does a pre-sale improvement project typically take?

**Disclaimer bar:** "BrightFlip improvement programs are subject to eligibility review and project underwriting. Terms vary by project scope and capital source. No specific return on investment is guaranteed. Do not name specific lender or program partners in this or any other visible copy on this page."

**Third schema:** Service + HowTo (3 steps = the 3 improvement tiers)

---

### PAGE 6: Final Offer
**Status:** EXISTS — deployed  
**URL:** https://finaloffer.brightworkrealty.com  
**File:** `finaloffer/index.html`

**Audience:** Sellers interviewing agents, post-consultation leave-behind, sellers who've heard of Final Offer and are researching  
**One-line job:** Own the Final Offer conversation before the platform's own site does. Ben is the advisor. Final Offer is the tool.  
**Nav:** Our Team + Properties  
**LEAD_TAG:** `final-offer-inquiry`  
**LEAD_SOURCE:** `Final Offer Landing Page`

**Page title:** "Final Offer Real Estate in Lamorinda | BrightWork Realty Advocates"

**Critical positioning rule:** Final Offer must NEVER be listed alongside baseline services like photography or Zillow Showcase. It is a selective, premium tool deployed when conditions warrant it. The page must make this clear from the first section.

**Do NOT use "auction" anywhere in copy.** Wrong associations for residential real estate.

**Platform facts (accurate as of May 2026):**
- Fully compliant in all 50 states, aligned with NAR Clear Cooperation Policy
- NAR's investment arm (Second Century Ventures) is a platform supporter
- 100% of leads route back to the listing agent (not to competing agents like Zillow)
- 120-day guarantee: if the home doesn't sell, seller gets the platform cost back
- Standard contracts still work — Final Offer manages the competitive environment, not the underlying documents
- Note: Final Offer recently merged with Purlin. Do NOT reference Purlin in copy until Ben confirms positioning.

**Ben's deployment philosophy:** He treats Final Offer as a precision instrument. Not on every listing. Deployed when a specific property and market moment justify structured competition. Explicit with sellers about when it applies and when it doesn't.

**Hero:**
- Badge: "Advanced Offer Management"
- h1 options: "What If Every Buyer Had to Show Their Hand?" OR "Structured Competition. Transparent Offers. No Guessing."
- Subhead: Most real estate offers happen in the dark. One buyer, one number, and a seller hoping something better isn't about to walk in the door. Final Offer changes that. When Ben deploys it on the right listing, every serious buyer sees the same information in real time, and the home finds its true market value instead of a negotiated one.
- CTA: "Ask If Your Home Is a Final Offer Candidate"

**Trust bar:** 100% of Leads Back to Your Listing Team / Real-Time Offer Transparency / Standard Contracts Still Work / NAR-Compliant Nationwide

**Price discovery argument:**

Standard real estate negotiations are essentially private. A buyer submits a blind offer, not knowing whether other offers exist or what they look like. The result is often a negotiated price, not a discovered one. The buyer pays what the negotiation landed on, which is often less than they would have paid if they'd known they had competition.

Final Offer removes the blind offer dynamic. Buyers who follow a listing are notified in real time when offers are made and when those offers change. That visibility creates genuine competition rather than manufactured pressure.

The "I would have paid that" problem: One of the most frustrating outcomes of a traditional sale is finding out later that another buyer would have paid more. They just didn't know the home was in play, or they got the notification too late to respond. Final Offer's alert system is designed so no motivated buyer misses the moment.

**For homes algorithms undervalue:** Some homes are hard to comp. A MCC home with a specific floor plan, a view lot, an upgraded kitchen, and club amenity access doesn't have three identical sales in the past six months. Automated valuation models undervalue these properties routinely. Structured competition through Final Offer lets the market make that case.

**The case study (feature section — confirm details with Ben if this section is revised):**

The first time Ben ran a Final Offer campaign was on a home with strong inherent appeal, limited comparable sales, and neighborhood sentiment that suggested the list price was already aggressive. Automated estimates placed the home significantly below Ben's expectations.

He listed at $3.0M, ran a structured campaign with full pre-qualification of all buyers before bidding opened. Five parties qualified. Three serious buyers emerged. As the offer window progressed, buyers responded to live activity alerts in real time, with automatic extensions ensuring everyone had a genuine chance to respond.

Final sale price: approximately $3.31 million.

After the window closed, an agent reached out to say she had tried to add another $15,000 in the final increment but entered it incorrectly in the platform. The seller had a choice: reopen bidding or honor the result the process had produced.

Ben's seller chose to honor it. "I'm going to honor the winner in the auction software. That's what I said I was going to do."

That decision is the brand. BrightWork designs processes that are worth following through on. A buyer who feels the process was fair closes without friction.

**When Ben uses Final Offer:**

Header: "This Isn't for Every Listing. Here's How Ben Decides."

Situations where it typically makes sense:
- Homes with strong, genuine multi-buyer demand: if Ben expects five or more serious parties, structured competition turns that interest into real price discovery
- Properties that algorithms undervalue: unique, over-improved, or without strong comparable sales nearby
- Relaunched listings where the narrative has changed: signals that this campaign is categorically different from the last one
- Flagship campaigns where a full marketing funnel is already running: Final Offer is the destination, not the whole strategy

Ben will tell you directly if your home isn't the right fit.

**Form:**
- Headline: "Find Out If Your Home Is a Final Offer Candidate"
- Below headline: Ben will look at your home, your market situation, and your goals, and give you a direct answer about whether Final Offer is the right approach or whether a different strategy serves you better.
- Fields: First name, Last name, Phone, Email, Property address (optional, helps Ben pull comps), "How did you hear about Final Offer?" (optional, campaign attribution)
- Submit CTA: "Ask Ben"

**FAQ:**
1. What is Final Offer in real estate?
2. How does transparent offer management benefit home sellers?
3. Does Ben Olsen use Final Offer on every listing?
4. Can I still choose not to sell if the offers aren't high enough?
5. What is the difference between Final Offer and a traditional offer review?

**Disclaimer bar:** "Final Offer is a third-party offer management platform. Ben Olsen is a certified Final Offer agent. Platform performance statistics are sourced from Final Offer and are not guaranteed results for any specific property. Results vary based on market conditions, property characteristics, and buyer demand."

---

### PAGE 7: Real Estate Investing
**Status:** EXISTS — deployed  
**URL:** https://invest.brightworkrealty.com  
**File:** `invest/index.html`

**Audience:** Lamorinda homeowners age 40-60 with significant equity, high earners who've never called themselves investors  
**One-line job:** Reframe real estate investment as something this audience is overdue for  
**Nav:** Our Team + Properties  
**LEAD_TAG:** `investment-inquiry`  
**LEAD_SOURCE:** `Real Estate Investing Page`

**Compliance — this page carries more legal risk than any other:**
- No guaranteed returns, projected net worth figures, or specific annualized percentages
- Do NOT use specific property addresses or internal example numbers ($178K / 10.7%)
- Every depreciation/deduction reference is conceptual only, followed by "consult your tax advisor"
- Ben is a REALTOR, not a financial advisor or CPA — state this visibly on the page
- Required disclaimer (visible, not just in footer): "Ben Olsen is a licensed REALTOR, not a financial advisor or CPA. Real estate investment involves risk. Nothing on this page constitutes financial, tax, or legal advice. Consult your financial and tax advisors before making investment decisions."

**Distribution note:** This page is less a cold search destination and more a distribution piece — something Ben sends to past clients and high-earning Lamorinda households. Assume a warm-ish reader who trusts Ben enough to open the link.

**Page title:** "Real Estate Investing in Lamorinda | BrightWork Realty Advocates"

**Hero:**
- Badge: "Investment Strategy"
- h1 options: "Are You Overdue for an Investment Property?" OR "Real Estate Investing for Families Who've Never Called Themselves Investors"
- Subhead: Ben Olsen has been in Lamorinda real estate since 2004. One of his most consistent observations: a lot of high-earning families in their 40s and 50s are sitting on equity, paying significant taxes, and haven't yet taken the step that their financial situation actually supports. This page is for those families.
- CTA: "Find Out If You're a Candidate"

**Trust bar:** Tax Structure Benefits / Family Housing Flexibility / Local Market Expertise Since 2004 / No Obligation Consultation

**Who this is for — "maybe I'm an investor" section:**

Most of my clients who've bought investment properties don't describe themselves as investors. They genuinely didn't grow up thinking that's what they'd do. What they did grow up doing is earning well, paying their taxes, buying a house in Lamorinda, and building a life here. And at some point, usually when their accountant pointed it out or when their oldest kid started asking about housing in the Bay Area, they started wondering whether they'd been leaving something on the table.

You might be a candidate if: your household income puts you in a high federal and state tax bracket / you've accumulated equity in your primary home but haven't deployed it elsewhere / you have adult or college-age kids who may want to live in the Bay Area / you have aging parents who might need housing options closer to you / your accountant has suggested you need more deductions.

**Why local real estate:**

There are plenty of ways to invest. Most of them are abstractions. A rental property in Moraga is something you can drive past, walk through, and understand in a way you can't understand a derivatives position. You also understand this market: which neighborhoods hold value, which school zones move demand, which floor plans in MCC sell fastest and for what.

On out-of-state cheap properties (Ben's explicit warning): the pitch for a $78,000 property in a market you've never visited is built on yield. In practice, you're managing a property in a market you don't know, with tenants you've never screened, in a city whose economic fundamentals you're guessing at. Local families who try this approach rarely stick with it.

**Four pillars:**

*1. Tax structure:* If you're paying significant income taxes each year, a properly structured rental property gives you tools your paycheck doesn't. Depreciation, a tax concept that lets you deduct a portion of the property's value annually as a paper expense even while the home is appreciating, can offset rental income. Mortgage interest on an investment property is deductible. Maintenance, repairs, property management fees reduce your taxable rental income. Ben talks through this at a conceptual level. For specifics, bring your accountant into the conversation.

*2. Long-term wealth:* Monthly cash flow is often flat or slightly negative in the early years of a Lamorinda rental. Ben is direct about this. He doesn't pretend it pencils as a pure income play from day one. The argument is in the combination: principal pay-down building equity, appreciation over time, depreciation reducing the tax bill, and eventually strong rental income. Over a 5-to-10 year horizon the picture is meaningfully different than month one. He frames this as a 50-year strategy, not a 12-month trade.

*3. Housing flexibility for your family:* A local rental isn't just an investment vehicle. It's a housing option. An adult child who wants to stay in the Bay Area can live there. Aging parents who need to be closer can live there. A stock portfolio doesn't give you any of those options. A local rental property does.

*4. A generational strategy:* Aim for one investment property per child if your financial situation supports it. The property can be sold, gifted, exchanged through a 1031, or passed on. It creates real housing optionality for the next generation in a market that is structurally difficult to enter.

**You don't have to be a landlord type:**

The version of owning a rental property most people imagine involves being personally on call for everything. That's a choice, not a requirement. Professionally managed rentals, where a property management company handles tenant placement, maintenance, and rent collection, are the standard for investors who have professional lives. Ben works with property managers he trusts in this market.

**How Ben works with first-time investors:**

Ben's starting point isn't a property search. It's a conversation about your financial picture, goals, and timeline. Questions he starts with: What does your current tax situation look like broadly? Do you have equity in your primary home that isn't working for you? What's your 5-to-10 year horizon? Do you have kids who might want to stay in the Bay Area? Parents who might need to be nearby? It's a planning conversation. If the math doesn't favor it, Ben will say so.

**Form:**
- Headline: "Find Out If You're Overdue for an Investment Property"
- Below headline: Ben will walk you through the realistic picture for your situation. No obligation. No property search before the conversation.
- Fields: First name, Last name, Phone, Email, Optional motivation dropdown (Tax reduction / Long-term wealth building / Housing options for family / All of the above / Just exploring)
- Submit CTA: "Run My Numbers With Ben"

**Required disclaimer (visible section, not just footer):**
"Ben Olsen is a licensed REALTOR, not a financial advisor or CPA. Real estate investment involves risk. Nothing on this page constitutes financial, tax, or legal advice. Consult your financial and tax advisors before making investment decisions."

**FAQ:**
1. Is Lamorinda a good place to invest in real estate?
2. What is depreciation and how does it help real estate investors?
3. What is a 1031 exchange in California?
4. Do I have to manage a rental property myself if I buy in Lamorinda?
5. How much equity do I need to buy an investment property in the East Bay?

**Disclaimer bar:** "Ben Olsen is a licensed REALTOR, not a financial advisor or CPA. Real estate investment involves risk. Past performance in any market or specific property is not indicative of future results. Nothing on this page constitutes financial, tax, or legal advice. Consult qualified financial and tax advisors before making investment decisions."

---

### PAGE 8A: Senior Real Estate Planning (Services)
**Status:** EXISTS — deployed  
**URL:** https://seniors.brightworkrealty.com  
**File:** `seniors/index.html`

**Audience A:** Senior homeowners planning their next chapter — protective of autonomy, not ready for pressure  
**Audience B:** Adult children who need a structured way to start the conversation  
**One-line job:** Permanent consultative services page and lead capture for senior real estate planning (not event registration)  
**Nav:** None — logo + phone only  
**LEAD_TAG:** `senior-services-inquiry`  
**LEAD_SOURCE:** `Senior Services Page`  
**PostHog program:** `seniors`

**Naming note:** Ben has flagged that "senior" can feel clinical. Use softer framing in headlines: "next chapter," "family transition," "long-time homeowners." Badge reads "Senior Real Estate Planning."

**Page title:** "Senior Real Estate Planning in Lamorinda | BrightWork Realty Advocates"

**Hero:**
- Badge: "Senior Real Estate Planning" (no blinking dot — calm audience)
- h1: "Real Estate Decisions That Protect Your Family"
- Subhead: Planning-before-crisis framing. Ben helps Lamorinda families get ahead of transitions on their own terms.
- CTA: "Talk to Ben" (scrolls to `#contact`)

**Section order (differs from standard split-page pattern):**
1. Who This Is For — two-column audience cards (homeowners / adult children)
2. What Makes This Complicated — five topic blocks (Prop 13, legacy home, trusts/titling, timing, tax strategies families don't know about)
3. What Ben Does — five benefit blocks (includes "keep it as a rental" scenario)
4. FAQ — static Q&A (standard project format: `faq-wrap`, bordered items, no accordion)
5. Workshop callout — toggleable via `data-active="true"|"false"` on `#workshopCallout`. Default: `false` (muted link to `/workshop`). When `true`: prominent teal callout with "See Workshop Details" button.
6. About Ben — portrait headshot (`images/ben-olsen.png`, 3:4 aspect ratio, `object-position: top`)
7. Contact form — teal background, `#contact`. Optional textarea → FUB `backgroundInformation`.

**What Makes This Complicated — block 5 (required):**
- Heading: "The Options Most Families Don't Know They Have"
- Cover: selling vs. holding, 1031 exchange, DST, step-up in basis on inheritance
- Define 1031, DST, and step-up in basis inline on first use (see glossary below)
- Every tax strategy mention must include a "consult your CPA and estate attorney" qualifier. Ben presents questions to raise with professionals, not advice.

**What Ben Does — block 5 (required):**
- Heading: "Sometimes the Right Answer Is Don't Sell"
- Cover: evaluating rental vs. sale when Prop 13 basis, embedded equity, and rental demand favor holding
- Ben may recommend keeping the home even when it means no commission. Pair any tax-event discussion with CPA/estate attorney qualifier.

**Seniors tax strategy copy rule (both PAGE 8A and 8B):**
Every mention of 1031 exchanges, DSTs, capital gains, installment sales, or similar tax strategies must be paired with a qualifier directing readers to their CPA and/or estate attorney. These are questions worth raising with qualified professionals, not advice from Ben.

**Inline glossary — define on first use per page (seniors pages):**

| Term | Inline definition (use on first appearance) |
|---|---|
| 1031 exchange | "a 1031 exchange, an IRS provision that lets you defer capital gains taxes by reinvesting the proceeds from a property sale into another qualifying investment" |
| Delaware Statutory Trust / DST | "a Delaware Statutory Trust (DST), a passive investment vehicle that qualifies as a 1031 replacement property without requiring you to manage real estate directly" |
| step-up in basis | "a step-up in basis, which resets a property's cost basis to its current market value when it transfers to heirs, potentially eliminating the embedded capital gain" |

**Form:**
- Headline: "Talk to Ben"
- Fields: First name, Last name, Email, Phone, optional "What are you thinking about?" textarea
- Submit: "Send a Message"
- Inline error alert on failure (no browser `alert()` on submit)

**FAQ (8 questions — static layout, must match FAQPage schema):**
1. When should a senior homeowner start thinking about a real estate transition?
2. What is Prop 13 and why does it matter if I'm thinking about selling?
3. What are the options for a senior homeowner who isn't sure they're ready to sell?
4. What is a legacy home and how do families typically handle it?
5. Does Ben Olsen charge for a senior real estate planning consultation?
6. What is the senior real estate planning workshop?
7. Should I sell my Lamorinda home or keep it as a rental?
8. What is a DST and how does it help seniors avoid capital gains on a home sale?

**Schema:** RealEstateAgent + LocalBusiness, FAQPage (8 Qs), Service ("Senior Real Estate Planning")

**Fonts:** Montserrat (headings, nav, buttons) + Open Sans (body, form labels). Brand tokens on this page use `--cyan: #00aedb` and `--yellow: #ffe200`.

---

### PAGE 8B: Senior Real Estate Planning Workshop
**Status:** EXISTS — deployed  
**URL:** https://seniors.brightworkrealty.com/workshop  
**File:** `seniors/workshop/index.html`

**One-line job:** Event registration when a workshop is scheduled; interest-list capture when it is not  
**Nav:** None — logo + phone only (logo path: `../images/logo.png`)  
**PostHog program:** `seniors-workshop`

**Toggle:** Set `const WORKSHOP_ACTIVE = false` at top of `<script>` block. Flip to `true` when event is confirmed and update date/venue/presenter placeholders.

| State | Hero badge | Form heading | Submit button | LEAD_TAG |
|---|---|---|---|---|
| `WORKSHOP_ACTIVE = true` | "Upcoming Event · [DATE]" | Reserve Your Spot | Reserve My Spot | workshop-registration |
| `WORKSHOP_ACTIVE = false` | Senior Real Estate Planning | Join the Interest List | Add Me to the List | workshop-interest-list |

**Always visible (both states):**
- Who the Workshop Is For — two cards (homeowners / family members)
- What Happens in 90 Minutes — four topic blocks (Taxes/Trusts block must cover 1031, DST, installment sales, step-up in basis with inline definitions on first use and CPA/estate attorney qualifier)
- Why Ben Does This — short paragraph in Ben's voice
- FAQ — static Q&A section (standard `faq-wrap` format, 6 questions, must match FAQPage schema)

**Taxes, Trusts, and Probate topic block (required expansion):**
Beyond trusts and titling, this block must cover practical options for minimizing or deferring tax on a long-held home: 1031 exchanges, DSTs, installment sales, and step-up in basis. Close with: Ben isn't the expert, your CPA and estate attorney are. Apply the seniors tax strategy copy rule from PAGE 8A.

**Toggles with `WORKSHOP_ACTIVE`:**
- Hero subhead and CTA label
- Event details block (date, venue, format, presenter names) — hidden when inactive
- Form heading, subhead, submit label, FUB tag

**Page title:** "Senior Real Estate Planning Workshop | BrightWork Realty Advocates"

**Hero h1 (both states):** "Plan the Transition Before It Plans You"

**Form:** First name, Last name, Email, Phone, consent checkbox. Teal form panel (same pattern as services page contact form).

**FAQ (6 questions — static layout, must match FAQPage schema):**
1. What is the BrightWork senior real estate planning workshop?
2. Who should attend the senior real estate planning workshop?
3. Is the workshop free?
4. What does the workshop cover?
5. Does the workshop cover options for avoiding capital gains on a home sale?
6. What is a Delaware Statutory Trust in real estate?

**Schema:** FAQPage (6 Qs). Add Event schema when dates are confirmed.

**Compliance note:** Ben is a REALTOR, not an attorney, financial advisor, or CPA. Workshop content is educational — position tax/trust/estate topics as "questions to ask your advisors."

**Workshop page scope note:** The deployed workshop page uses a simplified form (core contact fields only). These original spec items were deferred in v1: trust bar, qualifying dropdowns (Homeowner / Adult child), attendee count field, visible disclaimer bar.

---

## 15. Ben Olsen — Voice and Copy Standards

**Who he is:** Founder of BrightWork Realty Advocates. REALTOR since 2004. Grew up in Lamorinda, current Moraga Country Club member. Economics degree, brief Silicon Valley career before real estate. Entered the workforce in construction. The BrightWork team has operated in Lamorinda since 1977.

**Voice:** Plain-spoken expert. Warm and direct. Thinks out loud. Not flowery, not corporate. Uses contractions. Prefers simple verbs. Calm authority, not salesmanship.

**Reasoning pattern:** Start with context. Imply the key questions. Lay out options with tradeoffs. Use specific examples. Make a recommendation with rationale. End with a low-pressure next step.

**Allowed:** Gentle self-deprecation that never questions his competence. Light observational humor. Mild self-awareness ("I've been around this business long enough to know...").

**Not allowed:** Hype words. Over-the-top sales language. Anything implying incompetence, laziness, or inattention. Edgy or dark humor. References to his mother as a primary credential.

**Phrases to reinforce:**
- "The Smart Way to Real Estate"
- "Our minimum standard is another agent's premium package"
- "We don't just list. We diagnose, design, and execute a strategy."
- "Diagnose. Design. Execute. Advocate."
- "We find the problems before buyers do"
- "No surprises. No second negotiations."

**Terms to define on first use (per page, in context, naturally):**

| Term | How to define it |
|---|---|
| DOM / days on market | "the public counter tracking how long a home has been listed for sale" |
| MLS | "the Multiple Listing Service that feeds Zillow, Redfin, and most real estate portals" |
| Comparable / comp | "what similar homes in your neighborhood actually sold for" |
| Contingency | "a condition a buyer attaches to their offer, typically requiring a satisfactory inspection or confirmed financing before they're legally committed" |
| Depreciation | "a tax concept that lets you deduct a portion of the property's value each year as a paper expense, even while the home is likely appreciating" |
| 1031 exchange | "an IRS provision that lets you defer capital gains taxes when you sell one investment property and reinvest the proceeds into another" (invest page). On seniors pages, use the longer inline form from PAGE 8A glossary table. |
| Delaware Statutory Trust / DST | "a passive real estate investment vehicle that qualifies as a 1031 exchange replacement property, used when a seller wants tax deferral without managing another physical property" |
| step-up in basis | "a tax concept that resets the cost basis of an inherited property to its fair market value at inheritance, which can reduce capital gains if the home is later sold" |
| Prop 13 | "California's Proposition 13, which caps property tax increases for long-term homeowners" |

---

## 16. New Page Checklist

When building any new page in this repo:

- [ ] Create `[pagename]/index.html` and `[pagename]/images/`
- [ ] Copy `shared/logo.png` to `[pagename]/images/logo.png`; use `images/logo.png` in nav and footer
- [ ] Include HTTPS redirect snippet in `<head>`
- [ ] Add `<script src="../shared/posthog-init.js"></script>` before `</head>`
- [ ] Set `<link rel="canonical">` to the page's full URL
- [ ] Page `<title>` leads with keyword phrase
- [ ] Set correct `LEAD_TAG` and `LEAD_SOURCE` constants
- [ ] Include `posthog.identify()` and `posthog.capture()` in form handler
- [ ] Include RealEstateAgent schema JSON-LD
- [ ] Include FAQPage schema JSON-LD matching the visible FAQ section
- [ ] Include Service schema JSON-LD
- [ ] Add HowTo or Event schema if applicable per page spec
- [ ] Include visible FAQ section (3-5 Q&A pairs) before disclaimer bar
- [ ] Include consent checkbox linking to `https://brightworkrealty.com/terms-and-conditions`
- [ ] Include disclaimer bar before footer
- [ ] Use universal footer HTML and CSS (Section 9)
- [ ] No em dashes anywhere in copy
- [ ] No mention of Side Real Estate in client-facing copy
- [ ] Address uses Suite I (letter), not Suite 1 (numeral)
- [ ] Ben's title is REALTOR not Broker
- [ ] No hype words (see Section 2)
- [ ] `:root` includes `--teal: #005d7a`; dark sections use `var(--teal)`, not `var(--navy)` or `#1e2d3d`
- [ ] `theme-color` meta is `#005d7a`; labels on teal backgrounds use `--yellow`
- [ ] Add `[pagename]/wrangler.toml` and `[pagename]/.assetsignore` (exclude `node_modules/`, `package.json`, `package-lock.json`, `.wrangler/`)
- [ ] Include `<script src="../shared/animations.js"></script>` before `</body>` (standard on program pages; seniors/workshop omits it)
- [ ] Add the page to the deploy workflow matrix in `.github/workflows/deploy.yml`
- [ ] Add CNAME DNS record for new subdomain on `brightworkrealty.com` zone

---

## 17. Updating Existing Pages

All program landing pages are live. Use this section when making copy, design, or integration changes to any deployed page.

**Before editing:** Read the per-page spec in Section 14 and match patterns from a reference page (`offmarket/index.html` or `buybefore/index.html`).

**Consistency checks after changes:**
- `grep -r "LEAD_TAG\|LEAD_SOURCE\|Suite" */index.html`
- FAQ schema JSON-LD matches visible FAQ HTML exactly
- Universal footer (Section 9) lists all program links with the current page omitted or de-emphasized
- Form submit fires `posthog.identify()` before the FUB proxy fetch
- No em dashes, no Side RE in client-facing copy, Suite I (letter) not Suite 1 (numeral)

**Deploy:** Push to `main`. GitHub Actions deploys all pages in the workflow matrix automatically.

---

*Handbook maintained by MKTNG.co — questions to scott@mktng.co*
