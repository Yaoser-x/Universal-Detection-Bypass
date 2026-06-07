# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Check

```bash
# Build userscript from modules (src/ → dist/)
node scripts/build.mjs

# Build + syntax validation
npm run check
```

No npm dependencies — build uses only Node.js built-ins (`node:fs/promises`, `node:path`, `node:url`).

## Architecture

This is a Tampermonkey/userscript project. Source modules in `src/` are concatenated by `scripts/build.mjs` into a single IIFE-wrapped `dist/Universal-Detection-Bypass.user.js` for browser installation. No bundler, no transpilation.

**Module system**: Each module calls `registerModule({ name, init(ctx) })` at load time. The boot sequence calls `initAllModules()` which iterates and invokes each `init(ctx)`. The `ctx` object provides `{ log, debug, CONFIG }`.

**Build order matters**: `scripts/build.mjs` reads `src/core/*.js` first (sorted alphabetically), then `src/modules/*.js` (sorted alphabetically), then wraps everything in an IIFE. The `{{VERSION}}` placeholder in `src/core/config.js` is replaced with `package.json` version at build time.

**Version sync**: `package.json` version must match `// @version` in `src/main.js`. The build script enforces this.

## Commit Convention

```
Type: v版本 中文描述 — 具体改动1+改动2+改动3
```

Types: `Feat`, `Fix`, `Chore`, `Style`, `Refactor`, `Perf`. First letter capitalized. Chinese descriptions.

## Version Release Flow

1. Update `// @version` in `src/main.js`
2. Update `version` in `package.json`
3. Update `CHANGELOG.md` (Keep a Changelog format)
4. Push to `main` — CI auto-builds, tags, and creates GitHub Release

## Adding a New Module

Create `src/modules/<name>.js` with a `registerModule()` call. No other files need modification — the build script auto-discovers all `.js` files in `src/modules/`.

## CI/CD

`.github/workflows/release.yml`: On push to `main`/`dev`, runs `node scripts/build.mjs`, validates syntax and metadata, extracts version from the built output, then creates a GitHub Release (main) or uploads artifact (dev).
