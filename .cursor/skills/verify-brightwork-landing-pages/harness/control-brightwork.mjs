#!/usr/bin/env node
/**
 * BrightWork landing page verification harness.
 * Drives local static pages via Playwright. Never submits real leads to bw-fub-proxy.
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SKILL_ROOT = path.resolve(__dirname, '..');
const DEFAULT_PORT = 4173;
const FUB_PROXY_HOST = 'bw-fub-proxy.scott-5f5.workers.dev';

const PROGRAM_PAGES = [
  'offmarket',
  'buybefore',
  'seniors',
  'quiet',
  'relaunch',
  'brightflip',
  'finaloffer',
  'invest'
];

function runId() {
  return process.env.BW_VERIFY_RUN_ID || `bw-${Date.now()}`;
}

function statePath() {
  const dir = path.join('/tmp', `bw-verify-${runId()}`);
  return { dir, file: path.join(dir, 'state.json') };
}

async function loadState() {
  const { file } = statePath();
  if (!existsSync(file)) return null;
  return JSON.parse(await readFile(file, 'utf8'));
}

async function saveState(state) {
  const { dir, file } = statePath();
  await mkdir(dir, { recursive: true });
  await writeFile(file, JSON.stringify(state, null, 2));
}

function baseUrlForPort(port) {
  // Pages redirect http://127.0.0.1 to HTTPS. localhost is exempt and required for local serve.
  return `http://localhost:${port}`;
}

async function waitForPort(port, timeoutMs = 45000) {
  const start = Date.now();
  const url = baseUrlForPort(port);
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/`);
      if (res.ok || res.status === 404) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

function pageDir(page) {
  const dir = path.join(REPO_ROOT, page);
  if (!existsSync(path.join(dir, 'index.html'))) {
    throw new Error(`Unknown page folder: ${page} (expected index.html at ${dir})`);
  }
  return dir;
}

async function cmdLaunch(args) {
  const page = args.page || args._[1];
  const port = Number(args.port || DEFAULT_PORT);
  if (!page) throw new Error('Usage: launch --page <folder> [--port 4173]');

  const existing = await loadState();
  if (existing?.pid) {
    throw new Error(`Server already running for run ${existing.runId} on port ${existing.port}. Run cleanup first.`);
  }

  const serveDir = pageDir(page);
  const child = spawn('npx', ['serve', serveDir, '-l', String(port), '--no-clipboard'], {
    cwd: REPO_ROOT,
    stdio: 'ignore',
    detached: true
  });

  const ready = await waitForPort(port);
  if (!ready) {
    child.kill('SIGTERM');
    throw new Error(`Server did not become ready on port ${port}`);
  }

  const state = {
    runId: runId(),
    pid: child.pid,
    port,
    page,
    serveDir,
    baseUrl: baseUrlForPort(port),
    startedAt: new Date().toISOString()
  };
  await saveState(state);

  child.unref();

  console.log(JSON.stringify({ ok: true, ...state }, null, 2));
}

async function cmdDoctor() {
  const state = await loadState();
  if (!state) {
    console.log(JSON.stringify({ ok: false, reason: 'no_state', message: 'No verification server running. Run launch first.' }));
    process.exit(1);
  }

  const checks = [];
  let ok = true;

  try {
    process.kill(state.pid, 0);
    checks.push({ name: 'process', ok: true, pid: state.pid });
  } catch {
    checks.push({ name: 'process', ok: false, pid: state.pid });
    ok = false;
  }

  try {
    const res = await fetch(`${state.baseUrl}/`);
    const text = await res.text();
    checks.push({
      name: 'index',
      ok: res.ok && text.includes('<!DOCTYPE html>'),
      status: res.status,
      hasLeadForm: text.includes('id="leadForm"')
    });
    if (!res.ok || !text.includes('id="leadForm"')) ok = false;
  } catch (err) {
    checks.push({ name: 'index', ok: false, error: String(err.message) });
    ok = false;
  }

  const result = {
    ok,
    runId: state.runId,
    baseUrl: state.baseUrl,
    page: state.page,
    port: state.port,
    checks
  };
  console.log(JSON.stringify(result, null, 2));
  if (!ok) process.exit(1);
}

async function getBrowser(baseUrl) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  await context.route(`**/${FUB_PROXY_HOST}/**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, personId: 'verify-dry-run', dryRun: true })
    });
  });

  const page = await context.newPage();
  return { browser, context, page, baseUrl };
}

async function cmdFetch(args) {
  const state = await loadState();
  if (!state) throw new Error('No server running. Run launch first.');
  const fetchPath = args.path || args._[1];
  if (!fetchPath) throw new Error('Usage: fetch --path /llms.txt');

  const res = await fetch(`${state.baseUrl}${fetchPath}`);
  const body = await res.text();
  const out = {
    ok: res.ok,
    status: res.status,
    path: fetchPath,
    contentType: res.headers.get('content-type'),
    bodyLength: body.length,
    bodyPreview: body.slice(0, 200)
  };
  console.log(JSON.stringify(out, null, 2));
  if (!res.ok) process.exit(1);
  return body;
}

async function cmdBrowser(args) {
  const state = await loadState();
  if (!state) throw new Error('No server running. Run launch first.');

  const sub = args._[0] || args.subcommand;
  const outPath = args.path;
  const { browser, page } = await getBrowser(state.baseUrl);

  try {
    if (sub === 'goto') {
      const target = args.url || '/';
      await page.goto(`${state.baseUrl}${target}`, { waitUntil: 'domcontentloaded' });
      console.log(JSON.stringify({ ok: true, url: page.url(), title: await page.title() }));
    } else if (sub === 'click') {
      if (args.role && args.name) {
        await page.getByRole(args.role, { name: args.name }).click();
      } else if (args.selector) {
        await page.locator(args.selector).click();
      } else {
        throw new Error('click requires --role and --name or --selector');
      }
      console.log(JSON.stringify({ ok: true, action: 'click' }));
    } else if (sub === 'fill') {
      const selector = args.selector || `#${args.id}`;
      await page.locator(selector).fill(args.value || '');
      console.log(JSON.stringify({ ok: true, action: 'fill', selector }));
    } else if (sub === 'screenshot') {
      if (!outPath) throw new Error('screenshot requires --path');
      await mkdir(path.dirname(outPath), { recursive: true });
      await page.screenshot({ path: outPath, fullPage: args.full === 'true' });
      console.log(JSON.stringify({ ok: true, path: outPath }));
    } else if (sub === 'snapshot') {
      if (!outPath) throw new Error('snapshot requires --path');
      await mkdir(path.dirname(outPath), { recursive: true });
      const aria = await page.locator('body').ariaSnapshot();
      await writeFile(outPath, aria);
      console.log(JSON.stringify({ ok: true, path: outPath }));
    } else if (sub === 'text') {
      const selector = args.selector || 'body';
      const text = await page.locator(selector).innerText();
      console.log(text);
    } else {
      throw new Error(`Unknown browser subcommand: ${sub}`);
    }
  } finally {
    await browser.close();
  }
}

async function driveOffmarketLeadForm(state, evidenceDir) {
  await mkdir(evidenceDir, { recursive: true });
  const { browser, page } = await getBrowser(state.baseUrl);
  const log = [];

  try {
    await page.goto(state.baseUrl, { waitUntil: 'domcontentloaded' });
    log.push({ step: 'load', title: await page.title() });

    const heroCta = page.getByRole('link', { name: 'Get Private Access' });
    await heroCta.click();
    await page.waitForTimeout(400);
    const formBox = await page.locator('#leadForm').boundingBox();
    log.push({ step: 'hero-cta-scroll', formVisible: !!formBox });

    await page.locator('#firstName').fill('Verify');
    await page.locator('#lastName').fill('Agent');
    await page.locator('#email').fill('verify-agent@example.com');
    await page.locator('#phone').fill('(925) 555-0199');
    await page.locator('#consent').check();
    log.push({ step: 'fill-form', ok: true });

    await page.locator('#submitBtn').click();
    await page.waitForSelector('#successState', { state: 'visible', timeout: 10000 });
    const successText = await page.locator('#successState h3').innerText();
    log.push({ step: 'submit-dry-run', successHeading: successText });

    const formHidden = await page.locator('#leadForm').isHidden();
    log.push({ step: 'form-hidden', ok: formHidden });

    const screenshotPath = path.join(evidenceDir, 'offmarket-lead-form-success.png');
    const snapshotPath = path.join(evidenceDir, 'offmarket-lead-form-success.aria.txt');
    const logPath = path.join(evidenceDir, 'offmarket-lead-form-log.json');

    await page.screenshot({ path: screenshotPath, fullPage: false });
    await writeFile(snapshotPath, await page.locator('body').ariaSnapshot());
    await writeFile(logPath, JSON.stringify({ feature: 'offmarket-lead-form', baseUrl: state.baseUrl, steps: log }, null, 2));

    const proof = {
      ok: successText.includes("You're on the list") && formHidden,
      feature: 'offmarket-lead-form',
      evidenceDir,
      artifacts: [screenshotPath, snapshotPath, logPath]
    };
    console.log(JSON.stringify(proof, null, 2));
    if (!proof.ok) process.exit(1);
  } finally {
    await browser.close();
  }
}

async function driveSharedPageShell(state, evidenceDir) {
  await mkdir(evidenceDir, { recursive: true });
  const { browser, page } = await getBrowser(state.baseUrl);

  try {
    await page.goto(state.baseUrl, { waitUntil: 'domcontentloaded' });
    const navLogo = page.getByRole('link', { name: /BrightWork Realty/ });
    const phone = page.getByRole('link', { name: '(925) 200-6000' });
    const strip = page.locator('.smart-way-strip, #smartWayStrip');

    const proof = {
      ok: (await navLogo.count()) > 0 && (await phone.count()) > 0 && (await strip.count()) > 0,
      feature: 'shared-page-shell',
      navLogo: (await navLogo.count()) > 0,
      phoneLink: (await phone.count()) > 0,
      smartWayStrip: (await strip.count()) > 0
    };

    const screenshotPath = path.join(evidenceDir, 'shared-page-shell.png');
    await page.screenshot({ path: screenshotPath });
    proof.artifacts = [screenshotPath];
    console.log(JSON.stringify(proof, null, 2));
    if (!proof.ok) process.exit(1);
  } finally {
    await browser.close();
  }
}

async function driveAgentDiscoverability(state, evidenceDir) {
  await mkdir(evidenceDir, { recursive: true });
  const results = [];

  for (const p of ['/llms.txt', '/agents.json', '/robots.txt']) {
    const res = await fetch(`${state.baseUrl}${p}`);
    const body = await res.text();
    const entry = { path: p, status: res.status, ok: res.ok, bodyLength: body.length };
    if (p === '/agents.json') {
      const json = JSON.parse(body);
      entry.protocolVersion = json.protocolVersion;
      entry.ok = res.ok && json.protocolVersion && json.program;
    }
    if (p === '/llms.txt') {
      entry.ok = res.ok && body.startsWith('# ') && body.includes('BrightWork');
    }
    if (p === '/robots.txt') {
      entry.ok = res.ok && body.includes('User-agent:');
    }
    results.push(entry);
    const outFile = path.join(evidenceDir, p.replace(/\//g, '_').replace(/^_/, ''));
    await writeFile(outFile, body);
  }

  const proof = {
    ok: results.every((r) => r.ok),
    feature: 'agent-discoverability',
    results,
    evidenceDir
  };
  console.log(JSON.stringify(proof, null, 2));
  if (!proof.ok) process.exit(1);
}

async function driveProgramCatalog(evidenceDir) {
  await mkdir(evidenceDir, { recursive: true });
  const port = Number(process.env.BW_VERIFY_CATALOG_PORT || 4174);
  const results = [];

  for (const program of PROGRAM_PAGES) {
    const serveDir = pageDir(program);
    const child = spawn('npx', ['serve', serveDir, '-l', String(port), '--no-clipboard'], {
      cwd: REPO_ROOT,
      stdio: 'ignore',
      detached: true
    });
    child.unref();
    const ready = await waitForPort(port, 20000);
    if (!ready) {
      child.kill('SIGTERM');
      results.push({ program, ok: false, error: 'server_not_ready' });
      continue;
    }

    try {
      const res = await fetch(`${baseUrlForPort(port)}/`);
      const html = await res.text();
      results.push({
        program,
        ok: res.ok && html.includes('id="leadForm"') && html.includes('BrightWork'),
        status: res.status,
        hasLeadForm: html.includes('id="leadForm"')
      });
    } catch (err) {
      results.push({ program, ok: false, error: String(err.message) });
    }

    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
  }

  const logPath = path.join(evidenceDir, 'program-catalog.json');
  await writeFile(logPath, JSON.stringify(results, null, 2));
  const proof = { ok: results.every((r) => r.ok), feature: 'program-catalog', results, logPath };
  console.log(JSON.stringify(proof, null, 2));
  if (!proof.ok) process.exit(1);
}

async function cmdDrive(args) {
  const feature = args.feature || args._[1];
  const evidenceDir = path.resolve(
    args['evidence-dir'] || path.join(SKILL_ROOT, 'evidence', `proof-${runId()}`)
  );

  if (feature === 'offmarket-lead-form') {
    const state = await loadState();
    if (!state) throw new Error('No server running. Run launch --page offmarket first.');
    await driveOffmarketLeadForm(state, evidenceDir);
  } else if (feature === 'shared-page-shell') {
    const state = await loadState();
    if (!state) throw new Error('No server running. Run launch first.');
    await driveSharedPageShell(state, evidenceDir);
  } else if (feature === 'agent-discoverability') {
    const state = await loadState();
    if (!state) throw new Error('No server running. Run launch first.');
    await driveAgentDiscoverability(state, evidenceDir);
  } else if (feature === 'program-catalog') {
    await driveProgramCatalog(evidenceDir);
  } else {
    throw new Error(`Unknown feature: ${feature}. See features/ in the verification skill.`);
  }
}

async function cmdCleanup() {
  const state = await loadState();
  if (state?.pid) {
    try {
      process.kill(state.pid, 'SIGTERM');
    } catch {
      // already dead
    }
  }
  const { dir } = statePath();
  if (existsSync(dir)) {
    await rm(dir, { recursive: true, force: true });
  }
  console.log(JSON.stringify({ ok: true, cleaned: true, evidencePreserved: true }));
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  switch (command) {
    case 'launch':
      await cmdLaunch(args);
      break;
    case 'doctor':
      await cmdDoctor();
      break;
    case 'drive':
      await cmdDrive(args);
      break;
    case 'browser':
      args._ = args._;
      await cmdBrowser(args);
      break;
    case 'fetch':
      await cmdFetch(args);
      break;
    case 'cleanup':
      await cmdCleanup();
      break;
    default:
      console.error(`Usage: control-brightwork.mjs <launch|doctor|drive|browser|fetch|cleanup> [options]

Commands:
  launch --page <folder> [--port 4173]   Start local static server for one program folder
  doctor                                 Health-check the launched instance
  drive --feature <id> [--evidence-dir]  Run a mapped feature recipe
  browser goto|click|fill|screenshot|snapshot  Low-level Playwright helpers
  fetch --path </llms.txt>               HTTP fetch against the launched instance
  cleanup                                Stop server and remove /tmp state (keeps evidence)
`);
      process.exit(command ? 1 : 0);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(JSON.stringify({ ok: false, error: err.message }));
    process.exit(1);
  });
