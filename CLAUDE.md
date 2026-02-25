# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Paper Dream** (ペーパードリーム) is a Japanese-language custom trading card game creation tool with three modules:
- **創作 (Deckbuilding)** — Card creation with AI-powered balance suggestions
- **出力 (Visual Preview)** — Print-ready card preview and layout
- **配信 (Distribution)** — Placeholder, not yet implemented

## Commands

```bash
# Development (Express + Vite dev middleware on port 5000)
npm run dev

# Type check
npm run check

# Build (Vite for client → dist/public, esbuild for server → dist/index.cjs)
npm run build

# Production
npm start

# Sync DB schema to PostgreSQL
npm run db:push
```

## Required Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Anthropic API key
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Anthropic base URL (Replit AI Integrations format)

## Architecture

### Directory Structure

```
shared/          # Types, Zod schemas, route contracts shared between client & server
  schema.ts      # Drizzle table definitions + inferred TS types + Zod validators
  routes.ts      # Route path constants
  models/        # Additional shared models

server/
  index.ts       # Express app entry, middleware, error handler, Vite integration
  routes.ts      # All API route handlers
  storage.ts     # IStorage interface + DrizzleStorage implementation
  db.ts          # Drizzle pg Pool connection
  replit_integrations/  # Anthropic batch processing utilities (rate limiting, retries)

client/src/
  App.tsx        # Wouter router setup, QueryClientProvider, ThemeSwitcher overlay
  pages/         # Home, Creator, PrintPreview, Distribution, not-found
  components/    # Header, CardPreview, InputForm, PCGInputForm, AIPanel, ThemeSwitcher
  hooks/         # use-cards.ts (TanStack Query wrappers), use-theme.ts, use-mobile.tsx
  lib/           # queryClient setup
```

### Key Patterns

**Shared types**: `shared/schema.ts` is the single source of truth for DB schema, TypeScript types (`Game`, `Card`, `InsertGame`, `InsertCard`), and Zod validators. Both client and server import from `@shared/schema`.

**Storage abstraction**: `IStorage` interface in `server/storage.ts` wraps all DB operations. The `DrizzleStorage` class is the only implementation. All route handlers call `storage.*` methods, never Drizzle directly.

**Game type flexibility**: Card game-specific data (TCG stats, PCG actions, layout config) lives in the `attributes` JSONB column on `cards`. The `InputForm` handles TCG cards; `PCGInputForm` handles PCG cards. Card previews branch on game type.

**Theming**: Three modes (white/black/hybrid) managed by `use-theme.ts`, which writes CSS custom properties directly to `document.documentElement`. No CSS-in-JS.

**Dev server**: In development, Vite middleware is mounted on the same Express server that serves the API. In production, `server/static.ts` serves `dist/public` statically.

### Path Aliases (Vite + tsconfig)

- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`
