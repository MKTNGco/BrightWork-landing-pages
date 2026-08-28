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

This exports `AGENT_PROTOCOL_VERSION` (currently `1.1`, one shared
constant, used identically by every generated surface, root and all
eight program pages, do not let this drift into per-surface hardcoded
values again, that happened once already and an external blind test
caught it), `OFFICE_INFO`, `CREDENTIALS`, `PROGRAMS`, and eight program
objects (`OFFMARKET_PROGRAM`, `BUYBEFORE_PROGRAM`, etc.).

**`CREDENTIALS` shape** (this is the part that changed most since the
original build, don't reference an older version of this doc or any
memory of the original `trackRecord`/`localAuthority`/`background`
fields, they no longer exist):

```js
CREDENTIALS = {
  bio: [ /* six discrete, agent-legible claims: licensure, local
           residency + club membership, construction background,
           education + prior career, recognition, certifications */ ],
  specialtyAreas: [ /* seven short phrases, one per program area,
                        root file only, not duplicated on program
                        pages where it would repeat the "other
                        programs" list already there */ ],
  personalTrackRecord: /* Ben's own career figure, career-scoped,
                           does not include pre-2004 firm history */,
  reviewsUrl: /* link to the one page with real third-party
                 corroboration, brightworkrealty.com/agents/ben-olsen */,
  firmTrackRecord: /* the firm's $1B+ since-1977 figure, kept
                       structurally separate from Ben's personal
                       figure so the two never conflate in the same
                       sentence */,
  differentiator: /* the pre-sale inspection/full-disclosure
                      mechanism, the single strongest evidence-based
                      claim in the whole dataset */
}
```

Each program object has a consistent shape: `name`, `url`, `tagline`,
`summary`, `audience`, `howItWorks` (an array of mechanism-level
bullets, the single field name used identically across all eight
objects now, do not reintroduce `howAccessWorks` or `approach` as
program-specific variants, that inconsistency existed once and was
caught by the same external test that caught the protocol version
drift), `serviceArea`, `marketTenure`, `faq`, and where required,
`compliance`.

Two things read from this file and generate everything else:

- `scripts/generate-agent-discoverability.mjs` generates each program
  page's `llms.txt`, `agents.json`, and `webmcp-data.js`, and renders
  `bio` and `howItWorks` as bulleted lists, not narrated paragraphs.
- `shared/agent-response-builders.mjs` generates the root-domain
  `robots.txt`, `llms.txt`, and `agents.json`, served at request time by
  the `bw-agent-root` Cloudflare Worker.

**Never hand-edit a generated file.** Every `llms.txt` and `agents.json`
in a program folder, and everything the root Worker serves, is output.
Edit `agent-source-data.mjs`, run the generator, commit the regenerated
output alongside the source change.

## 4. Per-page file reference

Each of the eight program folders (`offmarket/`, `buybefore/`, `quiet/`,
`relaunch/`, `brightflip/`, `finaloffer/`, `invest/`, `seniors/`)
contains:

| File | Purpose |
|---|---|
| `robots.txt` | Allows all crawling, comments pointing to `llms.txt` and `agents.json` |
| `agents.txt` | WebMCP discovery per the agents-txt.com convention, cross-references `robots.txt` |
| `agents.json` | Structured facts: `site`, `credentials`, `program`, `otherPrograms`, `actions`, `limitations` |
| `llms.txt` | Same facts as `agents.json`, rendered as agent-readable Markdown, including `bio`, `specialtyAreas` (root only), and per-page `howItWorks` bullets |
| `webmcp-core.js`, `webmcp-shared.js`, `webmcp-[program].js` | Registers `get_office`, `list_programs`, `get_program`, `request_consult` via `navigator.modelContext`, live only in WebMCP-capable runtimes |
| `_headers` | Adds `Link: rel="webmcp"` response header, plus content-type rules for the four discovery files |
| `fub-lead.js` | Handles `request_consult` submissions, tags `webmcp-consult` plus the page's program tag, source `WebMCP / agent`, so these leads are distinguishable from human form submissions in Follow Up Boss |

