#!/usr/bin/env node
/**
 * Smoke test program-agent-worker markdown negotiation and Link headers.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../shared/program-agent-worker.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'offmarket');

const env = {
  ASSETS: {
    fetch(request) {
      const url = new URL(request.url);
      let path = url.pathname;
      if (path === '/') path = '/index.html';
      const filePath = join(ROOT, path.replace(/^\//, '') || 'index.html');
      const body = readFileSync(filePath);
      const type = path.endsWith('.md')
        ? 'text/markdown; charset=utf-8'
        : path.endsWith('.html')
          ? 'text/html; charset=utf-8'
          : 'application/octet-stream';
      return new Response(body, { status: 200, headers: { 'Content-Type': type } });
    },
  },
};

const origin = 'https://offmarket.brightworkrealty.com';

async function run() {
  const htmlReq = new Request(`${origin}/`, {
    headers: { Accept: 'text/html' },
  });
  const htmlRes = await worker.fetch(htmlReq, env);
  console.log('HTML Link:', htmlRes.headers.get('Link'));
  console.log('HTML Vary:', htmlRes.headers.get('Vary'));

  const mdReq = new Request(`${origin}/`, {
    headers: { Accept: 'text/markdown' },
  });
  const mdRes = await worker.fetch(mdReq, env);
  console.log('MD Content-Type:', mdRes.headers.get('Content-Type'));
  console.log('MD Vary:', mdRes.headers.get('Vary'));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
