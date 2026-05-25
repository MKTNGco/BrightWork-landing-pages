# PostHog Event Schema

## BrightWork Realty Advocates

Last updated: May 2026  
Project key: phc_D4PErHHVrdiiphQqEZ8qmintbxdNLtzCShtmgmwWC79i  
Host: us.i.posthog.com  
Person profiles: identified_only (no anonymous profiles created)  
Cross-subdomain cookies: true (all *.brightworkrealty.com share identity)

---

## Domain Coverage (post-DNS cutover)

| Domain | PostHog | identify | lead_submitted | Notes |
|--------|---------|----------|----------------|-------|
| brightworkrealty.com | Auto only | No | No | Luxury Presence CMS — no form |
| offmarket.brightworkrealty.com | Full | Yes | Yes | |
| buybefore.brightworkrealty.com | Full | Yes | Yes | |
| quiet.brightworkrealty.com | Full | Yes | Yes | |
| relaunch.brightworkrealty.com | Full | Yes | Yes | |
| brightflip.brightworkrealty.com | Full | Yes | Yes | Captures property_address |
| finaloffer.brightworkrealty.com | Full | Yes | Yes | Captures property_address, referral_source |
| invest.brightworkrealty.com | Full | Yes | Yes | |
| seniors.brightworkrealty.com | Full | Yes | Yes | Reference implementation |
| seniors.brightworkrealty.com/workshop | Full | Yes | Yes | Adds workshop_active flag |
| moragacountryclubrealestate.com | Full | Yes | Yes | Astro layout, standalone domain (separate repo) |

---

## Events

### `page_view_program` (custom)

Fires on page load for all program landing pages.

**Properties:**

| Property | Type | Values |
|----------|------|--------|
| `program` | string | Matches `LEAD_TAG` constant per page (see table below) |

Fires before any form interaction. Useful for gauging which programs get visits vs. form starts.

---

### `form_started` (custom)

Fires once per session on first focus of any form field.

**Properties:**

| Property | Type | Values |
|----------|------|--------|
| `program` | string | Matches `LEAD_TAG` |

The gap between `page_view_program` count and `form_started` count measures browse-only vs. engaged visitors.

---

### `$identify` (PostHog standard)

Fires on form submit. Links the anonymous session to a named contact.

On most program pages, identify runs before the FUB POST (same timing as seniors). On brightflip, finaloffer, invest, quiet, and relaunch, identify runs inside the `res.ok` success block after confirmed FUB delivery.

**Person properties set:**

| Property | Present On | Notes |
|----------|------------|-------|
| `email` | All pages | Used as distinct_id |
| `name` | All pages | First + last concatenated |
| `fub_source` | All pages that send it | Matches human-readable source where used |
| `property_address` | brightflip, finaloffer, relaunch | Only if entered; undefined otherwise |
| `referral_source` | finaloffer | Only if entered |

After this fires, PostHog creates a person profile. All prior anonymous session events are retroactively linked.

---

### `lead_submitted` (custom)

Fires inside the `res.ok` block only — confirmed successful FUB contact creation.

**Properties:**

| Property | Present On | Type | Notes |
|----------|------------|------|-------|
| `program` | All | string | `LEAD_TAG` value (quiet page uses legacy `quiet-listing` slug on this event only) |
| `source` | All | string | `LEAD_SOURCE` or equivalent source string |
| `has_address` | finaloffer | boolean | Whether property_address was provided |
| `referral_source` | finaloffer | string/null | — |
| `situation` | quiet | string/null | Seller's stated situation |
| `has_concern_note` | relaunch | boolean | Whether they entered a concern note |

This is the primary conversion event. CoS should treat this as the moment a contact becomes a known lead.

---

### `workshop_active` (custom, seniors/workshop only)

Added as a property on `page_view_program` for the workshop page.

**Properties:** `program`, `workshop_active: true`

---

## Program-to-Tag Mapping

| Program Page | LEAD_TAG (PostHog `program` on funnel events) | LEAD_SOURCE (PostHog `source`) | FUB Tag |
|--------------|-----------------------------------------------|-------------------------------|---------|
| Off-Market Access | off-market-lead | Off-Market Access | off-market-lead |
| Buy Before You Sell | buy-before-you-sell-lead | Buy Before You Sell | buy-before-you-sell-lead |
| Quiet Listing | quiet-listing-inquiry | Quiet Listing | quiet-listing-inquiry |
| Relaunch Strategy | relaunch-inquiry | Relaunch Strategy | relaunch-inquiry |
| BrightFlip | presale-improvement-inquiry | BrightFlip | presale-improvement-inquiry |
| Final Offer | final-offer-inquiry | Final Offer | final-offer-inquiry |
| Real Estate Investing | investment-inquiry | Real Estate Investing | investment-inquiry |
| Senior Planning | senior-services-inquiry | Senior Services | senior-services-inquiry |
| Senior Workshop (registered) | workshop-registration | Senior Workshop | workshop-registration |
| Senior Workshop (interest) | workshop-interest-list | Senior Workshop | workshop-interest-list |
| MCC Site | mcc-inquiry | MCC Site | TBD |

---

## CoS Query Patterns

### "Has this FUB contact shown recent intent?"

```sql
SELECT 
  event,
  timestamp,
  properties.program,
  properties.$current_url
FROM events
WHERE distinct_id = '{email_from_fub}'
  AND timestamp >= now() - INTERVAL 30 DAY
  AND event IN ('page_view_program', 'form_started', 'lead_submitted', '$pageview')
ORDER BY timestamp DESC
LIMIT 20
```

### "Hot leads — multiple program views in 7 days"

```sql
SELECT 
  distinct_id,
  count() AS program_views
FROM events
WHERE event = 'page_view_program'
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY distinct_id
HAVING program_views >= 2
ORDER BY program_views DESC
```

### "Form starts that never converted"

```sql
SELECT distinct_id, properties.program
FROM events
WHERE event = 'form_started'
  AND timestamp >= now() - INTERVAL 14 DAY
  AND distinct_id NOT IN (
    SELECT distinct_id FROM events 
    WHERE event = 'lead_submitted'
    AND timestamp >= now() - INTERVAL 14 DAY
  )
```

---

## Notes for CoS Agents

- `person_profiles: 'identified_only'` means anonymous visitors have no PostHog person record. Only post-identify contacts are queryable.
- Use email as the lookup key to connect FUB contacts to PostHog persons. The FUB contact email and PostHog distinct_id will match.
- `lead_submitted` is the reliable conversion signal. `form_started` without `lead_submitted` indicates drop-off worth monitoring.
- Property data like `property_address` should not be treated as authoritative CRM data — use FUB for that. These are intent signals only.
- The MCC site contact form generates `mcc-inquiry` contacts in a separate Astro repo. FUB tag TBD pending tag taxonomy approval.