Each page's `index.html` `<head>` also carries:
```html
<link rel="alternate" type="text/markdown" href="/llms.txt" title="AI agent summary">
<link rel="alternate" type="application/json" href="/agents.json" title="AI agent structured data">
```

## 5. The root domain (brightworkrealty.com)

**Zone ownership:** MKTNG owns the full `brightworkrealty.com`
Cloudflare zone (taken over from Side because of the volume of
agent-discoverability work on this domain). This means real DNS control
and the ability to add Worker Routes directly, not just on the eight
program subdomains. What Luxury Presence still exclusively controls is
the CMS content itself, page copy, templates, and the Global Scripts
field, served from their own origin.

**What actually works today:** `robots.txt`, `llms.txt`, and
`agents.json` at the apex are served via a **redirect**, not a direct
Worker Route:

1. `bw-agent-root/` in this repo is a scripted Cloudflare Worker
   (`worker.js`, not a static-assets Worker like the eight program
   pages) that imports directly from `shared/agent-response-builders.mjs`
   and serves the three files at request time, live at
   `bw-agent-root.scott-5f5.workers.dev`.
2. Three redirects, created directly in the Luxury Presence dashboard
   (Site Settings → Redirects), point `brightworkrealty.com/robots.txt`,
   `/llms.txt`, and `/agents.json` at the matching paths on that Worker.
   **The destination URL must include the full path**, pointing at the
   bare Worker origin resolves to `/`, which the Worker doesn't
   recognize, and returns 404.
3. Luxury Presence's redirect tool has no edit function, only
   delete-and-recreate.

**Why this isn't a direct Worker Route, confirmed, not assumed:** apex
and `www` are a CNAME to `production.luxuryproxy.net`, itself proxied
through Luxury Presence's own Cloudflare-for-SaaS setup. Worker Routes
on this zone never see that traffic, it's intercepted at Luxury
Presence's edge first. This was tested directly: a Worker Route was
bound to the three apex paths, deployed successfully, and apex traffic
still hit Luxury Presence's 301 redirect chain instead of the Worker.
`mcp.brightworkrealty.com` works with a direct Worker Route because it's
a plain proxied record in this zone, not chained through another
platform's SaaS setup. The one theoretical path to a real on-origin 200
at apex is flipping apex/`www` to Orange-to-Orange proxying so this
zone's Workers run before Luxury Presence's edge. **Deliberately not
done.** That's a proxy-status change on the domain serving Ben's entire
live public site, not just three paths, and the risk isn't proportionate
to removing one redirect hop. Current recommendation: keep the redirect
approach indefinitely unless a stronger reason than convenience appears.

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
- **Discrete claims over narrated paragraphs.** This is the single
  biggest content change made after the original build: `CREDENTIALS`
  went from three prose fields to a `bio` array of short, standalone
  claims. An agent doesn't need "which gives him direct, personal
  knowledge, not just professional familiarity" explained, it can draw
  that inference itself from the bare fact.
- **Corroborate where possible.** A claim BrightWork makes about itself
  is weaker than a claim with somewhere to check it. `reviewsUrl` points
  at the one page with real third-party testimonials for exactly this
  reason.
- **Define regional or non-obvious terms on first use.** "Lamorinda"
  isn't a real municipality, it's a colloquialism for Lafayette, Moraga,
  and Orinda. Glossed once per file on first mention, via a single
  shared constant, not hand-typed per file (that would drift).
- **Personal claims and firm claims stay structurally separate, never
  in the same sentence.** `personalTrackRecord` and `firmTrackRecord`
  are two different fields specifically so Ben's own career figures
  never get conflated with the firm's 1977-onward history, which
  predates his own career by 27 years.
