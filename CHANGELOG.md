# Changelog

All notable changes to this project will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] – 2026-05-17

### Added

- WYSIWYG Markdown editor based on Vditor 3, with three switchable modes (WYSIWYG / IR / SV)
- File upload (click + drag-drop) for `.md / .markdown / .txt`, with type and 5 MB size validation
- `.md` download with H1-derived filename and sanitization
- PDF export via `window.print()` and a dedicated print stylesheet (CJK-safe, searchable text, native pagination)
- Auto-saved drafts to `localStorage`, restored on next open
- Light / Dark theme that follows system preference or can be toggled manually
- Structured frontend logger with sessionStorage ring buffer (200 entries, exportable as JSONL)
- Settings dialog (theme, log level, optional math / mermaid plugins)
- Keyboard shortcuts (Alt+N / Alt+O / Ctrl+Shift+S / Ctrl+Shift+E / Ctrl+Shift+M / Ctrl+Shift+T / Ctrl+, / Ctrl+/)
- Mobile-responsive layout
- Vitest unit tests covering IO, sanitize, logger, storage, theme, modes, PDF export (93%+ line coverage on tested modules)
- Playwright E2E covering boot, file IO round-trip, PDF export trigger
- Production Docker image (Node 20 build stage → nginx 1.27 serve stage)
- nginx configuration with gzip, strict CSP, and immutable static caching
- GitHub Actions CI (lint + typecheck + unit + e2e + bundle-size budget)
- GitHub Actions Release workflow (tag → GHCR Docker image + `dist.tar.gz`)
- Bilingual README (Chinese + English), CONTRIBUTING, CHANGELOG, MIT License
