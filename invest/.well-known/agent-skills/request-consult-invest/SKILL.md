---
name: request-consult-invest
description: Submit a contact request for the Real Estate Investing program through the supported WebMCP request_consult tool or the human lead form on https://invest.brightworkrealty.com/.
compatibility: Requires HTTPS access to https://invest.brightworkrealty.com for WebMCP, or user approval before any direct proxy call.
---

# Request consult: Real Estate Investing

BrightWork Realty Advocates. Ben Olsen, REALTOR. Phone (925) 200-6000. Email ben@brightworkrealty.com. Office 455 Moraga Road, Suite I, Moraga, CA 94556. DRE 02014153.

## Preferred path

When a WebMCP-capable browser runtime is available on https://invest.brightworkrealty.com/, call the `request_consult` tool registered by the page scripts. Tool schema and descriptions are listed in https://invest.brightworkrealty.com/.well-known/webmcp-tools.json.

Required arguments:

| Field | Required | Notes |
| --- | --- | --- |
| firstName | Yes | Given name |
| lastName | Yes | Family name |
| email | Yes | Email address |
| phone | Yes | Mobile phone number |

## Human form parity

The public lead form on https://invest.brightworkrealty.com/ collects the same four fields. Show the user a draft and get explicit approval before submitting on their behalf.

## Limits

- Contacts only. No MLS inventory, listing addresses, or CRM read access.
- The raw bw-fub-proxy endpoint is not a published public API contract outside the WebMCP tool and human form.
