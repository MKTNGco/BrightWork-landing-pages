#!/usr/bin/env node
/**
 * Generate agent discoverability files from shared/agent-source-data.mjs.
 *
 * Writes per Worker folder: robots.txt, llms.txt, agents.json, webmcp-data.js
 * Also writes shared/webmcp-data.js (canonical browser bundle).
 *
 * Run after editing program or office copy:
 *   node scripts/generate-agent-discoverability.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OFFICE_INFO,
  PROGRAMS,
  SHARED_TOOL_LIMITATIONS,
  PROGRAMS_BY_SLUG,
  PAGE_FOLDERS
} from '../shared/agent-source-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function listProgramsPayload() {
  return {
    brandName: OFFICE_INFO.brandName,
    tagline: OFFICE_INFO.tagline,
    programs: PROGRAMS,
    limitations: SHARED_TOOL_LIMITATIONS
  };
}

function sitePayload() {
  return {
    brandName: OFFICE_INFO.brandName,
    tagline: OFFICE_INFO.tagline,
    realtor: {
      name: OFFICE_INFO.realtor.name,
      title: OFFICE_INFO.realtor.title
    },
    phone: OFFICE_INFO.phone,
    email: OFFICE_INFO.email,
    address: OFFICE_INFO.address.formatted,
    dre: OFFICE_INFO.brokerageDre,
    marketTenure: OFFICE_INFO.marketTenure
  };
}

function agentsJson(slug) {
  return {
    protocolVersion: '1.0',
    site: sitePayload(),
    program: PROGRAMS_BY_SLUG[slug],
    otherPrograms: listProgramsPayload(),
    actions: [
      {
        name: 'request_consult',
        description: 'Submit a contact request. Writes to Follow Up Boss. Contacts only, no CRM read.',
        method: 'POST',
        endpoint: 'https://bw-fub-proxy.scott-5f5.workers.dev',
        note: 'Structured POST contract documented separately; WebMCP tool is the supported invocation path for agents that support it.'
      }
    ],
    limitations: [
      'No MLS inventory, listing addresses, or CRM read access.',
      'This file is descriptive. Use the WebMCP tools or the human form to submit a contact request.'
    ]
  };
}

function programListLine(program) {
  return `- [${program.name}](${program.url})`;
}

function complianceBlock(slug, program) {
  const lines = [];

  if (slug === 'seniors' && program.compliance) {
    lines.push(program.compliance);
  }

  if (slug === 'invest' && program.compliance) {
    lines.push(program.compliance);
  }

  if (slug === 'brightflip' && program.capitalLanguage) {
    lines.push(program.capitalLanguage);
  }

  if (slug === 'finaloffer') {
    if (program.positioning) lines.push(program.positioning);
    const narFact = program.platformFacts && program.platformFacts.find((f) => f.includes('NAR Clear Cooperation'));
    if (narFact) lines.push(narFact);
    if (program.copyRules) {
      program.copyRules.forEach((rule) => lines.push(rule));
    }
  }

  if (lines.length === 0) return '';

  return `\n## Compliance\n\n${lines.map((line) => `- ${line}`).join('\n')}\n`;
}

function llmsTxt(slug) {
  const program = PROGRAMS_BY_SLUG[slug];
  const catalog = PROGRAMS.find((p) => p.slug === slug);
  const oneLine = catalog ? catalog.summary : program.summary;

  const whatFor = `${program.summary} ${program.audience}`;

  return `# ${program.name} — BrightWork Realty Advocates

> ${oneLine}

BrightWork Realty Advocates. Ben Olsen, REALTOR. Serving Moraga, Lafayette, and Orinda (Lamorinda), CA. The BrightWork team has operated in Lamorinda since 1977. Ben Olsen has worked Lamorinda real estate since 2004.

## What this page is for

${whatFor}

## Key facts

- Phone: ${OFFICE_INFO.phone}
- Email: ${OFFICE_INFO.email}
- Address: ${OFFICE_INFO.address.formatted}
- DRE: ${OFFICE_INFO.brokerageDre}
${complianceBlock(slug, program)}
## Other BrightWork programs

${PROGRAMS.map(programListLine).join('\n')}

## For AI agents

This site also exposes structured data at /agents.json (no browser required) and in-browser tools via WebMCP at /agents.txt (requires a WebMCP-capable runtime). Agents do not get MLS inventory, listing addresses, or CRM read access.
`;
}

function robotsTxt(subdomain) {
  const host = `https://${subdomain}.brightworkrealty.com`;
  return `User-agent: *
Allow: /

# Agent-readable resources
# llms.txt: ${host}/llms.txt
# agents.txt: ${host}/agents.txt
# agents.json: ${host}/agents.json
`;
}

function webmcpDataJs() {
  const payload = {
    OFFICE_INFO,
    PROGRAMS,
    SHARED_TOOL_LIMITATIONS,
    PROGRAMS_BY_SLUG
  };

  return `/**
 * Canonical office + program facts for WebMCP tools (browser bundle).
 * Source: shared/agent-source-data.mjs — regenerate with:
 *   node scripts/generate-agent-discoverability.mjs
 */
(function (global) {
  'use strict';
  global.BrightWorkWebMCPData = ${JSON.stringify(payload, null, 2)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

const browserBundle = webmcpDataJs();
write(join(ROOT, 'shared', 'webmcp-data.js'), browserBundle);

for (const page of PAGE_FOLDERS) {
  const folderPath = join(ROOT, page.folder);
  write(join(folderPath, 'robots.txt'), robotsTxt(page.subdomain));
  write(join(folderPath, 'llms.txt'), llmsTxt(page.slug));
  write(join(folderPath, 'agents.json'), JSON.stringify(agentsJson(page.slug), null, 2) + '\n');
  write(join(folderPath, 'webmcp-data.js'), browserBundle);
}

console.log('Generated agent discoverability files for:', PAGE_FOLDERS.map((p) => p.folder).join(', '));
