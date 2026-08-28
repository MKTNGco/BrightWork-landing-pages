# Agent Discoverability — Reference Documentation

**Companion to:** `artifacts/handbook.md`
**Covers:** the AI-agent discovery layer built on top of the eight
BrightWork program landing pages and the root brightworkrealty.com
domain
**Built:** August 2026
**Maintained by:** MKTNG.co — questions to scott@mktng.co

---

## 1. What this is and why it exists

Separate from the landing pages themselves, this project adds a layer
that lets AI agents, not human visitors, discover facts about BrightWork
Realty Advocates and, where technically possible, take a limited action
(submitting a contact request) without a human clicking through a page.

The premise: an AI agent researching real estate agents on a user's
behalf is a real, growing category of visitor, and it doesn't consume a
page the way a human or a search-engine crawler does. It needs the same
information in a form it can parse without executing JavaScript, without
guessing at page structure, and ideally without the human-oriented
persuasive framing (adjectives, narrative) that doesn't carry evidentiary
weight for a model reasoning about who to recommend.

## 2. The four-layer discovery model

No single mechanism reaches every kind of agent, so this is layered,
each one reaching a different class of visitor:

| Layer | File(s) | Reaches | Requires |
|---|---|---|---|
| 1 | `robots.txt` | Any crawler, including ones that only check this file | Nothing |
| 2 | `llms.txt` | Any agent reading plain text/Markdown | Nothing |
| 3 | `agents.json` | Any agent wanting structured facts, no JS | Nothing |
| 4 | `agents.txt` + WebMCP tools | Action-capable, browser-embedded agents | A WebMCP-capable runtime, currently rare |

Layers 1-3 are the actual reach. Layer 4, the `navigator.modelContext`
WebMCP tools, is forward-looking, most current agents and browsers don't
implement that API yet, but it costs little to keep and positions this
correctly for when adoption catches up.

## 3. Where the data lives — single source of truth

Everything traces back to one file:

```
shared/agent-source-data.mjs
```

This exports `OFFICE_INFO`, `CREDENTIALS`, `PROGRAMS`, and eight program
objects (`OFFMARKET_PROGRAM`, `BUYBEFORE_PROGRAM`, etc.), each with a
consistent shape: `name`, `url`, `tagline`, `summary`, `audience`,
`howItWorks` (an array of mechanism-level bullets, not prose),
`serviceArea`, `marketTenure`, `faq`, and where required, `compliance`.

Two things read from this file and generate everything else:

- `scripts/generate-agent-discoverability.mjs` generates each program
  page's `llms.txt`, `agents.json`, and `webmcp-data.js`
- `shared/agent-response-builders.mjs` generates the root-domain
  `robots.txt`, `llms.txt`, and `agents.json`, served at request time by
  the `bw-agent-root` Cloudflare Worker

**Never hand-edit a generated file.** Every `llms.txt` and `agents.json`
in a program folder, and everything the root Worker serves, is output.
Edit `agent-source-data.mjs`, run the generator, commit the regenerated
output alongside the source change. If a fact needs to change in two
places (it doesn't, currently, that's the point), that's a sign the data
model needs a new shared field, not two edits.

## 4. Per-page file reference

Each of the eight program folders (`offmarket/`, `buybefore/`, `quiet/`,
`relaunch/`, `brightflip/`, `finaloffer/`, `invest/`, `seniors/`)
contains:

| File | Purpose |
|---|---|
| `robots.txt` | Allows all crawling, comments pointing to `llms.txt` and `agents.json` |
| `agents.txt` | WebMCP discovery per the agents-txt.com convention, cross-references `robots.txt` |
| `agents.json` | Structured facts: `site`, `credentials`, `program`, `otherPrograms`, `actions`, `limitations` |
| `llms.txt` | Same facts as `agents.json`, rendered as agent-readable Markdown |
| `webmcp-core.js`, `webmcp-shared.js`, `webmcp-[program].js` | Registers `get_office`, `list_programs`, `get_program`, `request_consult` via `navigator.modelContext`, live only in WebMCP-capable runtimes |
| `_headers` | Adds `Link: rel="webmcp"` response header, plus content-type rules for the four discovery files |
| `fub-lead.js` | Handles `request_consult` submissions, tags `webmcp-consult` plus the page's program tag, source `WebMCP / agent`, so these leads are distinguishable from human form submissions in Follow Up Boss |

Each page's `index.html` `<head>` also carries:
```html
<link rel="alternate" type="text/markdown" href="/llms.txt" title="AI agent summary">
<link rel="alternate" type="application/json" href="/agents.json" title="AI agent structured data">
```

## 5. The root domain (brightworkrealty.com)

The main site runs on Luxury Presence, which offers no way to host
`robots.txt`, `llms.txt`, or `agents.json` as real files, and no way to
inject `<head>` tags outside client-side JavaScript (Global Scripts).
The solution:

