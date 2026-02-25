# PAPER DREAM

## Overview

Paper Dream is a Japanese-language card game creation tool that lets users design, balance, preview, and distribute custom trading card games. The app has three main modules:

1. **創作 (Deckbuilding)** - Card creation with AI-powered balance suggestions via Anthropic Claude
2. **出力 (Visual Preview)** - Print-ready card preview and layout
3. **配信 (Distribution)** - Card game publishing/sales (placeholder, not yet implemented)

The app supports any card game type through a flexible Game + Card architecture with JSON attributes. Currently supports TCG (Trading Card Game) and PCG (Party Card Game) with dedicated input forms and card previews.

The app features a cyber/fantasy TCG visual theme with switchable color themes (white, black, hybrid), animated card previews with foil effects, and real-time AI balance analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with routes: `/`, `/create`, `/create/:id`, `/preview`, `/distribute`
- **State Management**: TanStack React Query for server state, React useState for local form state
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations**: Framer Motion for card flips, panel transitions, and page animations
- **Styling**: Tailwind CSS with CSS custom properties for theming. Three theme modes (white/black/hybrid) controlled via `use-theme` hook that dynamically updates CSS variables on the root element
- **Fonts**: Orbitron (display/headers), Rajdhani (body), Cinzel (card text) — loaded from Google Fonts
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Backend
- **Framework**: Express.js on Node with TypeScript, run via `tsx`
- **API Design**: REST endpoints defined in `shared/routes.ts` with Zod schemas for input validation and response types
- **AI Integration**: Anthropic Claude SDK for card balance suggestions. Uses Replit AI Integrations environment variables (`AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`)
- **Dev Server**: Vite dev server middleware integrated into Express during development; static file serving in production
- **Build**: Custom build script (`script/build.ts`) using Vite for client and esbuild for server, outputting to `dist/`

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect, with relations
- **Connection**: `pg` Pool via `DATABASE_URL` environment variable
- **Schema**: Defined in `shared/schema.ts` — shared between client and server
- **Design**: Simple 2-table structure (Game + Card) with JSON attributes for game-type flexibility
- **Tables**:
  - `games` — id (serial PK), title (text), description (text, nullable), created_at (timestamp), updated_at (timestamp)
  - `cards` — id (serial PK), game_id (integer FK → games.id, CASCADE delete), name (text), image_url (text, default ""), front_image_url (text, default ""), back_image_url (text, default ""), width (real, default 63), height (real, default 88), order (integer, default 0), description (text, nullable), attributes (jsonb, nullable), created_at (timestamp), updated_at (timestamp)
- **Indexes**: game_id (B-tree), order (B-tree) on cards table
- **Attributes JSON Examples**:
  - TCG: `{ "type": "monster", "attack": 6, "hp": 5, "effect": "相手のHPを2減らす" }`
  - PCG: `{ "type": "action", "action": "全員1回休み", "effect": "...", "difficulty": "normal", "playerCount": "3〜6人", "winCondition": "...", "layout": { "textSize": "medium", "backgroundColor": "#1e3a5f", "fontFamily": "gothic", "textColor": "#ffffff", "header": { "backgroundColor": "#1e40af", "textColor": "#ffffff", "borderRadius": "medium" }, "footer": { "backgroundColor": "#1e3a8a", "textColor": "#ffffff", "visible": true } } }`
- **Migrations**: Use `drizzle-kit push` (`npm run db:push`) to sync schema to database

### API Endpoints
- `GET /api/games` — List all games (ordered by updatedAt desc)
- `GET /api/games/:id` — Get a specific game
- `POST /api/games` — Create a new game (title, description)
- `PUT /api/games/:id` — Update a game
- `DELETE /api/games/:id` — Delete a game (cascades to cards)
- `GET /api/games/:id/cards` — List cards for a game (ordered by order asc)
- `POST /api/games/:id/cards` — Create a card in a game (name, attributes, etc.)
- `PUT /api/cards/:id` — Update a card
- `DELETE /api/cards/:id` — Delete a card
- `POST /api/upload` — Upload image file (multipart, field "file", max 10MB, JPEG/PNG/GIF/WebP/SVG)
- `POST /api/balance/suggest` — AI balance suggestion for card stats (TCG only)

### Key Design Decisions
- **Game + Card architecture**: A Game contains multiple Cards. Game-type-specific data (TCG stats, PCG actions) is stored in the `attributes` JSONB column, allowing any card game type
- **Shared types between client/server**: The `shared/` directory contains schema definitions, route contracts, and Zod validators used by both sides, preventing type drift
- **No authentication**: Currently no auth system — all data is shared/public
- **Storage abstraction**: `IStorage` interface in `server/storage.ts` allows swapping storage implementations
- **Replit AI Integrations**: Uses pre-configured Anthropic batch processing utilities in `server/replit_integrations/` for rate limiting and retries

## External Dependencies

- **Database**: PostgreSQL (required, connected via `DATABASE_URL` environment variable)
- **AI Service**: Anthropic Claude API via Replit AI Integrations (`AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`)
- **Google Fonts**: Cinzel, Orbitron, Rajdhani, Libre Baskerville, Playfair Display, DM Sans, Fira Code, Geist Mono, Architects Daughter (loaded via CDN in index.html and CSS)
- **No other external services**: No auth providers, payment processors, or third-party APIs beyond the above
