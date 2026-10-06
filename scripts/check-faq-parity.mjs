#!/usr/bin/env node
/**
 * Verifies visible FAQ text matches FAQPage JSON-LD on each landing page that has both.
 * Normalization: strip HTML tags from visible answers, collapse whitespace, trim.
 * Exit 0 if all match; exit 1 and print mismatches otherwise.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const FAQ_PAGES = [
  'offmarket/index.html',
  'buybefore/index.html',
  'quiet/index.html',
  'relaunch/index.html',
  'brightflip/index.html',
  'finaloffer/index.html',
  'invest/index.html',
  'seniors/index.html',
  'seniors/workshop/index.html',
];

function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      /* skip malformed blocks */
    }
  }
  return blocks;
}

function faqPageFromHtml(html) {
  for (const block of extractJsonLdBlocks(html)) {
    if (block['@type'] === 'FAQPage') return block;
  }
  return null;
}

function visibleFaqSection(html) {
  const wrap = html.match(/<div class="faq-wrap">([\s\S]*?)<\/div>\s*<\/section>/);
  if (wrap) return wrap[1];
  const section = html.match(
    /<section class="section section-light">[\s\S]*?<div class="faq-section">([\s\S]*?)<\/div>\s*<\/section>/
  );
  if (section) return section[1];
  return null;
}

function visibleFaqPairs(html) {
  const inner = visibleFaqSection(html);
  if (!inner) return null;
  const pairs = [];
  const itemRe = /<div class="faq-item[^"]*">\s*<h3>([^<]*)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = itemRe.exec(inner)) !== null) {
    pairs.push({
      question: m[1].trim(),
      answer: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    });
  }
  return pairs;
}

let failed = false;

for (const rel of FAQ_PAGES) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING ${rel}`);
    failed = true;
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const faqLd = faqPageFromHtml(html);
  const visible = visibleFaqPairs(html);

  if (!faqLd) {
    console.error(`${rel}: no FAQPage JSON-LD`);
    failed = true;
    continue;
  }
  if (!visible || visible.length === 0) {
    console.error(`${rel}: no visible FAQ items`);
    failed = true;
    continue;
  }

  const entities = faqLd.mainEntity || [];
  if (entities.length !== visible.length) {
    console.error(
      `${rel}: count mismatch (JSON-LD ${entities.length}, visible ${visible.length})`
    );
    failed = true;
    continue;
  }

  let pageOk = true;
  for (let i = 0; i < entities.length; i++) {
    const ent = entities[i];
    const vis = visible[i];
    const ldQ = (ent.name || '').trim();
    const ldA = (ent.acceptedAnswer?.text || '').replace(/\s+/g, ' ').trim();
    if (ldQ !== vis.question) {
      console.error(`${rel} Q${i + 1}: question mismatch`);
      console.error(`  JSON-LD: ${ldQ}`);
      console.error(`  visible: ${vis.question}`);
      pageOk = false;
      failed = true;
    }
    if (ldA !== vis.answer) {
      console.error(`${rel} A${i + 1}: answer mismatch`);
      console.error(`  JSON-LD: ${ldA.slice(0, 140)}...`);
      console.error(`  visible: ${vis.answer.slice(0, 140)}...`);
      pageOk = false;
      failed = true;
    }
  }
  if (pageOk) {
    console.log(`OK ${rel} (${visible.length} Q&A)`);
  }
}

process.exit(failed ? 1 : 0);
