#!/usr/bin/env node
/**
 * Agent-layer and public-output checks from artifacts/agent-discoverability.md §10
 * plus instruction-leak greps for HTML and generated agent files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const PROGRAMS = [
  'offmarket',
  'buybefore',
  'quiet',
  'relaunch',
  'brightflip',
  'finaloffer',
  'invest',
  'seniors',
];

const AGENT_GLOBS = {
  llms: PROGRAMS.map((p) => `${p}/llms.txt`),
  agents: PROGRAMS.map((p) => `${p}/agents.json`),
};

const SHARED_MJS = [
  'shared/agent-source-data.mjs',
  'shared/agent-response-builders.mjs',
  'shared/webmcp-data.js',
].filter((f) => fs.existsSync(path.join(ROOT, f)));

const SCRIPT_MJS = fs
  .readdirSync(path.join(ROOT, 'scripts'))
  .filter((f) => f.endsWith('.mjs'))
  .map((f) => `scripts/${f}`);

const BW_AGENT = fs.existsSync(path.join(ROOT, 'bw-agent-root/worker.js'))
  ? ['bw-agent-root/worker.js']
  : [];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  return false;
}

let ok = true;
function check(cond, msg) {
  if (!cond) {
    fail(msg);
    ok = false;
  }
}

const agentTextFiles = [
  ...AGENT_GLOBS.llms,
  ...AGENT_GLOBS.agents,
  ...SHARED_MJS,
  ...SCRIPT_MJS,
  ...BW_AGENT,
];

const EM_DASH = '\u2014';
// No em dashes in agent-facing output
for (const rel of agentTextFiles) {
  if (read(rel).includes(EM_DASH)) {
    check(false, `em dash in ${rel}`);
  }
}

const hypeRe =
  /cutting-edge|game-changing|revolutionary|seamless|robust|transformative|unprecedented|groundbreaking|multifaceted|pivotal|nuanced|tapestry|realm/i;
for (const rel of [...AGENT_GLOBS.llms, ...AGENT_GLOBS.agents, ...SHARED_MJS]) {
  if (hypeRe.test(read(rel))) {
    check(false, `banned hype word in ${rel}`);
  }
}

// Broker (exempt Brokered by Side)
const brokerRe = /\bBroker\b/gi;
for (const rel of [...SHARED_MJS.filter((f) => f.includes('agent-source')), ...AGENT_GLOBS.llms, ...AGENT_GLOBS.agents]) {
  const lines = read(rel).split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (brokerRe.test(lines[i]) && !/Brokered by Side/i.test(lines[i])) {
      check(false, `Broker in ${rel}:${i + 1}`);
    }
  }
}

for (const rel of [...SHARED_MJS.filter((f) => f.includes('agent-source')), ...AGENT_GLOBS.llms, ...AGENT_GLOBS.agents]) {
  if (/Suite 1[,"]/.test(read(rel))) {
    check(false, `Suite 1 in ${rel}`);
  }
}

for (const rel of [...AGENT_GLOBS.llms, ...AGENT_GLOBS.agents, 'shared/agent-source-data.mjs']) {
  if (/Side Real Estate/.test(read(rel))) {
    check(false, `Side Real Estate in ${rel}`);
  }
}

// Credentials hash identical across eight agents.json
const credHashes = new Set();
for (const p of PROGRAMS) {
  const data = JSON.parse(read(`${p}/agents.json`));
  const h = createHash('md5')
    .update(JSON.stringify(data.credentials, Object.keys(data.credentials || {}).sort()))
    .digest('hex');
  credHashes.add(h);
}
check(credHashes.size === 1, `unique credential hashes (expected 1, got ${credHashes.size})`);

// compliance only on seniors and invest
for (const p of PROGRAMS) {
  const data = JSON.parse(read(`${p}/agents.json`));
  const has = 'compliance' in data;
  const expect = p === 'seniors' || p === 'invest';
  if (has !== expect) {
    check(false, `${p}/agents.json compliance=${has}, expected ${expect}`);
  }
}

const source = read('shared/agent-source-data.mjs');
const howItWorksCount = (source.match(/howItWorks:/g) || []).length;
check(howItWorksCount === 8, `howItWorks: count ${howItWorksCount} (expected 8)`);
check(!/howAccessWorks|approach:/.test(source), 'howAccessWorks or approach: in agent-source-data.mjs');

const versions = new Set();
for (const p of PROGRAMS) {
  const data = JSON.parse(read(`${p}/agents.json`));
  if (data.protocolVersion != null) versions.add(String(data.protocolVersion));
}
check(versions.size === 1, `protocolVersion drift: ${[...versions].join(', ')}`);

// Instruction-shaped language in source (manual review if hit)
const instructRe =
  /Do not|do not|never say|avoid the word|do not name|do not promise|copyRules|capitalLanguage/i;
if (instructRe.test(source)) {
  const hits = source
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => instructRe.test(line));
  for (const { line, n } of hits) {
    console.error(`WARN agent-source-data.mjs:${n} (review): ${line.trim().slice(0, 100)}`);
  }
}

// S1: instruction leak in generated agent files (#12 grep)
const agentInstructionRe = /\bDo not\b|\bcopyRules\b|\bcapitalLanguage\b/i;
for (const rel of [...AGENT_GLOBS.llms, ...AGENT_GLOBS.agents]) {
  if (agentInstructionRe.test(read(rel))) {
    check(false, `instruction-shaped language in ${rel}`);
  }
}

const htmlInstructionRe =
  /copyRules|capitalLanguage|internal only|don't publish|this guide (only|explains)/i;
const htmlPaths = [
  ...PROGRAMS.map((p) => `${p}/index.html`),
  'seniors/workshop/index.html',
  'relaunch/case-study/index.html',
];
for (const rel of htmlPaths) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  if (htmlInstructionRe.test(read(rel))) {
    check(false, `instruction-shaped language in ${rel}`);
  }
}

const sourceInstructionRe =
  /copyRules|capitalLanguage|never say|avoid the word|this guide (only|explains)/i;
if (sourceInstructionRe.test(source)) {
  check(false, 'instruction-shaped field names or copy in shared/agent-source-data.mjs');
}

if (ok) {
  console.log('check-agent-files: all automated checks passed');
}
process.exit(ok ? 0 : 1);
