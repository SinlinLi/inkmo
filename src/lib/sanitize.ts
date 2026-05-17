// File-name sanitization for downloads, and content title derivation
// from the first H1 header in the Markdown source.

// Disallow path separators, shell metacharacters, whitespace, and control chars.
// Constructed via `new RegExp` from an escape-only string to side-step source
// encoding corruption around the literal space character.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = new RegExp('[\\\\/:*?"<>|\\s\\u0000-\\u001f]', 'g');
const TRAILING_DOTS = /[.\s]+$/;
const RESERVED_WIN = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;

export function sanitizeFilename(raw: string, fallback: string): string {
  // 1. Strip trailing dots / whitespace before any substitution.
  let name = (raw ?? '').trim().replace(TRAILING_DOTS, '');
  // 2. Replace remaining unsafe chars with underscore.
  name = name.replace(UNSAFE_CHARS, '_');
  // 3. Collapse repeated underscores and strip leading/trailing ones.
  name = name.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  if (!name) name = fallback;
  if (RESERVED_WIN.test(name)) name = `_${name}`;
  if (name.length > 80) name = name.slice(0, 80);
  return name;
}

export function deriveTitle(markdown: string): string {
  const m = markdown.match(/^\s{0,3}#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : '';
}

export function timestampSlug(d: Date = new Date()): string {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function suggestFilename(markdown: string, ext: string): string {
  const title = deriveTitle(markdown);
  const base = title
    ? sanitizeFilename(title, `untitled-${timestampSlug()}`)
    : `untitled-${timestampSlug()}`;
  return `${base}.${ext.replace(/^\./, '')}`;
}
