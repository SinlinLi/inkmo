#!/usr/bin/env node
// Copy Vditor distribution assets into public/vditor so they are served from the
// same origin (CSP default-src 'self'). Runs automatically before dev/build.
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

const source = join(root, 'node_modules', 'vditor', 'dist');
// Vditor constructs asset URLs as `${cdn}/dist/...` (matching the
// default unpkg.com/vditor@<version>/dist/... shape). With cdn='/vditor'
// we therefore must place the dist tree at /vditor/dist/.
const target = join(root, 'public', 'vditor', 'dist');

if (!existsSync(source)) {
  console.error('[copy-vditor-assets] vditor not installed yet — run `pnpm install` first.');
  process.exit(0); // soft-exit, don't break install
}

mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

const pkg = JSON.parse(readFileSync(join(root, 'node_modules', 'vditor', 'package.json'), 'utf-8'));
console.log(`[copy-vditor-assets] copied vditor@${pkg.version} dist -> public/vditor/`);
