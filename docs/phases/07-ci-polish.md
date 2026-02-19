# Phase 7: CI + Polish

**Goal:** Automated quality checks on every push, polished README for onboarding.

## CI Pipeline

GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push to `main` and every PR:

1. **Checkout** code
2. **Setup Node.js 22** with npm cache
3. **Install** dependencies (`npm ci`)
4. **Type-check** (`npm run typecheck`)
5. **Build** (`npm run build`)

No tests in CI yet (vitest is installed but no test files written). Add test runs as tests are written.

## README

The README covers:
- Quick setup instructions (< 5 min onboarding)
- Example commands for every entity
- All available commands in a summary table
- Build instructions for optional global install

## What's Polished

- All commands show helpful error messages when entities aren't found
- Interactive prompts kick in when flags are omitted
- Cancelling a prompt (Ctrl+C) exits cleanly with "Operation cancelled"
- `--help` works at every level without requiring database credentials
- Tables are formatted with colors and alignment
- IDs use recognizable prefixes (`co_`, `pj_`, `tl_`, etc.)

## What Could Be Added Later

- `vitest` test suite with in-memory SQLite for fast unit tests
- ESLint configuration
- Pre-commit hooks (lint-staged + husky)
- `npm run dev` without `--` separator (via bin script)
