#!/usr/bin/env node
/**
 * Generate agent discoverability files from shared/agent-source-data.mjs.
 *
 * Writes per Worker folder: robots.txt, llms.txt, agents.json, index.md,
 * sitemap.xml, .well-known/*, _headers, webmcp-data.js
 * Also writes shared/webmcp-data.js (canonical browser bundle).
 *
 * Run after editing program or office copy:
 *   node scripts/generate-agent-discoverability.mjs
 */

import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AGENT_PROTOCOL_VERSION,
  OFFICE_INFO,
  CREDENTIALS,
  PROGRAMS,
  SHARED_TOOL_LIMITATIONS,
  PROGRAMS_BY_SLUG,
  PAGE_FOLDERS,
  applyLamorindaGloss
} from '../shared/agent-source-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const COMPLIANCE_SLUGS = new Set(['seniors', 'invest']);

const NAMED_AI_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'OAI-SearchBot'
];

const CONTENT_SIGNAL = 'ai-train=yes, search=yes, ai-input=yes';

const ROBOTS_PREAMBLE = `# As a condition of accessing this website, you agree to abide by the following content signals:
#
# (a)  If a content-signal = yes, you may collect content for the corresponding use.
# (b)  If a content-signal = no, you may not collect content for the corresponding use.
# (c)  If the website operator does not include a content signal for a corresponding use,
# the website operator neither grants nor restricts permission via content signal with respect
# to the corresponding use.
#
# search: building a search index and providing search results.
# ai-input: inputting content into AI models (RAG, grounding, generative answers).
# ai-train: training or fine-tuning AI models.
`;

const PROGRAM_STRIP_KEYS = new Set([
  'limitations',
  'compliance'
]);

const PROGRAM_KEY_ORDER = [
  'name',
  'url',
  'tagline',
  'summary',
  'audience',
  'howItWorks',
  'problem',
  'approach',
  'benefits',
  'topics',
  'whatBenDoes',
  'reviewAreas',
  'whatChangesOnRelaunch',
  'positioning',
  'tiers',
  'pillars',
  'platformFacts',
  'serviceArea',
  'marketTenure',
  'mlsNote',
  'complianceNote',
  'workshopNote',
  'faq'
];

const REQUEST_CONSULT_SCHEMA = {
  type: 'object',
  properties: {
    firstName: { type: 'string', description: 'Contact first name' },
    lastName: { type: 'string', description: 'Contact last name' },
    email: { type: 'string', description: 'Contact email address' },
    phone: { type: 'string', description: 'Contact mobile phone number' }
  },
  required: ['firstName', 'lastName', 'email', 'phone']
};

const SHARED_WEBMCP_TOOLS = [
  {
    name: 'get_office',
    description:
      'Return BrightWork Realty Advocates office and contact information for Ben Olsen, REALTOR: phone, email, address, DRE, and market tenure.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'list_programs',
    description:
      'List all eight BrightWork Realty Advocates program landing pages with a one-line summary and HTTPS URL. Breadth-of-services answer with no MLS data.',
    inputSchema: { type: 'object', properties: {} }
  }
];

function hostForSubdomain(subdomain) {
  return `https://${subdomain}.brightworkrealty.com`;
}

