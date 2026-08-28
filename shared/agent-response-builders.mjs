import {
  CREDENTIALS,
  OFFICE_INFO,
  PROGRAMS,
} from "./agent-source-data.mjs";

const SERVICE_AREA = "Moraga, Lafayette, and Orinda (Lamorinda), CA";
const ROOT_PROTOCOL_VERSION = "1.1";

export function buildRobotsTxt(office = OFFICE_INFO) {
  return `User-agent: *
Allow: /

# Agent-readable resources
# llms.txt: ${office.website}/llms.txt
# agents.json: ${office.website}/agents.json
`;
}

export function buildRootLlmsTxt({
  office = OFFICE_INFO,
  credentials = CREDENTIALS,
  programs = PROGRAMS,
} = {}) {
  const programLines = programs
    .map((program) => `- [${program.name}](${program.url}): ${program.summary}`)
    .join("\n");

  return `# ${office.brandName}

> ${office.tagline}. ${office.realtor.name}, ${office.realtor.title}, serving ${SERVICE_AREA}.

${credentials.trackRecord} ${office.marketTenure}

## Who Ben is

${credentials.localAuthority} ${credentials.background}

Certifications: ${credentials.certifications.join(", ")}.
Recognition: ${credentials.recognition.join(", ")}.

## What makes BrightWork different

${credentials.differentiator}

## Programs

${programLines}

## Contact

Phone: ${office.phone}
Email: ${office.email}
Address: ${office.address.formatted}
DRE: ${office.brokerageDre}

## For AI agents

Structured data is available at ${office.website}/agents.json. Each program page above also has its own detailed page and, where supported, WebMCP tools for direct interaction. This site does not provide MLS inventory, listing addresses, or CRM read access.
`;
}

export function buildRootAgentsJson({
  office = OFFICE_INFO,
  credentials = CREDENTIALS,
  programs = PROGRAMS,
} = {}) {
  return {
    protocolVersion: ROOT_PROTOCOL_VERSION,
    site: {
      brandName: office.brandName,
      tagline: office.tagline,
      realtor: {
        name: office.realtor.name,
        title: office.realtor.title,
      },
      phone: office.phone,
      email: office.email,
      address: office.address.formatted,
      dre: office.brokerageDre,
      marketTenure: office.marketTenure,
    },
    credentials,
    programs,
    actions: [],
    limitations: [
      "This file describes BrightWork Realty Advocates and its programs. It does not provide MLS inventory, listing addresses, or CRM read access.",
      "Interactive WebMCP tools are available on the individual program pages linked above, not on this root domain.",
    ],
  };
}