- **Positioning constraints get written as facts, not rules.** Early in
  this project, BrightFlip's and Final Offer's `compliance` fields
  contained literal copywriter instructions ("Do not use the word
  auction," "Do not promise interest-free capital") instead of facts an
  agent could use. That's a real failure mode, worth watching for
  generally: a constraint on what NOT to say should get rewritten as a
  positioning statement that satisfies the same constraint by simply
  never introducing the thing being avoided, not exposed as a raw
  instruction.

## 7. Known limitations, by design

- **No MLS/IDX inventory exposure.** Deliberately out of scope. MLS
  listing data is licensed third-party data under an IDX agreement
  between the local MLS board and Luxury Presence's IDX vendor, not
  something BrightWork can unilaterally decide to expose. Marginal value
  is also low, Zillow/Redfin/Trulia already answer "what's for sale in
  Moraga" at zero cost to the requester.
- **WebMCP tools are low-reach today.** `navigator.modelContext` is an
  experimental browser API most current agents and browsers don't
  implement. `agents.json` and `llms.txt` are the layers doing the
  actual work right now.
- **`request_consult`'s underlying endpoint is intentionally
  undocumented as a callable action in `agents.json`.** The WebMCP tool
  is the supported path. The raw `bw-fub-proxy` endpoint isn't published
  as a public contract, though it's visible in `fub-lead.js` regardless,
  since that's how the human form works too.

## 8. A hostname is not free just because nothing renders there

This is the most expensive lesson of the whole project and belongs in
its own section, not buried in a changelog. `mcp.brightworkrealty.com`
looked unclaimed, a plain 404, no visible content, elevated AI-crawler
traffic in Cloudflare's dashboard. It was not unclaimed. It's a real,
actively-used MCP server on the COS droplet (a separate system, separate
project), reachable via a Cloudflare Tunnel that happened to route
through this same zone. A diagnostic Worker was bound to that hostname
to log probe traffic, which silently intercepted every real request to
that server, including legitimate operator use, until the mistake was
caught via a full DNS zone export and reversed.

**Before binding any new hostname on this domain, export the actual DNS
records and check what's already there.** A 404 response proves nothing
about whether a hostname is free, it can mean "nothing here" or it can
mean "something here that doesn't answer the way you're probing it."
This applies beyond this project: any future subdomain work on
`brightworkrealty.com`, or any domain where MKTNG shares zone ownership
across multiple systems, should start with a DNS export, not an
assumption.

## 9. Open items

- **Ben's personal lifetime sales volume.** `firmTrackRecord` ($1B+
  since 1977) is solid and firm-scoped. A cleanly Ben-attributed
  personal figure, his own production since 2004, would be a stronger,
  unambiguous claim for `personalTrackRecord`. Needs research on Ben's
  actual numbers, not a placeholder.
- **Accolades currency.** "Top Teams 2021" is five years old. Not
  actively misleading, it's a named award for a specific year, not a
  decaying performance metric, but worth checking with Ben for anything
  more recent to add or swap in.
- **Luxury Presence native support.** Outstanding email to Luxury
  Presence asking whether `robots.txt` is natively editable, whether
  they already publish an `llms.txt` automatically, and whether `<head>`
  injection is possible beyond the Global Scripts field. Given what's
  now confirmed in Section 5 about the apex CNAME chain, a "yes" from
  Luxury Presence is the only realistic path to retiring the redirect
  workaround, an internal Worker Route can't do it regardless.
- **MCC site (moragacountryclubrealestate.com).** Same four-layer
  pattern hasn't been built there yet. Separate Astro repo, fully in
  MKTNG's control, no CMS constraint to work around this time. See the
  separate implementation blueprint for what should transfer directly
  versus what needs its own pass.

## 10. Maintenance checklist

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

# protocolVersion is one shared constant, not hardcoded per surface
grep -rn "protocolVersion" */agents.json shared/agent-response-builders.mjs
# every result should show the same version