1. `bw-agent-root/` in this repo is a scripted Cloudflare Worker
   (`worker.js`, not a static-assets Worker like the eight program
   pages) that imports directly from `shared/agent-response-builders.mjs`
   and serves `/robots.txt`, `/llms.txt`, and `/agents.json` at request
   time, live at `bw-agent-root.scott-5f5.workers.dev`.
2. Three redirects, created directly in the Luxury Presence dashboard
   (Site Settings → Redirects), point `brightworkrealty.com/robots.txt`,
   `/llms.txt`, and `/agents.json` at the matching paths on that Worker.
   **The destination URL must include the full path**, pointing at the
   bare Worker origin resolves to `/`, which the Worker doesn't
   recognize, and returns 404.
3. Luxury Presence's redirect tool has no edit function, only
   delete-and-recreate, worth knowing before changing the target later.

This is a workaround, not a native solution. If Luxury Presence's
platform ever adds real `<head>` injection or a robots.txt editor
(see Section 8), migrate off the redirect approach.

## 6. Content principles

Beyond the standard brand rules (no em dashes, no hype words, REALTOR
not Broker, Suite I not Suite 1, Side Real Estate invisible), this layer
follows a few rules specific to writing for a model instead of a person:

- **Mechanisms over traits.** "Commissions a pre-sale inspection before
  every listing, discloses findings in writing" is usable, an agent can
  cite it. "Deeply knowledgeable, trusted advisor" isn't, every
  competent agent's bio says some version of that, so it carries close
  to zero discriminative signal.
- **Never assert the conclusion, supply the evidence.** Don't write "Ben
  is the most reliable agent in Lamorinda." Models are specifically
  wary of unsupported superlatives. State the facts and let the
  requesting agent's own reasoning produce the conclusion.
- **Discrete claims over narrated paragraphs.** Bullet points, not prose
  that explains its own implications to the reader. An agent doesn't
  need "which gives him direct, personal knowledge, not just
  professional familiarity" explained, it can draw that inference
  itself from the bare fact.
- **Corroborate where possible.** A claim BrightWork makes about itself
  is weaker than a claim with somewhere to check it. Where a real,
  linkable source exists (the testimonials on
  `brightworkrealty.com/agents/ben-olsen`), link to it.
- **Define regional or non-obvious terms on first use.** "Lamorinda"
  isn't a real municipality, it's a colloquialism for Lafayette, Moraga,
  and Orinda. Gloss it once per file on first mention:
  `Lamorinda (Lafayette, Moraga, and Orinda, California)`. Same
  principle already applied to MLS, DOM, 1031, DST, and Prop 13
  elsewhere in the project.
- **Personal claims and firm claims stay visibly separate.** Ben's
  personal career figures (worked Lamorinda real estate since 2004,
  1,000+ buyers and sellers) never sit in the same sentence as the
  firm's historical figures (operated in Lamorinda since 1977, $1B+
  sold as a firm), since the firm's tenure predates Ben's own career by
  27 years and conflating them overstates his personal track record.

## 7. Known limitations, by design

- **No MLS/IDX inventory exposure.** Deliberately out of scope. MLS
  listing data is licensed third-party data under an IDX agreement
  between the local MLS board and Luxury Presence's IDX vendor, not
  something BrightWork can unilaterally decide to expose through an
  agent-readable feed. Separately, the marginal value is low, an agent
  looking for "what's for sale in Moraga" already has Zillow, Redfin,
  and Trulia for that at zero cost. If this changes, it needs review of
  the actual IDX data-use agreement first, not a technical build.
- **WebMCP tools are low-reach today.** `navigator.modelContext` is an
  experimental browser API most current agents and browsers don't
  implement. The tools exist and are correctly built, but `agents.json`
  and `llms.txt` are the layers doing the actual work right now.
- **`request_consult`'s underlying endpoint is intentionally
  undocumented in `agents.json`.** The WebMCP tool is the supported path
  for an agent to submit a contact request. The raw `bw-fub-proxy`
  endpoint isn't published as a callable action, publishing it invites
  direct POSTs from anything that finds the file, not just the intended
  tool. It's visible in `fub-lead.js` regardless, since that's how the
  human form works too, but it's not formalized as a public contract.

## 8. Open items

