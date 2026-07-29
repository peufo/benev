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

Product intent, audiences and design system are recorded in `PRODUCT.md` and `DESIGN.md` at the repo root. Read them before changing anything user-facing.

---

## Technology Stack

| Layer            | Technology                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Framework        | [SvelteKit](https://svelte.dev/docs/kit) v2 (full-stack, file-based routing) with **remote functions enabled**               |
| Language         | TypeScript v6 (strict mode, `verbatimModuleSyntax: true`)                                                                    |
| Build Tool       | Vite v8                                                                                                                      |
| UI               | **Svelte v5 (runes mode)**, [Tailwind CSS](https://tailwindcss.com/) **v4**, [DaisyUI](https://daisyui.com/) **v5**          |
| CSS config       | **No `tailwind.config.mjs`, no PostCSS.** Tailwind is a Vite plugin (`@tailwindcss/vite`); the theme lives in `src/app.css`. |
| Font             | [Barlow](https://fonts.google.com/specimen/Barlow) (400–800) via Google Fonts in `src/app.html`                              |
| Icons            | [Lucide](https://lucide.dev/) (`@lucide/svelte` v1) — migration from `@mdi/js` still in progress                             |
| Component Lib    | [`fuma`](https://github.com/peufo/fuma) v2, linked locally via `"fuma": "file:../fuma"` — **not an npm release**             |
| Validation       | [Zod](https://zod.dev/) v4, schemas in `$lib/models`                                                                         |
| ORM              | [Prisma](https://www.prisma.io/) v6 (client + generator) with `prisma-json-types-generator`                                  |
| Database         | MySQL                                                                                                                        |
| Auth             | [Lucia](https://lucia-auth.com/) v2 with `@lucia-auth/adapter-prisma`                                                        |
| OAuth Providers  | GitHub, Google                                                                                                               |
| Payments         | [Stripe](https://stripe.com/) (server-side `stripe` + client-side `@stripe/stripe-js`)                                       |
| Email            | Nodemailer (SMTP via Infomaniak), templates rendered with `render()` from `svelte/server`                                    |
| E2E Tests        | [Playwright](https://playwright.dev/)                                                                                        |
| Unit Tests       | [Vitest](https://vitest.dev/), `node` environment                                                                            |
| Runtime (Docker) | [Bun](https://bun.sh/) (`oven/bun:latest`)                                                                                   |
| Deployment       | Docker image built via GitHub Actions, pushed to GHCR                                                                        |

### Svelte 5 and SvelteKit experimental flags

`svelte.config.js` turns on two experimental features the codebase depends on:

- `kit.experimental.remoteFunctions: true` — required by every `*.remote.ts` file and by fuma 2's input components.
- `compilerOptions.experimental.async: true` — async SSR / `await` in components.

Code is **runes-only**: `$state`, `$derived`, `$props`, `$effect`, snippets (`{#snippet}` / `{@render}`), and event attributes (`onclick`, not `on:click`). `export let` and stores-as-component-state are legacy and should not be introduced.

---

## Project Structure

```
/
├── prisma/
│   └── schema.prisma          # Database schema (MySQL)
├── src/
│   ├── app.html               # HTML template (lang="fr"), Barlow webfont
│   ├── app.d.ts               # Global App types + Lucia/PrismaJson types
│   ├── app.css                # Tailwind v4 entry + DaisyUI theme + custom utilities
│   ├── hooks.server.ts        # Auth middleware (Lucia session handling)
│   ├── routes/                # SvelteKit routes (file-based)
│   │   ├── (home)/            # Layout group: marketing, auth, /me, /root, /terms, /contact…
│   │   ├── [eventId]/         # Event-specific pages (public + admin)
│   │   ├── api/               # Global API routes (ical, scrap-icon)
│   │   ├── lab/               # Scratch space for UI experiments
│   │   ├── media/             # Media file serving
│   │   └── sitemap.xml/       # SEO sitemap
│   ├── lib/
│   │   ├── server/            # Server-only modules (auth, prisma, permissions, email, stripe…)
│   │   ├── fuma-legacy/       # Vendored fuma 1.0.21 surface — see "Fuma" below
│   │   ├── models/            # Zod schemas (modelUserCreate, modelEventUpdate…)
│   │   ├── email/             # Svelte email template components
│   │   ├── event/, team/, period/, subscribe/, member/, gift/, tag/, pages/, plan/,
│   │   │   milestone/, view/, me/, layout/, checkout/, landing/, material/, location/
│   │   ├── seo/               # Meta tags + JSON-LD schemas
│   │   ├── constant/          # EVENT_TIER quotas and other shared constants
│   │   ├── store/             # Svelte stores (ctrl, isMobile…)
│   │   ├── action/            # DOM actions (autoSubmit…)
│   │   ├── style/             # Shared CSS (animate.css)
│   │   ├── types/             # Shared TypeScript types
│   │   └── api.ts             # Client-side API helpers (axios + devalue)
│   └── tests/                 # Vitest unit tests
├── tests/                     # Playwright E2E tests + fixtures
├── media/                     # Uploaded media storage (local filesystem)
├── dumps/                     # SQL dumps
├── PRODUCT.md                 # Product record: audiences, purpose, principles
├── DESIGN.md                  # Design system: theme tokens, type, components, rules
├── .impeccable/design.json    # Machine-readable sidecar of DESIGN.md
├── Dockerfile
├── .github/workflows/deploy.yml
├── package.json
├── svelte.config.js           # Node adapter + experimental flags
├── vite.config.ts             # Tailwind plugin, Vitest config, fs allow-list
├── tsconfig.json
├── prettier.config.cjs
├── eslint.config.js
└── playwright.config.ts
```

### Route Conventions

- `(home)` — layout group for public/marketing pages, auth, and the user dashboard.
  - `/`, `/events`, `/contact`, `/open-source`, `/terms`, `/qr`
  - `/auth` — login / account creation (`$lib/me/Login.svelte`)
  - `/me/*` — personal dashboard, events, checkouts
  - `/root/*` — superuser tools (users, events, checkouts, messages, mails preview, migrate)
  - `/token/[tokenId]/*` — email-link landings (verification, password reset)
- `[eventId]` — dynamic event slug. All event pages live here:
  - `[eventId]/[pagePath]` — public CMS-like pages for the event.
  - `[eventId]/admin/*` — organizer tools (event, members, teams, plan, pages, theme, gift, quota, subscribes, adhesion).
  - `[eventId]/register`, `[eventId]/me`, `[eventId]/teams`, `[eventId]/help`, `[eventId]/invite` — volunteer-facing pages.
  - `[eventId]/api/*` — event-scoped REST endpoints.
- `+layout.server.ts` / `+page.server.ts` — server `load` functions.
- `+server.ts` — API endpoints (REST handlers: GET, POST, PATCH, DELETE).
- `*.remote.ts` — remote functions. **This is where mutations live** (see below).

### Key Modules

| Module                      | Purpose                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `$lib/server`               | Re-exports all server-only utilities. **Must only be imported from server files.**                                   |
| `$lib/server/prisma.ts`     | Extended Prisma client with query middleware for event date syncing, soft deletes, and user/member data duplication. |
| `$lib/server/lucia.ts`      | Lucia auth instance, GitHub/Google OAuth providers.                                                                  |
| `$lib/server/permission.ts` | Role-based guards: `member`, `leader`, `admin`, `owner`, `root`, plus `leaderOfTeam`.                                |
| `$lib/server/member.ts`     | Member profile resolution with computed values (roles, stats).                                                       |
| `$lib/server/stripe.ts`     | Checkout session creation and Stripe webhook handling.                                                               |
| `$lib/server/email.ts`      | SMTP transport and email rendering/sending. Honours `EMAIL_DISABLED=true`.                                           |
| `$lib/models`               | Zod v4 schemas, consumed by `form()` remote functions.                                                               |
| `$lib/fuma-legacy`          | Vendored fuma 1 surface, to be dismantled as fuma 2 catches up.                                                      |
| `$lib/email`                | Svelte components for transactional emails.                                                                          |
| `$lib/plan`                 | Drag-and-drop planning grid for team/period visualization.                                                           |
| `$lib/pages`                | CMS page rendering, suggestions, and nested path logic.                                                              |
| `$lib/seo`                  | `defaultMetaTags`, `errorMetaTags`, `mergeMetaTags`, JSON-LD schemas. Rendered **once** in the root layout.          |
| `$lib/constant`             | `EVENT_TIER` — per-tier member quotas and Stripe price bindings.                                                     |
| `$lib/dayjs.ts`             | Pre-configured dayjs instance (relativeTime plugin + French locale).                                                 |

---

## Mutations: Remote Functions, not Form Actions

**There is not a single `export const actions` left in the repo.** Every mutation goes through a SvelteKit remote function declared in a `*.remote.ts` file (26 of them at time of writing):

```ts
// src/lib/me/user.remote.ts
import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelUserLogin } from '$lib/models'

export const loginUser = form(z.object(modelUserLogin), async ({ email, password }) => {
	/* … */
})
```

Consumed in a component by spreading `enhance` onto the `<form>`:

```svelte
<form {...loginUser.enhance(({ submit }) => handle(submit))}>
	<InputString field={loginUser.fields.email} label="Email" variant="block" />
	<button class="btn btn-primary" formaction={loginUser.action}>Se connecter</button>
</form>
```

Things to know when touching this layer:

- **`await submit()` returns a boolean.** `false` means validation failed and the issues are already rendered under the fields — do not treat it as success.
- **Thrown errors are `HttpError`, which does _not_ extend `Error`.** Use `isHttpError(err)` from `@sveltejs/kit` and read `err.body.message`. `err instanceof Error` is false and `String(err)` yields JSON.
- Uncaught exceptions in a remote function surface to the client as a generic 500. Wrap expected failures in `error(status, message)` so the UI can say something useful.
- Several remote functions can be spread onto the same `<form>`; SvelteKit runs the one whose `action` matches the pressed button's `formaction`. The **first submit button in DOM order** is what the Enter key triggers.
- `form.pending` (a counter) and `form.fields.x.value()` / `.set()` are available for loading states and cross-form value carry-over.

`fuma/server` still provides read-side helpers — `parseQuery`, `ensureFieldsWithFilterAreVisibles` — used in `load` functions. Those stay.

---

## Fuma: two import surfaces

The UI depends on a local sibling checkout at `../fuma` (`"fuma": "file:../fuma"`). Vite is configured to serve it (`server.fs.allow`) and to skip pre-bundling it (`optimizeDeps.exclude`). **Changes to fuma are picked up live; there is no publish step.**

Two surfaces coexist during the fuma 1 → 2 migration:

- **`from 'fuma'`** — fuma 2. Runes-based, remote-function-aware. `InputString`, `InputBoolean`, `InputTextarea`, `InputSelect`, `Dialog`, … Prefer this for new code.
- **`from '$lib/fuma-legacy'`** — fuma 1.0.21 vendored into the repo (`Card`, `Icon`, `Placeholder`, tables, menus…). Being dismantled: every symbol fuma 2 re-exposes should be deleted from here and re-imported from the package.

Both are still widely used, so check which one a file already imports before adding to it.

---

## Build and Development Commands

Use **Bun** (lockfile is `bun.lock`).

> ⚠️ Always write `bun run <script>`. Bare `bun build`, `bun test` and `bun check` hit Bun's own builtins, not the package.json scripts.

```bash
# Install dependencies
bun install

# Development server (Vite, host enabled)
bun run dev

# Build for production / preview it
bun run build
bun run preview

# Prisma
bun run generate          # Generate Prisma client
bun run migrate           # Run migrations in dev mode
bun run migrate:deploy    # Run migrations in production
bun run studio            # Open Prisma Studio

# Testing
bun run test:unit         # Vitest (node environment)
bun run test:e2e          # Playwright
bun run test              # Both, in that order
bun run test:ui           # Playwright UI mode
bun run test-gen          # Playwright codegen against localhost:5173

# Linting, formatting, type-checking
bun run lint              # Prettier check + ESLint
bun run format            # Prettier write
bun run check             # svelte-kit sync + svelte-check + lint
bun run check:watch       # svelte-check in watch mode

# Production start (requires build first)
bun start                 # prisma migrate deploy, then node ./build/index.js

# Stripe webhook forwarding (dev)
bun run dev:stripe        # Forward Stripe webhooks to localhost
```

### Important Build Notes

- `postinstall` runs `prisma generate` automatically.
- `prestart` runs `prisma migrate deploy` before starting the Node server.
- Vite's `server.fs.allow` covers `media/` (uploads) **and `../fuma`** (the linked component library).
- `bun run check` runs `svelte-kit sync` first: without it, `$env/dynamic` keys are untyped and `svelte-check` fails.
- `svelte-check` currently reports a standing backlog of errors, nearly all inside `$lib/fuma-legacy`. Compare against the baseline rather than expecting zero.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
ROOT_USER="admin@example.com"              # Root user email (full access)
DATABASE_URL="mysql://user:pass@host:3306/db"
MEDIA_DIR="./media"                        # Local media storage path
BODY_SIZE_LIMIT=0                          # Disable body size limit for uploads

# EMAIL
SMTP_HOST="mail.infomaniak.com"
SMTP_PORT="465"
SMTP_USER="salut@benev.io"
SMTP_PASS="..."
EMAIL_DISABLED="true"                      # Optional: log instead of sending (used in CI/E2E)

# AUTHENTICATION
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MONETISATION
PRIVATE_STRIPE_KEY="..."
PRIVATE_STRIPE_WEBHOOK_KEY="..."
PUBLIC_STRIPE_KEY="..."
PUBLIC_PRICE_STANDARD="price_..."
PUBLIC_PRICE_PREMIUM="price_..."
PUBLIC_PRICE_STANDARD_TO_PREMIUM="price_..."
```

All `PUBLIC_*` variables are exposed to the browser. All others are server-only (`$env/dynamic/private`).

---

## Code Style Guidelines

- **Formatter**: Prettier v3 with `prettier-plugin-svelte`.
  - Indentation: **tabs** (`useTabs: true`)
  - Quotes: **single quotes**
  - Semicolons: **none** (`semi: false`)
  - Trailing commas: **ES5** (`trailingComma: 'es5'`)
  - Print width: **100**
- **Linter**: ESLint v10 in _flat config_ (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-svelte`, `eslint-config-prettier`.
- **Imports**: `verbatimModuleSyntax: true`. Always use `import type` for type-only imports.
- **Language**: UI text and most comments are in **French**. Comments explain _why_, not _what_.

### Naming and Patterns

- Server-only files that must not run in the browser live in `$lib/server/` or are named `*.server.ts`.
- Validation schemas live in `$lib/models/` and are named `modelUserCreate`, `modelEventUpdate`, etc.
- Mutations live in `*.remote.ts` next to the feature they serve.
- API routes (`+server.ts`) return JSON. Client-side consumption in `$lib/api.ts` uses `axios` + `devalue`.
- fuma 2 components import from `'fuma'`; read-side server helpers from `'fuma/server'`; the vendored fuma 1 surface from `'$lib/fuma-legacy'`.

---

## Styling and Design System

- **The DaisyUI theme in `src/app.css` is the only source of colour.** No hex in components, no raw Tailwind palette (`slate`, `red`…), no config file. A colour that doesn't exist gets added to the `@plugin 'daisyui/theme'` block.
- Current tokens: `primary` `#0d3b66` (deep blue), `secondary` `#b8a58a` (sand beige), `accent` `#a52422` (brick red, planning time-marker only), `neutral` `#2b3440`, `base-100/200/300`, `base-content` `#1f2937`. `info` / `success` / `warning` / `error` are inherited from DaisyUI v5.
- Custom utilities in `app.css`: `.border-soft` / `.border-hard` (borders derived from `base-content`), `.menu-item`, `.title` / `.title-md` / `.title-sm`.
- Form fields use `variant="block"` and need an explicit full width — DaisyUI's `.input` caps at `20rem`.
- **Read `DESIGN.md` before any UI change.** It carries the named rules, the measured contrast ratios, and the do/don't list. `PRODUCT.md` carries the audiences and the tone.

---

## Testing Instructions

### Unit Tests (Vitest)

- Config: the `test` block in `vite.config.ts`
- Environment: `node`
- Test files: `src/**/*.{test,spec}.{js,ts}` — currently `src/tests/eventLocation.test.ts` and `src/tests/tierQuota.test.ts`
- `tippy.js` is force-inlined: the email SSR path pulls editor extensions that import CSS, which Node's ESM loader refuses.

```bash
bun run test:unit
```

### E2E Tests (Playwright)

- Config: `playwright.config.ts`
- Test directory: `tests/` (fixtures: `tests/user.ts`, `tests/event.ts`, `tests/test.ts`, `tests/photon.ts`)
- The config builds and previews the app on port 4173 with `EMAIL_DISABLED=true` before running.
- Fixtures create isolated users and events with unique CUIDs.

```bash
bun run test:e2e
bun run test:ui     # UI mode
bun run test-gen    # Codegen against the dev server (localhost:5173)
```

### CI

`.github/workflows/deploy.yml` runs on push to `main`: spins up MySQL 8, runs `bunx prisma migrate deploy`, then `bun run check`, `bun run test:unit`, and `bun run test:e2e` (Chromium only). Playwright reports are uploaded on failure. The Docker build job only runs if that job passes.

Every key in `.env.example` must be set in CI, even with dummy values: `svelte-kit sync` types `$env/dynamic` from the present environment, and a missing key becomes `string | undefined` and breaks `svelte-check`.

---

## Database and Migrations

- **Provider**: MySQL
- **ORM**: Prisma v6
- **Key models**: `User`, `Member`, `Event`, `Team`, `Period`, `Subscribe`, `Page`, `Field`, `Gift`, `Badge`, `Media`, `Message`, `Prospect`, `Licence`, `Checkout`
- Prisma client is extended with custom query middleware in `$lib/server/prisma.ts`:
  - Event soft deletes (renames ID/name instead of hard delete).
  - Event date auto-sync when periods are created/updated/deleted.
  - User data is duplicated onto linked `Member` records on create/update.

```bash
bun run migrate:deploy
```

---

## Authentication and Authorization

- Sessions are handled by **Lucia v2** with a Prisma adapter; `hooks.server.ts` attaches `locals.auth`.
- Users can authenticate via email + password, GitHub OAuth, or Google OAuth.
- Accounts can also be **created by an organizer through an invitation**: such a user exists but has no password, and must go through the password-reset link to claim the account. `$lib/me/Login.svelte` handles this case explicitly.
- Role hierarchy within an event: `member` → `leader` → `admin` → `owner`.
- A special `ROOT_USER` email bypasses all permission checks.
- Permission checks go through `permission.*` helpers from `$lib/server/permission.ts` in `load` functions and remote functions.
- Member roles are computed dynamically (`isAdmin`, `leaderOf`…) and merged into `MemberWithComputedValues`.

---

## Payments and Tiers

- Events sit on a tiered plan — `basic`, `standard`, `premium`, `pro` (`EventTier` enum) — with member quotas defined in `$lib/constant` and enforced by `computeIsTierQuotaReached` in `$lib/tierQuota.ts`.
- Stripe handles checkout sessions and webhook validation.
- Webhook endpoint: `/me/checkouts/validation` (`+server.ts`, POST).

---

## Email System

- Emails are Svelte components in `$lib/email/`, rendered server-side with **`render()` from `svelte/server`** (Svelte 5 — the old static `Component.render()` is gone).
- SMTP via Nodemailer. `EMAIL_DISABLED=true` logs instead of sending; CI and E2E rely on it.
- Transactional emails: verification links, password reset, subscribe notifications (request/accepted/denied/cancelled), checkout validation, prospect outreach.
- `/root/mails/*` previews templates in the browser.

---

## Media and File Storage

- Uploaded files (avatars, event backgrounds, logos, posters, badge assets) are stored on the local filesystem under `MEDIA_DIR` (default `./media`).
- Media records live in the `Media` table with relations to `User`, `Event`, and `Badge`.
- The `/media/[mediaId]` route serves files.
- `sharp` handles image processing.

---

## Security Considerations

- **Server-only imports**: never import `$lib/server` or Prisma into client code. SvelteKit errors at build time, but stay vigilant with dynamic imports.
- **Validation**: every remote function takes a Zod schema. Do not hand-parse `FormData`.
- **Account enumeration**: auth flows must answer identically whether or not an account exists. `loginUser` returns a single `Invalid credentials` for both unknown email and wrong password; `resetPassword` returns silently for unknown addresses.
- **Auth redirects**: unauthenticated users go to `/auth?redirectTo=...`. Unauthorized users get HTTP 403.
- **Stripe webhooks**: verify signatures with `PRIVATE_STRIPE_WEBHOOK_KEY`.
- **Secrets**: Stripe keys, SMTP passwords and OAuth secrets stay in server-only env vars.
- **Soft deletes**: events are soft-deleted by renaming their ID/name and setting `deletedAt`, preserving referential integrity.

---

## Deployment

1. **Dockerfile**: `oven/bun:latest`, installs OpenSSL, `bun install`, `bun run build`, runs `bun start`.
2. **GitHub Actions** (`.github/workflows/deploy.yml`): on push to `main`, tests then builds and pushes the image to `ghcr.io`.
3. **Runtime**: `bun start` runs Prisma migrations then starts the Node server from `./build/index.js`.

---

## Useful Context for Agents

- **French-first**: all user-facing strings are in French, including error messages. Server-side sentinel strings (`'Invalid credentials'`, `'This account already exists'`) stay in English and are translated at the component boundary.
- **Manual edits between prompts**: the user frequently edits files manually between prompts. **Always re-read a file before modifying it.** Do not assume it still matches your last edit.
- **Never commit**: leave changes in the working tree. The user commits.
- **Fuma first**: before writing a new input, table or dialog, check whether `fuma` already exports one — and whether `$lib/fuma-legacy` has an older twin you should be migrating away from.
- **Event-scoped data**: most entities (teams, members, pages, fields, gifts, badges) belong to an `Event`; queries should filter by `eventId`.
- **Computed member values**: `getMemberProfile` in `$lib/server/member.ts` enriches raw `Member` records with roles, subscription stats and gift allocations. Prefer it over raw Prisma queries when member context is needed.
- **Planning grid**: the volunteer schedule visualization is a custom drag-and-drop grid in `$lib/plan/`, with its own period stacking and scroll-centering logic.
- **Reusable components must not own their surface**: a component that can be mounted inside a `Card` (like `Login`) reads `contextContainer` from `$lib/fuma-legacy/ui/context.js` and renders bare when it is already carried. No nested cards.
- **Meta tags render once**: `MetaTags` does not deduplicate, so only the root layout renders it. Pages publish overrides through `metaTags` in their `load` data.
- **Brand naming in UI**: use "benevio" (lowercase) in user-facing copy. Technical references (URLs, repo names) may still use "benev".