# instruction-shaped language never leaked into compliance/positioning fields
grep -n "Do not\|do not\|never say\|avoid the word\|do not name\|do not promise" shared/agent-source-data.mjs
# any hit outside seniors/invest's legitimate disclaimers should be rewritten as a fact
```

**The bar for "discoverable":** a plain `curl` or plain-text fetch, no
JS execution, no WebMCP runtime, should find the agent resources within
two hops from the homepage. Test against that bar, not a live browser
session with JavaScript enabled.

**Commit discipline:** have Cursor (or whichever agent runs a content
change) `commit` and `push` as the final step of any prompt. A change
that isn't pushed doesn't exist for verification purposes. This project
lost real time to that gap across several rounds before it was made an
explicit, standard requirement.

**Route removal isn't reliable from the config file alone.** Removing a
`[[routes]]` block from `wrangler.toml` and redeploying does not
guarantee Cloudflare's zone-level route table actually drops the
binding. Confirmed directly: after the `mcp.brightworkrealty.com`
incident, the route was still live post-redeploy and had to be deleted
manually via the Cloudflare API. Any future route removal should verify
against the actual zone route list, not just the file.

## 11. Testing protocol

Two kinds of test, don't rely on only one:

- **Source verification**: confirms the repo itself is internally
  consistent and brand-compliant. Fast, free, catches regressions
  immediately, but proves nothing about what's actually being served
  live, or what already exists at a hostname before you touch it.
- **Live/blind verification**: hitting the actual deployed URLs, ideally
  with a model that has zero prior context on this project, to see what
  an uninformed agent genuinely finds and how it uses it. This caught
  two real bugs a source-only review missed entirely: the `robots.txt`
  em-dash/protocol-version-style drift, and, more importantly, confirmed
  the Cloudflare AI Crawl Control panel numbers were worth taking
  seriously as real signal, which is what led to discovering
  `mcp.brightworkrealty.com` was already in use in the first place.

## 12. Timeline

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
- Root domain brought into the same system via the `bw-agent-root`
  Cloudflare Worker and Luxury Presence redirects.
- Content restructured from narrated prose to discrete, mechanism-level
  claims across all nine files, `CREDENTIALS` rebuilt as `bio`/
  `specialtyAreas`/`personalTrackRecord`/`firmTrackRecord`.
- Full repo-wide compliance sweep run clean. One pre-existing,
  unrelated em-dash issue found in `offmarket/index.html` human-facing
  copy; later fixed.
- Independent blind test (a model with zero prior context on this
  project) confirmed the content strategy works, cited specific
  mechanisms unprompted, correctly separated firm and personal claims,
  and separately surfaced a real `protocolVersion` mismatch (`1.1` root
  vs `1.0` program pages) that source review alone had missed. Fixed by
  moving the version to one shared constant.
- Confirmed via Cloudflare's AI Crawl Control that no AI crawlers were
  actually blocked, the "two stacked robots.txt policies" the blind test
  flagged was Cloudflare's Managed Robots.txt feature (opts training
  crawlers out, leaves live-query assistants reachable), a deliberate
  default, not a bug.
- Sustained request volume discovered at `mcp.brightworkrealty.com`. A
  diagnostic Worker was built and bound there to log probe traffic.
- Full DNS zone export revealed `mcp.brightworkrealty.com` was already
  live, actively-used infrastructure (a separate MCP server on the COS
  droplet), unrelated to this project. The diagnostic Worker had been
  silently intercepting real traffic to it. Route removed and manually
  confirmed deleted from Cloudflare's zone route table, not just the
  config file. Real service confirmed restored via `/health`.
- Attempted to replace the apex redirect workaround with a direct
  Worker Route. Confirmed technically not possible without a proxy
  status change (Section 5), reverted, redirect approach retained
  deliberately.