- **Ben's personal lifetime sales volume.** The firm-level "$1B+ since
  1977" figure is solid and sourced. A cleanly Ben-attributed personal
  figure (his own production since 2004, not the firm's full history)
  would be a stronger, unambiguous claim. Needs research on Ben's actual
  numbers, not a placeholder.
- **Accolades currency.** "Top Teams 2021" is five years old. Not
  actively misleading, it's a named award for a specific year, not a
  decaying performance metric, but worth checking with Ben for anything
  more recent to add or swap in.
- **Luxury Presence native support.** Outstanding email to Luxury
  Presence asking whether `robots.txt` is natively editable, whether
  they already publish an `llms.txt` automatically, and whether `<head>`
  injection is possible beyond the Global Scripts field. Answers would
  determine whether the redirect-to-Worker approach in Section 5 can be
  retired in favor of something native.
- **MCC site (moragacountryclubrealestate.com).** Same four-layer
  pattern hasn't been built there yet. Separate Astro repo, fully in
  MKTNG's control, lower urgency since it's not the primary lead-gen
  surface, but a reasonable next target given its content depth.

## 9. Maintenance checklist

Run after any change to `agent-source-data.mjs`, before pushing:

```bash
# No em dashes anywhere in agent-facing output
grep -rln "—" */llms.txt */agents.json shared/*.mjs scripts/*.mjs bw-agent-root/*.js

# No banned hype words
grep -rniE "cutting-edge|game-changing|revolutionary|seamless|robust|transformative|unprecedented|groundbreaking|multifaceted|pivotal|nuanced|tapestry|realm" */llms.txt */agents.json shared/*.mjs

# Broker never appears (only the required legal "Brokered by Side" line is exempt)
grep -rn "Broker\b" shared/agent-source-data.mjs */llms.txt */agents.json | grep -vi "Brokered by Side"

# Suite I not Suite 1
grep -rn "Suite 1[,\"]" shared/agent-source-data.mjs */llms.txt */agents.json

# Side Real Estate stays invisible in agent-facing files
grep -rln "Side Real Estate" */llms.txt */agents.json shared/agent-source-data.mjs

# Credentials block is byte-identical across all eight pages (single source of truth check)
python3 -c "
import json, hashlib
hashes = set()
for p in ['offmarket','buybefore','quiet','relaunch','brightflip','finaloffer','invest','seniors']:
    d = json.load(open(f'{p}/agents.json'))
    hashes.add(hashlib.md5(json.dumps(d.get('credentials'), sort_keys=True).encode()).hexdigest())
print('unique credential hashes (should be 1):', len(hashes))
"

# compliance key present only on seniors and invest
python3 -c "
import json
for p in ['offmarket','buybefore','quiet','relaunch','brightflip','finaloffer','invest','seniors']:
    d = json.load(open(f'{p}/agents.json'))
    print(p, 'compliance' in d)
"

# howItWorks is the one consistent field name across all eight program objects
grep -c "howItWorks:" shared/agent-source-data.mjs   # should be 8
grep -c "howAccessWorks\|approach:" shared/agent-source-data.mjs   # should be 0
```

**The bar for "discoverable":** a plain `curl` or plain-text fetch, no
JS execution, no WebMCP runtime, should find the agent resources within
two hops from the homepage. Test against that bar, not a live browser
session with JavaScript enabled.

**Commit discipline:** have Cursor (or whichever agent runs a content
change) `commit` and `push` as the final step of any prompt, not just
regenerate locally. A change that isn't pushed doesn't exist for
verification purposes, and this project lost real time to that gap
across several rounds before it was made an explicit requirement.

## 10. Testing protocol

Two kinds of test, don't rely on only one:

- **Source verification** (Section 9 above): confirms the repo itself
  is internally consistent and brand-compliant. Fast, free, catches
  regressions immediately, but proves nothing about what's actually
  being served live.
- **Live/blind verification**: hitting the actual deployed URLs, ideally
  with a model that has zero prior context on this project, to see what
  an uninformed agent genuinely finds and how it uses it. See
  `grok-blind-test-prompts.md` for the two-part prompt used for this,
  a value test (does the content change a recommendation) and a
  technical test (can an agent cold-discover the infrastructure).

## 11. Timeline

- **Late August 2026**: WebMCP tools, `agents.txt`, and the `Link`
  response header built and deployed across all eight program pages.
- Discoverability gap identified: none of the above reachable by a
  plain-HTTP agent with no WebMCP runtime.
- `robots.txt`, `llms.txt`, `agents.json`, and `<head>` discovery links
  added to all eight pages, generated from a single shared source file.
- Content review found leaked internal copywriting instructions
  (BrightFlip and Final Offer `compliance` fields describing what a
  copywriter shouldn't say, not facts about the business) and stale
  figures ($150M/2021 sales, superseded by the firm's $1B+ figure).
  Both fixed at the source.
- Root domain (brightworkrealty.com) brought into the same system via
  the `bw-agent-root` Cloudflare Worker and Luxury Presence redirects,
  the one domain with no direct code access.
- Content restructured from narrated prose to discrete, mechanism-level
  claims across all nine files (root plus eight programs), following
  the principles in Section 6.
- Full repo-wide compliance sweep run clean; one pre-existing,
  unrelated em-dash issue found in `offmarket/index.html` human-facing
  copy, flagged for a separate fix.