function sha256Digest(content) {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

function listProgramsPayload() {
  return {
    brandName: OFFICE_INFO.brandName,
    tagline: OFFICE_INFO.tagline,
    programs: PROGRAMS
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

function complianceForSlug(slug, program) {
  if (slug === 'seniors') {
    return program.compliance;
  }

  if (slug === 'invest') {
    return program.compliance;
  }

  return null;
}

function orderProgramKeys(program, slug) {
  const stripped = { ...program };
  PROGRAM_STRIP_KEYS.forEach((key) => delete stripped[key]);

  const ordered = {};
  for (const key of PROGRAM_KEY_ORDER) {
    if (stripped[key] !== undefined) {
      ordered[key] = stripped[key];
    }
  }
  for (const key of Object.keys(stripped)) {
    if (!ordered[key]) {
      ordered[key] = stripped[key];
    }
  }
  return ordered;
}

function discoveryUrls(host) {
  return {
    llmsTxt: `${host}/llms.txt`,
    sitemap: `${host}/sitemap.xml`,
    markdown: `${host}/index.md`,
    apiCatalog: `${host}/.well-known/api-catalog`,
    aiCatalog: `${host}/.well-known/ai-catalog.json`,
    webmcpTools: `${host}/.well-known/webmcp-tools.json`,
    agentSkills: `${host}/.well-known/agent-skills/index.json`
  };
}

function agentsJson(slug, host) {
  const program = PROGRAMS_BY_SLUG[slug];
  const compliance = complianceForSlug(slug, program);
  const discovery = discoveryUrls(host);

  const doc = {
    protocolVersion: AGENT_PROTOCOL_VERSION,
    site: sitePayload(),
    credentials: CREDENTIALS,
    program: orderProgramKeys(program, slug),
    llmsTxt: discovery.llmsTxt,
    sitemap: discovery.sitemap,
    markdown: discovery.markdown,
    apiCatalog: discovery.apiCatalog,
    aiCatalog: discovery.aiCatalog,
    webmcpTools: discovery.webmcpTools,
    agentSkills: discovery.agentSkills
  };

  if (COMPLIANCE_SLUGS.has(slug) && compliance) {
    doc.compliance = compliance;
  }

  doc.otherPrograms = listProgramsPayload();
  doc.actions = [
    {
      name: 'request_consult',
      description: 'Submit a contact request. Writes to Follow Up Boss. Contacts only, no CRM read.',
      method: 'POST',
      endpoint: 'https://bw-fub-proxy.scott-5f5.workers.dev',
      note: 'The WebMCP tool is the supported way for an agent to submit this request. This endpoint is not a published API contract for direct use outside that tool.'
    }
  ];
  doc.limitations = [
    'No MLS inventory, listing addresses, or CRM read access.',
    'Use the WebMCP tools or the human form to submit a contact request.'
  ];

  return doc;
}

function programListLine(program) {
  return `- [${program.name}](${program.url})`;
}

function complianceLines(slug, program) {
  const compliance = complianceForSlug(slug, program);
  if (!compliance) return [];

  if (Array.isArray(compliance)) return compliance;
  return [compliance];
}

function complianceBlock(slug, program) {
  const lines = complianceLines(slug, program);
  if (lines.length === 0) return '';

  return `\n## Compliance\n\n${lines.map((line) => `- ${line}`).join('\n')}\n`;
}

function credentialsBlock() {
  const bioLines = CREDENTIALS.bio.map((line) => `- ${line}`).join('\n');

  return `## Credentials

${bioLines}

- Personal track record: ${CREDENTIALS.personalTrackRecord}
- Reviews: ${CREDENTIALS.reviewsUrl}
- Firm track record: ${CREDENTIALS.firmTrackRecord}
- Differentiator: ${CREDENTIALS.differentiator}
`;
}

function howItWorksBlock(program) {
  if (!Array.isArray(program.howItWorks) || program.howItWorks.length === 0) {
    return '';
  }

  return `\n\n${program.howItWorks.map((step) => `- ${step}`).join('\n')}\n`;
}

function faqBlock(program) {
  if (!Array.isArray(program.faq) || program.faq.length === 0) {
    return '';
  }

  const blocks = program.faq
    .map((item) => `### ${item.question}\n\n${item.answer}`)
    .join('\n\n');

  return `\n## FAQ\n\n${blocks}\n`;
}

function llmsTxt(slug) {
  const program = PROGRAMS_BY_SLUG[slug];
  const catalog = PROGRAMS.find((p) => p.slug === slug);
  const oneLine = catalog ? catalog.summary : program.summary;
  const whatFor = `${program.summary} ${program.audience}`;

  const content = `# ${program.name}: BrightWork Realty Advocates

> ${oneLine}

BrightWork Realty Advocates. Ben Olsen, REALTOR. Serving Lamorinda.

${credentialsBlock()}
## What this page is for

${whatFor}${howItWorksBlock(program)}
## Key facts

- Phone: ${OFFICE_INFO.phone}
- Email: ${OFFICE_INFO.email}
- Address: ${OFFICE_INFO.address.formatted}
- DRE: ${OFFICE_INFO.brokerageDre}
${complianceBlock(slug, program)}
## Other BrightWork programs

${PROGRAMS.map(programListLine).join('\n')}

## For AI agents

This site also exposes structured data at /agents.json (no browser required) and in-browser tools via WebMCP at /agents.txt (requires a WebMCP-capable runtime).
`;

  return applyLamorindaGloss(content);
}

function indexMd(slug, host) {
  const program = PROGRAMS_BY_SLUG[slug];
  const catalog = PROGRAMS.find((p) => p.slug === slug);
  const oneLine = catalog ? catalog.summary : program.summary;

  const content = `# ${program.name}

> ${oneLine}

Canonical URL: ${host}/

BrightWork Realty Advocates. Ben Olsen, REALTOR.

## Summary

${program.summary}

## Audience

${program.audience}
${howItWorksBlock(program) ? `\n## How it works${howItWorksBlock(program)}` : ''}
${faqBlock(program)}
${credentialsBlock()}
## Contact

- Phone: ${OFFICE_INFO.phone}
- Email: ${OFFICE_INFO.email}
- Address: ${OFFICE_INFO.address.formatted}
- DRE: ${OFFICE_INFO.brokerageDre}
${complianceBlock(slug, program)}
## Related programs

${PROGRAMS.map(programListLine).join('\n')}
`;

  return applyLamorindaGloss(content);
}

function robotsTxt(subdomain) {
  const host = hostForSubdomain(subdomain);
  const groups = [
    `User-agent: *\nContent-Signal: ${CONTENT_SIGNAL}\nAllow: /`,
    ...NAMED_AI_BOTS.map(
      (bot) => `User-agent: ${bot}\nContent-Signal: ${CONTENT_SIGNAL}\nAllow: /`
    )
  ].join('\n\n');

  return `${ROBOTS_PREAMBLE}
${groups}

Sitemap: ${host}/sitemap.xml
# LLM discovery: ${host}/llms.txt
# Agent catalog: ${host}/agents.json
`;
}

function sitemapXml(host) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
  </url>
</urlset>
`;
}

function extractToolDescription(webmcpJs, toolName) {
  const pattern = new RegExp(
    `name:\\s*'${toolName}'[\\s\\S]*?description:\\s*'((?:\\\\'|[^'])*)'`,
    'm'
  );
  const match = webmcpJs.match(pattern);
  if (!match) {
    throw new Error(`Could not find ${toolName} description in webmcp script`);
  }
  return match[1].replace(/\\'/g, "'");
}

function webmcpToolsJson(slug, folder, host) {
  const webmcpPath = join(ROOT, folder, `webmcp-${slug}.js`);
  const webmcpJs = readFileSync(webmcpPath, 'utf8');
  const getProgramDescription = extractToolDescription(webmcpJs, 'get_program');
  const requestConsultDescription = extractToolDescription(webmcpJs, 'request_consult');

  return {
    site: `${host}/`,
    spec: 'https://webmachinelearning.github.io/webmcp/',
    registration:
      'Tools are registered at runtime via navigator.modelContext.registerTool on page load when the WebMCP API is available.',
    tools: [
      ...SHARED_WEBMCP_TOOLS,
      {
        name: 'get_program',
        description: getProgramDescription,
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'request_consult',
        description: requestConsultDescription,
        inputSchema: REQUEST_CONSULT_SCHEMA,
        note: 'Executes in the browser via fub-lead.js against the same bw-fub-proxy endpoint as the human lead form.'
      }
    ]
  };
}

function apiCatalog(host) {
  const catalogUrl = `${host}/.well-known/api-catalog`;
  return {
    linkset: [
      {
        anchor: catalogUrl,
        item: [
          { href: `${host}/agents.json`, title: 'Agents catalog (agents.json)' },
          { href: `${host}/llms.txt`, title: 'llms.txt site guide' },
          { href: `${host}/sitemap.xml`, title: 'XML sitemap' },
          { href: `${host}/.well-known/ai-catalog.json`, title: 'ARD capability manifest' },
          { href: `${host}/.well-known/webmcp-tools.json`, title: 'WebMCP tool manifest' },
          { href: `${host}/.well-known/agent-skills/index.json`, title: 'Agent Skills discovery index' }
        ]
      },
      {
        anchor: `${host}/`,
        'service-desc': [
          { href: `${host}/.well-known/webmcp-tools.json`, type: 'application/json' },
          { href: `${host}/agents.json`, type: 'application/json' }
        ]
      }
    ]
  };
}

function aiCatalogJson(slug, subdomain, host) {
  const urnBase = `urn:air:${subdomain}.brightworkrealty.com:discovery`;
  const program = PROGRAMS_BY_SLUG[slug];
  return {
    specVersion: '1.0',
    host: {
      displayName: program?.name || subdomain,
      identifier: `did:web:${subdomain}.brightworkrealty.com`
    },
    entries: [
      {
        identifier: `${urnBase}:agents`,
        displayName: 'Agents catalog',
        type: 'application/json',
        url: `${host}/agents.json`,
        description: 'Structured facts about this BrightWork program, office, and related programs.',
        representativeQueries: [
          `what is the ${subdomain} BrightWork program`,
          `${subdomain}.brightworkrealty.com agents.json`
        ]
      },
      {
        identifier: `${urnBase}:llms`,
        displayName: 'llms.txt site guide',
        type: 'text/plain',
        url: `${host}/llms.txt`,
        description: 'Plain-language summary of this program page for language models.',
        representativeQueries: [`overview of ${host}`, 'BrightWork program llms.txt']
      },
      {
        identifier: `${urnBase}:sitemap`,
        displayName: 'XML sitemap',
        type: 'application/xml',
        url: `${host}/sitemap.xml`,
        description: 'Canonical homepage URL for this program subdomain.',
        representativeQueries: [`${subdomain} sitemap`, 'BrightWork program sitemap']
      },
      {
        identifier: `${urnBase}:markdown`,
        displayName: 'Homepage markdown',
        type: 'text/markdown',
        url: `${host}/index.md`,
        description: 'Markdown twin of the program homepage factual content.',
        representativeQueries: [`${host} markdown`, 'Accept text/markdown homepage']
      },
      {
        identifier: `${urnBase}:webmcp`,
        displayName: 'WebMCP tools',
        type: 'application/json',
        url: `${host}/.well-known/webmcp-tools.json`,
        description: 'Tool names and schemas registered by the page WebMCP scripts.',
        representativeQueries: ['BrightWork WebMCP tools', 'request_consult WebMCP']
      }
    ]
  };
}

function agentSkillMd(slug, host, program) {
  const skillName = `request-consult-${slug}`;
  return `---
name: ${skillName}
description: Submit a contact request for the ${program.name} program through the supported WebMCP request_consult tool or the human lead form on ${host}/.
compatibility: Requires HTTPS access to ${host} for WebMCP, or user approval before any direct proxy call.
---

# Request consult: ${program.name}

BrightWork Realty Advocates. Ben Olsen, REALTOR. Phone ${OFFICE_INFO.phone}. Email ${OFFICE_INFO.email}. Office ${OFFICE_INFO.address.formatted}. DRE ${OFFICE_INFO.brokerageDre}.

## Preferred path

When a WebMCP-capable browser runtime is available on ${host}/, call the \`request_consult\` tool registered by the page scripts. Tool schema and descriptions are listed in ${host}/.well-known/webmcp-tools.json.

Required arguments:

| Field | Required | Notes |
| --- | --- | --- |
| firstName | Yes | Given name |
| lastName | Yes | Family name |
| email | Yes | Email address |
| phone | Yes | Mobile phone number |

## Human form parity

The public lead form on ${host}/ collects the same four fields. Show the user a draft and get explicit approval before submitting on their behalf.

## Limits

- Contacts only. No MLS inventory, listing addresses, or CRM read access.
- The raw bw-fub-proxy endpoint is not a published public API contract outside the WebMCP tool and human form.
`;
}

function agentSkillsIndex(skillName, skillRelativeUrl, skillMd) {
  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: skillName,
        type: 'skill-md',
        description: `Submit a contact request for this BrightWork program via WebMCP request_consult or the human lead form.`,
        url: skillRelativeUrl,
        digest: sha256Digest(skillMd)
      }
    ]
  };
}

function headersFile(subdomain) {
  const host = hostForSubdomain(subdomain);
  return `/*
  Link: <${host}/>; rel="webmcp"
  Link: </agents.json>; rel="alternate"; type="application/json"

/agents.txt
  Content-Type: text/plain; charset=utf-8

/agents.json
  Content-Type: application/json; charset=utf-8

/llms.txt
  Content-Type: text/plain; charset=utf-8

/sitemap.xml
  Content-Type: application/xml; charset=utf-8

/index.md
  Content-Type: text/markdown; charset=utf-8

/.well-known/api-catalog
  Content-Type: application/linkset+json; charset=utf-8
  Access-Control-Allow-Origin: *

/.well-known/ai-catalog.json
  Content-Type: application/json; charset=utf-8
  Access-Control-Allow-Origin: *

/.well-known/webmcp-tools.json
  Content-Type: application/json; charset=utf-8
  Access-Control-Allow-Origin: *

/.well-known/agent-skills/index.json
  Content-Type: application/json; charset=utf-8
  Access-Control-Allow-Origin: *
`;
}

function webmcpDataJs() {
  const officeWithCredentials = {
    ...OFFICE_INFO,
    credentials: CREDENTIALS
  };

  const payload = {
    OFFICE_INFO: officeWithCredentials,
    CREDENTIALS,
    PROGRAMS,
    SHARED_TOOL_LIMITATIONS,
    PROGRAMS_BY_SLUG
  };

  return `/**
 * Canonical office + program facts for WebMCP tools (browser bundle).
 * Source: shared/agent-source-data.mjs. Regenerate with:
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
  const host = hostForSubdomain(page.subdomain);
  const program = PROGRAMS_BY_SLUG[page.slug];
  const skillName = `request-consult-${page.slug}`;
  const skillRelativeUrl = `/.well-known/agent-skills/${skillName}/SKILL.md`;
  const skillMd = agentSkillMd(page.slug, host, program);

  write(join(folderPath, 'robots.txt'), robotsTxt(page.subdomain));
  write(join(folderPath, 'llms.txt'), llmsTxt(page.slug));
  write(join(folderPath, 'index.md'), indexMd(page.slug, host));
  write(join(folderPath, 'sitemap.xml'), sitemapXml(host));
  write(join(folderPath, 'agents.json'), JSON.stringify(agentsJson(page.slug, host), null, 2) + '\n');
  write(join(folderPath, 'webmcp-data.js'), browserBundle);
  write(join(folderPath, '_headers'), headersFile(page.subdomain));
  write(
    join(folderPath, '.well-known', 'api-catalog'),
    JSON.stringify(apiCatalog(host), null, 2) + '\n'
  );
  write(
    join(folderPath, '.well-known', 'ai-catalog.json'),
    JSON.stringify(aiCatalogJson(page.slug, page.subdomain, host), null, 2) + '\n'
  );
  write(
    join(folderPath, '.well-known', 'webmcp-tools.json'),
    JSON.stringify(webmcpToolsJson(page.slug, page.folder, host), null, 2) + '\n'
  );
  write(
    join(folderPath, '.well-known', 'agent-skills', skillName, 'SKILL.md'),
    skillMd
  );
  write(
    join(folderPath, '.well-known', 'agent-skills', 'index.json'),
    JSON.stringify(agentSkillsIndex(skillName, skillRelativeUrl, skillMd), null, 2) + '\n'
  );
}

console.log('Generated agent discoverability files for:', PAGE_FOLDERS.map((p) => p.folder).join(', '));
