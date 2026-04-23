# Benev.io — Agent Guide

> **Project language**: French (UI, comments, and documentation are in French).  
> **Repository**: Full-stack web application for volunteer event management ("Plateforme de gestion de bénévoles").

---

## Project Overview

Benev.io is a platform that helps event organizers manage volunteers. It supports:

- **Organizers**: create events, edit teams and pages, manage members, set themes, configure registration rules, and handle payments for licenses.
- **Leaders (Responsables)**: manage team periods, validate subscriptions, and view volunteer lists.
- **Volunteers (Bénévoles)**: browse events, register for time slots (periods), track their subscriptions, and update their profile.

The application is built as a server-rendered full-stack app with a rich admin interface for each event.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | [SvelteKit](https://kit.svelte.dev/) v2 (full-stack, file-based routing) |
| Language | TypeScript v5 (strict mode, `verbatimModuleSyntax: true`) |
| Build Tool | Vite v5 |
| UI | Svelte v4, [Tailwind CSS](https://tailwindcss.com/) v3, [DaisyUI](https://daisyui.com/) v3 |
| Component Lib | [`fuma`](https://www.npmjs.com/package/fuma) — custom internal UI/component library (used extensively for inputs, forms, tables, icons, etc.) |
| ORM | [Prisma](https://www.prisma.io/) v5 (client + generator) with `prisma-json-types-generator` |
| Database | MySQL |
| Auth | [Lucia](https://lucia-auth.com/) v2 with `@lucia-auth/adapter-prisma` |
| OAuth Providers | GitHub, Google |
| Payments | [Stripe](https://stripe.com/) (server-side `stripe` + client-side `@stripe/stripe-js`) |
| Email | Nodemailer (SMTP via Infomaniak) |
| E2E Tests | [Playwright](https://playwright.dev/) |
| Unit Tests | [Vitest](https://vitest.dev/) with `happy-dom` |
| Runtime (Docker) | [Bun](https://bun.sh/) (`oven/bun:latest`) |
| Deployment | Docker image built via GitHub Actions, pushed to GHCR |

---

## Project Structure

```
/
├── prisma/
│   └── schema.prisma          # Database schema (MySQL)
├── src/
│   ├── app.html               # HTML template (lang="fr")
│   ├── app.d.ts               # Global App types + Lucia/PrismaJson types
│   ├── app.css                # Tailwind directives + custom component classes
│   ├── hooks.server.ts        # Auth middleware (Lucia session handling)
│   ├── routes/                # SvelteKit routes (file-based)
│   │   ├── (home)/            # Landing/layout group (marketing, auth, me, root)
│   │   ├── [eventId]/         # Event-specific pages (public + admin)
│   │   ├── api/               # Global API routes (ical, scrapers, prospects)
│   │   ├── media/             # Media file serving
│   │   └── sitemap.xml/       # SEO sitemap
│   ├── lib/
│   │   ├── server/            # Server-only modules (auth, prisma, permissions, email, stripe, etc.)
│   │   ├── models/            # Zod validation schemas (used with fuma validation)
│   │   ├── email/             # Svelte email template components
│   │   ├── member/            # Member UI components + conditions logic
│   │   ├── event/, team/, period/, subscribe/, gift/, tag/, pages/, plan/, me/, layout/, checkout/
│   │   ├── store/             # Svelte stores (ctrl, isMobile, etc.)
│   │   ├── action/            # DOM actions (autoSubmit, etc.)
│   │   ├── material/          # Material/media related helpers
│   │   ├── types/             # Shared TypeScript types
│   │   └── api.ts             # Client-side API helpers (axios + devalue)
│   └── tests/                 # Vitest unit tests
├── tests/                     # Playwright E2E tests
├── media/                     # Uploaded media storage (local filesystem)
├── dumps/                     # SQL dumps
├── Dockerfile
├── .github/workflows/         # CI: build & push Docker image to GHCR
├── package.json
├── svelte.config.js           # Node adapter
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.mjs
├── postcss.config.cjs
├── prettier.config.cjs
├── .eslintrc.cjs
└── playwright.config.ts
```

### Route Conventions

- `(home)` — layout group for public/marketing pages, authentication, and user dashboard (`/me`).
- `[eventId]` — dynamic event slug. All event pages live here:
  - `[eventId]/[pagePath]` — public CMS-like pages for the event.
  - `[eventId]/admin/*` — organizer/admin tools (members, teams, plan, pages, theme, etc.).
  - `[eventId]/register`, `[eventId]/me`, `[eventId]/teams`, `[eventId]/subscribes` — volunteer-facing pages.
  - `[eventId]/api/*` — event-scoped REST endpoints (members, teams, tags, fields, media).
- `+layout.server.ts` / `+page.server.ts` — server `load` functions and `actions` for form handling.
- `+server.ts` — API endpoints (REST handlers: GET, POST, PATCH, DELETE).

### Key Modules

| Module | Purpose |
|--------|---------|
| `$lib/server` | Re-exports all server-only utilities. **Must only be imported in `*.server.ts`, `hooks.server.ts`, or `+server.ts` files.** |
| `$lib/server/prisma.ts` | Extended Prisma client with query middleware for event date syncing, soft deletes, and user/member data duplication. |
| `$lib/server/lucia.ts` | Lucia auth instance, GitHub/Google OAuth providers. |
| `$lib/server/permission.ts` | Role-based guards: `member`, `leader`, `admin`, `owner`, `root`, plus `leaderOfTeam`. |
| `$lib/server/member.ts` | Member profile resolution with computed values (roles, stats). |
| `$lib/server/stripe.ts` | Checkout session creation and Stripe webhook handling. |
| `$lib/server/email.ts` | SMTP transport and email rendering/sending. |
| `$lib/models` | Zod schemas for form validation (used with `fuma/validation` and `fuma/server` helpers). |
| `$lib/email` | Svelte components for transactional emails (verification, password reset, subscribe notifications, etc.). |
| `$lib/plan` | Drag-and-drop planning grid components for team/period visualization. |
| `$lib/pages` | CMS page rendering, suggestions, and nested path logic. |

---

## Build and Development Commands

Use **pnpm** (lockfile is `pnpm-lock.yaml`). `.npmrc` enforces `engine-strict=true`.

```bash
# Install dependencies
pnpm install

# Development server (Vite, host enabled)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Prisma
pnpm generate          # Generate Prisma client
pnpm migrate           # Run migrations in dev mode
pnpm migrate:deploy    # Run migrations in production
pnpm studio            # Open Prisma Studio

# Testing
pnpm vitest            # Unit tests (Vitest + happy-dom)
pnpm test              # E2E tests (Playwright with UI)
pnpm test-gen          # Generate Playwright tests via codegen

# Linting and formatting
pnpm lint              # Prettier check + ESLint
pnpm format            # Prettier write
pnpm check             # Svelte type-checking
pnpm check:watch       # Svelte type-checking in watch mode

# Production start (requires build first)
pnpm start             # Runs prisma migrate deploy then node ./build/index.js

# Stripe webhook forwarding (dev)
pnpm dev:stripe        # Forward Stripe webhooks to localhost
```

### Important Build Notes

- `postinstall` runs `prisma generate` automatically.
- `prestart` runs `prisma migrate deploy` before starting the Node server.
- The SvelteKit compiler enables `accessors` when `process.env.TEST` is set (for testability).
- Vite allows filesystem access to the `media/` directory for serving uploads.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
ROOT_USER="admin@example.com"              # Root user email (full access)
DATABASE_URL="mysql://user:pass@host:3306/db"
MEDIA_DIR="./media"                        # Local media storage path
BODY_SIZE_LIMIT=0                          # Disable body size limit for uploads

# Email (SMTP)
SMTP_HOST="mail.infomaniak.com"
SMTP_PORT="465"
SMTP_USER="salut@benev.io"
SMTP_PASS="..."

# OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Monetization / Stripe
PUBLIC_FREE_EVENT_MAX_MEMBERS=20
EXCHANGE_RATE_KEY="..."
PRIVATE_STRIPE_KEY="..."
PUBLIC_STRIPE_KEY="..."
PRIVATE_STRIPE_WEBHOOK_KEY="..."
LICENCE_EVENT_PRICE="price_..."
LICENCE_MEMBER_PRICE="price_..."
```

All `PUBLIC_*` variables are exposed to the browser. All others are server-only (`$env/dynamic/private`).

---

## Code Style Guidelines

The project follows these conventions:

- **Formatter**: Prettier v2 with `prettier-plugin-svelte`.
  - Indentation: **tabs** (`useTabs: true`)
  - Quotes: **single quotes**
  - Semicolons: **none** (`semi: false`)
  - Trailing commas: **ES5** (`trailingComma: 'es5'`)
  - Print width: **100**
- **Linter**: ESLint with `@typescript-eslint`, `plugin:svelte/recommended`, and `prettier`.
- **Imports**: Use `verbatimModuleSyntax: true`. Always use `import type` for type-only imports.
- **Language**: UI text and most comments are in **French**.

### Naming and Patterns

- Server-only files that must not run in the browser are placed in `$lib/server/` or named `*.server.ts`.
- Validation schemas live in `$lib/models/` and are named like `modelUserCreate`, `modelEventUpdate`, etc.
- Form actions use `formAction` from `fuma/server` paired with Zod schemas from `fuma/validation`.
- API routes (`+server.ts`) return JSON. Client-side API consumption in `$lib/api.ts` uses `axios` + `devalue` for serialization.
- `fuma` UI components are imported directly from `'fuma'`; server helpers from `'fuma/server'`; validation from `'fuma/validation'`.

---

## Testing Instructions

### Unit Tests (Vitest)

- Config: `vite.config.ts`
- Environment: `happy-dom`
- Test files: `src/**/*.{test,spec}.{js,ts}`
- Existing tests: `src/tests/index.test.ts` (mounts Svelte components for DOM assertions).

```bash
pnpm vitest
```

### E2E Tests (Playwright)

- Config: `playwright.config.ts`
- Test directory: `tests/`
- The Playwright config starts a production build (`npm run build && npm run preview`) on port 4173 before running tests.
- Tests use fixture helpers (`tests/user.ts`, `tests/event.ts`, `tests/member.ts`) to create isolated test users and events with unique CUIDs.

```bash
pnpm test        # UI mode
pnpm test-gen    # Codegen against dev server (localhost:5173)
```

### Running E2E Against Dev Server

For faster iteration, you can run the dev server (`pnpm dev`) and use Playwright codegen or UI mode against `localhost:5173`.

---

## Database and Migrations

- **Provider**: MySQL
- **ORM**: Prisma
- **Key models**: `User`, `Member`, `Event`, `Team`, `Period`, `Subscribe`, `Page`, `Field`, `Gift`, `Badge`, `Media`, `Message`, `Prospect`, `Licence`, `Checkout`
- Prisma client is extended with custom query middleware in `$lib/server/prisma.ts`:
  - Event soft deletes (renames ID/name instead of hard delete).
  - Event date auto-sync when periods are created/updated/deleted.
  - User data is duplicated onto linked `Member` records on create/update.

Run migrations before starting the app:

```bash
pnpm migrate:deploy
```

---

## Authentication and Authorization

- Sessions are handled by **Lucia v2** with a Prisma adapter.
- Users can authenticate via:
  - Email + password (local)
  - GitHub OAuth
  - Google OAuth
- Role hierarchy within an event: `member` → `leader` → `admin` → `owner`.
- A special `ROOT_USER` email bypasses all permission checks.
- Permission checks are done via `permission.*` helpers from `$lib/server/permission.ts` in server `load` and `actions`.
- Member roles are computed dynamically (e.g., `isAdmin`, `leaderOf` teams) and merged into `MemberWithComputedValues`.

---

## Payments and Licensing

- Events and members require paid **licenses** beyond free tiers.
- Stripe is used for checkout sessions and webhook validation.
- Webhook endpoint: `/me/licences/checkout/validation` (POST).
- Free tier limit: `PUBLIC_FREE_EVENT_MAX_MEMBERS` (default 20 members per event).

---

## Email System

- Emails are rendered from **Svelte components** in `$lib/email/` using `happy-dom` for SSR.
- SMTP is configured via Nodemailer.
- Transactional emails include: verification links, password reset, subscribe notifications (request/accepted/denied/cancelled), checkout validation, and prospect outreach.
- Root/admin pages under `/root/mails/*` allow previewing email templates in the browser.

---

## Media and File Storage

- Uploaded files (avatars, event backgrounds, logos, posters, badge assets) are stored on the local filesystem under `MEDIA_DIR` (default `./media`).
- Media records are tracked in the `Media` table with relations to `User`, `Event`, and `Badge`.
- The `/media/[mediaId]` route serves files.
- `sharp` is used for image processing.

---

## Security Considerations

- **Server-only imports**: Never import `$lib/server` or Prisma into client-side code. SvelteKit will error at build time if you do, but be vigilant with dynamic imports.
- **Form validation**: Always validate form data with Zod schemas via `formAction` or `parseFormData` from `fuma/server`.
- **Auth redirects**: Unauthenticated users are redirected to `/auth?redirectTo=...`. Unauthorized users get HTTP 403.
- **Stripe webhooks**: Verify webhook signatures using `PRIVATE_STRIPE_WEBHOOK_KEY`.
- **Environment secrets**: Keep all Stripe keys, SMTP passwords, and OAuth secrets in server-only env vars.
- **Soft deletes**: Events are soft-deleted by renaming their ID/name and setting `deletedAt`. This preserves referential integrity.

---

## Deployment

The project is containerized and deployed via Docker:

1. **Dockerfile**: uses `oven/bun:latest`, installs OpenSSL, installs deps with `bun`, builds the app, and runs `bun start`.
2. **GitHub Actions** (`.github/workflows/`): on every push to `main`, builds and pushes the Docker image to `ghcr.io`.
3. **Runtime**: `pnpm start` runs Prisma migrations then starts the Node server from `./build/index.js`.

---

## Useful Context for Agents

- **French-first**: All user-facing strings are in French. New UI text should be in French.
- **Fuma dependency**: The UI relies heavily on the `fuma` package. Before creating new form inputs, tables, or dialogs, check if `fuma` already exports a suitable component.
- **Event-scoped data**: Most entities (teams, members, pages, fields, gifts, badges) belong to an `Event` and queries should filter by `eventId`.
- **Computed member values**: `getMemberProfile` in `$lib/server/member.ts` enriches raw `Member` records with roles, subscription stats, and gift allocations. Prefer using this over raw Prisma queries when member context is needed.
- **Planning grid**: The volunteer schedule visualization is a custom drag-and-drop grid in `$lib/plan/`. It uses custom period stacking and scroll-centering logic.
