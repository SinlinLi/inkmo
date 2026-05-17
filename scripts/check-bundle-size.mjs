#!/usr/bin/env node
// Enforce first-paint bundle-size budget after `vite build`.
//
// We only count assets shipped on initial page load (Vite's hashed output in
// dist/assets/). The dist/vditor/ tree holds Vditor's lazy plugins
// (mermaid, mathjax, plantuml, smiles-drawer) that are fetched on demand —
// they should not count against the first-paint budget.

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dist = resolve(__dirname, '..', 'dist');
const firstPaintDir = join(dist, 'assets');

const BUDGETS = {
  js_first_paint_kb: 600,
  total_js_kb: 800,
  total_css_kb: 80,
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

if (!statSync(firstPaintDir, { throwIfNoEntry: false })) {
  console.error(`dist/assets/ missing — did vite build run?`);
  process.exit(1);
}

const files = walk(firstPaintDir);
let totalJsGzip = 0;
let totalCssGzip = 0;
let largestJsGzip = 0;
let largestJsName = '';

console.log('First-paint bundle (dist/assets/):');
for (const f of files) {
  const ext = f.split('.').pop();
  if (!['js', 'css'].includes(ext)) continue;
  if (f.endsWith('.map')) continue;
  const buf = readFileSync(f);
  const gz = gzipSync(buf).length;
  const gzKb = +(gz / 1024).toFixed(1);
  console.log(`  ${f.replace(dist + '/', '').padEnd(60)} ${gzKb.toString().padStart(8)} KB gz`);
  if (ext === 'js') {
    totalJsGzip += gz;
    if (gz > largestJsGzip) {
      largestJsGzip = gz;
      largestJsName = f;
    }
  } else {
    totalCssGzip += gz;
  }
}

const largestKb = +(largestJsGzip / 1024).toFixed(1);
const totalJsKb = +(totalJsGzip / 1024).toFixed(1);
const totalCssKb = +(totalCssGzip / 1024).toFixed(1);

console.log('');
console.log(
  `Largest JS chunk : ${largestKb} KB gz   (budget ${BUDGETS.js_first_paint_kb} KB)  ${largestJsName.replace(dist + '/', '')}`,
);
console.log(`Total JS         : ${totalJsKb} KB gz   (budget ${BUDGETS.total_js_kb} KB)`);
console.log(`Total CSS        : ${totalCssKb} KB gz   (budget ${BUDGETS.total_css_kb} KB)`);

let fail = false;
if (largestKb > BUDGETS.js_first_paint_kb) {
  console.error(`FAIL: Largest JS chunk ${largestKb} KB > ${BUDGETS.js_first_paint_kb} KB`);
  fail = true;
}
if (totalJsKb > BUDGETS.total_js_kb) {
  console.error(`FAIL: Total JS ${totalJsKb} KB > ${BUDGETS.total_js_kb} KB`);
  fail = true;
}
if (totalCssKb > BUDGETS.total_css_kb) {
  console.error(`FAIL: Total CSS ${totalCssKb} KB > ${BUDGETS.total_css_kb} KB`);
  fail = true;
}

if (fail) process.exit(1);
console.log('OK: first-paint bundle within budget.');
console.log(
  'Note: dist/vditor/ holds Vditor lazy-loaded plugins; they are excluded from this budget.',
);
