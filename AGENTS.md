# Benev.io — Agent Guide

> **Project language**: French (UI, comments, and documentation are in French).
> **Repository**: Full-stack web application for volunteer event management ("Plateforme de gestion de bénévoles").

---

## Project Overview

Benev.io helps event organizers manage volunteers:

- **Organizers**: create events, edit teams and pages, manage members, set themes, configure
  registration rules, and pay for their event tier.
- **Leaders (Responsables)**: manage team periods, validate subscriptions, view volunteer lists.
- **Volunteers (Bénévoles)**: browse events, register for time slots (periods), track their
  subscriptions, update their profile.

Server-rendered full-stack app with a rich admin interface per event.

Product intent, audiences and design system are recorded in `PRODUCT.md` and `DESIGN.md` at the
repo root. **Read them before changing anything user-facing** — `DESIGN.md` is the authority on
colour, type and spacing, not this file. `TODO.md` is the user's running task list.

---

## Technology Stack

SvelteKit v2 (**remote functions enabled**) · TypeScript v6 (strict, `verbatimModuleSyntax`) ·
Vite v8 · Svelte v5 **runes-only** · Tailwind v4 + DaisyUI v5 · Zod v4 · Prisma v6 / MySQL ·
Lucia v2 (GitHub + Google OAuth) · Stripe · Nodemailer (SMTP Infomaniak) · Playwright + Vitest ·
Bun runtime, Docker image built by GitHub Actions to GHCR.

The non-obvious parts:

- **No `tailwind.config`, no PostCSS.** Tailwind is a Vite plugin (`@tailwindcss/vite`); the
  theme lives in `src/app.css`, alongside `@plugin '@tailwindcss/typography'`.
- **Lucide (`@lucide/svelte`) is the only icon set.**
- **Font**: Barlow (400–800) via Google Fonts in `src/app.html`.
- **`fuma` v2 is linked to a sibling checkout**, not the registry — see [Fuma](#fuma).
- Emails are Svelte components rendered with `render()` from `svelte/server`.

### Svelte 5 and SvelteKit experimental flags

`svelte.config.js` turns on two experimental features the codebase depends on:

- `kit.experimental.remoteFunctions: true` — required by every `*.remote.ts` file and by fuma 2's
  input components.
- `compilerOptions.experimental.async: true` — async SSR / `await` in components.

Code is **runes-only**: `$state`, `$derived`, `$props`, `$effect`, snippets and event attributes
(`onclick`, not `on:click`). `export let` and stores-as-component-state are legacy and should not
be introduced.

---

## Project Structure

```
/
├── prisma/schema.prisma       # Database schema (MySQL)
├── src/
│   ├── app.html               # HTML template (lang="fr"), Barlow webfont
│   ├── app.d.ts               # Global App types + Lucia/PrismaJson types
│   ├── app.css                # Tailwind v4 entry + DaisyUI theme + @utility layer
│   ├── hooks.server.ts        # Auth middleware (Lucia session handling)
│   ├── routes/
│   │   ├── (home)/            # Layout group: marketing, auth, /me, /root, /terms, /contact…
│   │   ├── [eventId]/         # Event-specific pages (public + admin)
│   │   ├── api/               # Global API routes (ical, scrap-icon)
│   │   ├── lab/               # Scratch space for UI experiments
│   │   ├── media/             # Media file serving
│   │   └── sitemap.xml/
│   ├── lib/
│   │   ├── server/            # Server-only modules (auth, prisma, permissions, email, stripe…)
│   │   ├── models/            # Zod schemas (modelUserCreate, modelEventUpdate…)
│   │   ├── ui/                # Components fuma 2 does not cover
│   │   ├── email/             # Svelte email template components
│   │   ├── event/, team/, period/, subscribe/, member/, gift/, tag/, pages/, plan/,
│   │   │   milestone/, view/, me/, layout/, checkout/, landing/, material/, location/,
│   │   │   testimonials/
│   │   ├── seo/               # Meta tags + JSON-LD schemas
│   │   ├── constant/          # EVENT_TIER quotas and other shared constants
│   │   ├── store/             # Svelte stores (eventPath, isMobile)
│   │   ├── action/, style/, types/, assets/
│   │   └── *.ts               # Shared helpers: api.ts (axios + devalue), dayjs.ts,
│   │                          #   tierQuota.ts, timezone.ts, url.ts, enhanceForm.ts…
│   └── tests/                 # Vitest unit tests
├── tests/                     # Playwright E2E tests + fixtures
├── media/                     # Uploaded media storage (local filesystem)
├── dumps/                     # SQL dumps
├── PRODUCT.md, DESIGN.md      # Product record and design system
├── TODO.md                    # User's running task list
├── .impeccable/design.json    # Machine-readable sidecar of DESIGN.md
├── Dockerfile, .github/workflows/deploy.yml
├── svelte.config.js           # Node adapter + experimental flags
├── vite.config.ts             # Tailwind plugin, Vitest config, fuma linking
└── prettier.config.cjs, eslint.config.js, playwright.config.ts, tsconfig.json
```

### Route Conventions

- `(home)` — public/marketing pages, auth, user dashboard.
  - `/`, `/events`, `/contact`, `/open-source`, `/qr`
  - Textes légaux, tous montés sur `LegalPage` de `$lib/layout` : `/terms`, `/privacy`,
    `/legal-notice`, `/sales-terms`. Leur liste vit dans `$lib/layout/legal.ts`, qui sert aussi
    le pied de page, les renvois croisés et l'identité de l'éditeur.
  - `/auth` — login / account creation (`$lib/me/Login.svelte`)
  - `/me/*` — personal dashboard, events, checkouts
  - `/root/*` — superuser tools (users, events, checkouts, messages, mails preview, migrate)
  - `/token/[tokenId]/*` — email-link landings (verification, password reset)
- `[eventId]` — dynamic event slug. All event pages live here:
  - `[eventId]/[pagePath]` — public CMS-like pages for the event.
  - `[eventId]/admin/*` — organizer tools: dashboard, members, subscribes, plan, settings,
    pages, gift, quota, adhesion. `admin` itself redirects — to `dashboard` for an admin, to
    `members` for a leader, who is refused the first.
  - `[eventId]/register`, `/me`, `/teams`, `/help`, `/invite` — volunteer-facing pages.
  - `[eventId]/api/*` — event-scoped REST endpoints.
- `+layout.server.ts` / `+page.server.ts` — server `load` functions.
- `+server.ts` — REST endpoints (GET, POST, PATCH, DELETE).
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
| `$lib/ui`                   | Components fuma 2 does not cover: `card`, `badge`, `tabs`, `dialog`, `placeholder`, `textRich`, `input`.             |
| `$lib/email`                | Svelte components for transactional emails.                                                                          |
| `$lib/plan`                 | Drag-and-drop planning grid for team/period visualization.                                                           |
| `$lib/pages`                | CMS page rendering, suggestions, and nested path logic.                                                              |
| `$lib/seo`                  | `defaultMetaTags`, `errorMetaTags`, `mergeMetaTags`, JSON-LD schemas. Rendered **once** in the root layout.          |
| `$lib/constant`             | `EVENT_TIER` — per-tier member quotas and Stripe price bindings.                                                     |
| `$lib/log`                  | The event journal: `logMap` (one transform per `LogType`), the feed components, `LOG_FAMILIES`. See below.           |
| `$lib/dayjs.ts`             | Pre-configured dayjs instance (relativeTime plugin + French locale).                                                 |

---

## Mutations: Remote Functions, not Form Actions

**There is not a single `export const actions` left in the repo.** Every mutation goes through a
SvelteKit remote function declared in a `*.remote.ts` file:

```ts
// src/lib/me/user.remote.ts
import { form, getRequestEvent } from '$app/server'
import { modelUserLogin } from '$lib/models'

export const loginUser = form(modelUserLogin, async ({ email, password }) => {
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

- **`await submit()` returns a boolean.** `false` means validation failed and the issues are
  already rendered under the fields — do not treat it as success.
- **Thrown errors are `HttpError`, which does _not_ extend `Error`.** Use `isHttpError(err)` from
  `@sveltejs/kit` and read `err.body.message`. `err instanceof Error` is false and `String(err)`
  yields JSON.
- Uncaught exceptions in a remote function surface to the client as a generic 500. Wrap expected
  failures in `error(status, message)` so the UI can say something useful.
- Several remote functions can be spread onto the same `<form>`; SvelteKit runs the one whose
  `action` matches the pressed button's `formaction`. The **first submit button in DOM order** is
  what the Enter key triggers.
- `form.pending` (a counter) and `form.fields.x.value()` / `.set()` are available for loading
  states and cross-form value carry-over.

`fuma/server` still provides read-side helpers — `parseQuery`,
`ensureFieldsWithFilterAreVisibles` — used in `load` functions. Those stay.

---

## The Journal

Every mutation worth an organizer's attention writes a `Log` row. The rule of the module is that
**a call site passes the entity it just wrote, never a set of foreign keys**: one transform per
`LogType` in `$lib/log/logMap.ts` derives both the relation columns and the payload.

```ts
await createLog('subscribe_state', { subscribe, before: _subscribe.state, actor: author })
```

`satisfies { [T in LogType]: (input: never) => LogOutput<unknown> }` makes the table exhaustive, and
`logComponents` in `Log.svelte` does the same for rendering — **adding a value to the enum does not
compile until it can be both written and read**. `LogInput<T>` / `LogData<T>` derive from the table,
so a type is declared once.

Three rules govern what goes into `data`:

- **Displayed names are frozen in the payload**, never joined. The feed renders with no `include`
  at all, and stays true after the member, team or period it cites is gone. The FK columns exist
  only for filtering and links, and are `SET NULL` for exactly that reason.
- **A `*_update` carries only the keys that changed**, taken from a projection in `logProject.ts`.
  The projection _is_ the whitelist — what it does not return never reaches the database. It also
  returns primitives only, so a `Date` cannot cross the JSON column and make the derived type lie.
- **Free-form member profile fields are diffed like the rest**, through `projectProfile`, which
  indexes them by field **name** rather than by id — a cuid does not read in a diff, and the name
  frozen in the payload survives the field's renaming. They are defined per event and can hold
  anything (diet, health): the feed that renders them is admins-only.

`createLog` never throws — a journal that falls must not take down what it journalises.

What is deliberately _not_ logged: searches, reorderings, personal table views, media, tags,
milestones, a member's own notification preferences, and **`movePeriod` / `updatePeriod` /
`duplicatePeriod`**, which the planning grid calls on every drag release.

The organizer reads it in the Journal section of `/[eventId]/admin/dashboard` (admins only,
guarded in `load` — which is why the whole tab is) and in the Journal section of a member's page;
`/root/logs` shows the same feed across events. `email_sent` is
excluded from the event feed — one line per notification sent would bury everything — while
`email_failed` is exactly what an organizer needs to see.

## Fuma

The UI depends on fuma 2, and there are **two ways to consume it**. The committed state is the
registry (`"fuma": "^2.2.7"`), because CI and the Docker build resolve dependencies with no sibling
checkout in reach. Working on fuma itself means switching to the local link at `../fuma`, where
fixes land as they are found:

```bash
bun run fuma:local   # -> file:../fuma, the checkout, without publishing
bun run fuma:npm     # -> back to the registry, the state that may be committed
```

Under the link, bun **copies** the checkout into `node_modules/fuma` — it neither symlinks nor
hardlinks it (verified on bun 1.2.22). An edit to `../fuma` therefore takes `bun run package` there
_and_ `bun install` here before benev sees it; nothing is picked up live.

Never commit the link. A step at the head of the CI `test` job rejects a `file:` range before
`bun install` runs, because the raw resolution error does not point at its cause. Publishing from
`../fuma` (`npm publish`, whose `prepublishOnly` runs `bun run package`) is what makes a fix
available to `bun run fuma:npm`, and therefore to `dev.benev.io`.

`vite.config.ts` is written to hold for both modes and needs no switching:

- `server.fs.allow` — serve files from outside the project root (`media` and `../fuma`). Inert
  when the directory is absent.
- `optimizeDeps.exclude: ['fuma']` — no pre-bundling, so a reinstalled link is seen without
  clearing Vite's cache.
- `optimizeDeps.include: ['litepicker']` — the consequence of that exclusion. `litepicker` is a
  CommonJS dependency of fuma's `RangePicker`, imported nowhere in `src/`; without an explicit
  include the dev server serves raw CJS. It stays declared in `package.json` for that reason.
- `resolve.dedupe: ['@sveltejs/kit', 'svelte', 'zod']` — the copied checkout brings its own
  `node_modules` along, kept for its development. Without dedupe, `fuma/server`
  throws a `redirect()` built by _its_ copy of kit, benev's copy does not recognise it, and the
  redirect surfaces as a 500; for zod it is the global `z.config()` that is per-copy, leaving
  fuma's schemas in English. Redundant on the registry, required the moment the link is back.
- `@source '../node_modules/fuma/dist'` in `app.css` — one path that resolves in both modes, since
  both put a real `dist/` there. It carries the same 47 components as `src/lib/`, so Tailwind finds
  the same classes: switching modes produces a byte-identical stylesheet.

There is one import surface:

- **`from 'fuma'`** — components, actions, client helpers (`InputString`, `InputSelect`, `Table`,
  `Dialog`, `Drawer`, `Popover`, `tip`, `urlParam`, `parseOptions`…).
- **`from 'fuma/server'`** — read-side helpers for `load` functions: `parseQuery`,
  `ensureFieldsWithFilterAreVisibles`.

What fuma 2 does not cover lives in `$lib/ui` and belongs to benev — `Card`, `Placeholder`,
`Badge`, `Tabs`, `Dialog`, `InputTextRich` and the tiptap toolbar, `SelectorList`, `InputImage`,
`InputSearch`. The dependency runs one way, from benev to the package.

Field labels come from fuma, which renders them as `fieldset.fieldset > label.label`. A bespoke
control that has to sit next to a fuma input reproduces that markup by hand — see the "Type de
page" field of `PageForm.svelte`. There is no `FormControl` wrapper any more, and `form-control` /
`label-text` are daisyUI 4 classes that do nothing in daisyUI 5.

### `InputSelect` / `InputMultiSelect` take one of three sources

Both take a single `items` prop. Pick the source by where the filtering belongs — never wrap one
form to look like another:

- **A remote query**, `RemoteQueryFunction<{ search: string }, Item[]>` — the default when the list
  lives in the database. Write a `query()` next to the domain's other remote functions:
  `searchMembers` in `$lib/member/member.remote.ts`, `searchTeams` in `$lib/team/team.remote.ts`.
  To fix an extra argument, wrap it at the call site rather than widening the query — see
  `InputFieldSelect.svelte` on the badges page:

  ```ts
  const searchItems = ({ search }: { search: string }) =>
  	searchMemberFields({ search, types: typesAccepted })
  ```

- **A function returning a promise**, for a search that must stay in the browser — Photon
  geocoding in `$lib/location/InputLocation.svelte` (mocked in E2E). fuma tempers the keystrokes,
  drops out-of-order responses and renders loading then error; do not re-implement any of that.

- **A plain array**, when the data is already loaded — the secteurs of `PlanHeader.svelte`, an
  enum passed through `parseOptions`. fuma filters it locally on `getLabel`, or on `filter` if the
  match has to span several fields.

`value` holds the item, never its submitted value: pass `items.find(…)` on the way in and read
`option.value` in `onSelect`. `getValue` defaults to `item.id` then `item.value`, so options built
by `parseOptions` need no `getValue` at all. The search box appears on its own above 7 entries;
`searchable` forces it either way.

**A parent that repilots `value` after a user selection must bind it.** Passed as a plain prop,
a `$bindable` stops following the parent as soon as the component has written to it — the display
then sticks to the user's last choice while the model moves on. `bind:value` takes the setter path
and has no such problem (`GiftConditions.svelte`, which clears the field after each pick). Where
binding is impossible because the model holds a string rather than the item, wrap the input in
`{#key}` on whatever invalidates the selection — the operator select of `MemberConditions.svelte`,
keyed on the field id, and the `{#key period}` of `PeriodForm.svelte`.

### Fixing fuma

Gaps found while using it are fixed upstream in `../fuma`, then `bun run package` there. Bump the
version in the same change. Most bugs found so far only appeared during **server rendering**
(context set in an `$effect`, `null` reaching a zod `.default()`) — a component that works in the
browser is not proof.

---

## Build and Development Commands

Use **Bun** (lockfile is `bun.lock`).

> ⚠️ Always write `bun run <script>`. Bare `bun build`, `bun test` and `bun check` hit Bun's own
> builtins, not the package.json scripts.

```bash
bun install               # postinstall runs `prisma generate`
bun run dev               # Vite dev server, host enabled
bun run build
bun run preview

# Prisma
bun run generate          # Generate Prisma client
bun run migrate           # Migrations, dev mode
bun run migrate:deploy    # Migrations, production
bun run studio

# Codegen
bun run timezones         # Regenerate src/lib/timezone.data.ts from the runtime's IANA database

# Testing
bun run test:unit         # Vitest, single run (node environment)
bun run vitest            # Vitest, watch mode
bun run test:e2e          # Playwright
bun run test              # test:unit then test:e2e
bun run test:ui           # Playwright UI mode
bun run test-gen          # Playwright codegen against localhost:5173

# Linting, formatting, type-checking
bun run check             # svelte-kit sync + svelte-check --fail-on-warnings + lint
bun run check:watch
bun run lint              # prettier --check . && eslint .
bun run format            # prettier --write .

bun start                 # Production: prestart runs `prisma migrate deploy`, then node ./build/index.js
bun run dev:stripe        # Forward Stripe webhooks to localhost:5173/me/checkouts/validation
```

- `bun run check` runs `svelte-kit sync` first: without it, `$env/dynamic` keys are untyped and
  `svelte-check` fails.
- `bun run check` is expected to report **0 errors and 0 warnings**. It runs with
  `--fail-on-warnings`; there is no baseline to compare against.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
ROOT_USER="admin@example.com"              # Root user email (full access)
DATABASE_URL="mysql://user:pass@host:3306/db"
MEDIA_DIR="./media"                        # Local media storage path
ORIGIN="https://benev.io"                  # Public origin of the deployment
BODY_SIZE_LIMIT=0                          # Disable body size limit for uploads

# EMAIL
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

# AUTHENTICATION
GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# MONETISATION
PRIVATE_STRIPE_KEY, PRIVATE_STRIPE_WEBHOOK_KEY, PUBLIC_STRIPE_KEY,
PUBLIC_PRICE_STANDARD, PUBLIC_PRICE_PREMIUM, PUBLIC_PRICE_STANDARD_TO_PREMIUM
```

`EMAIL_DISABLED="true"` is **not** in `.env.example`: it is set by `playwright.config.ts` and by
CI to log emails instead of sending them.

All `PUBLIC_*` variables are exposed to the browser. All others are server-only
(`$env/dynamic/private`).

---

## Code Style Guidelines

- **Formatter**: Prettier v3 with `prettier-plugin-svelte` (`prettier.config.cjs`) — tabs, single
  quotes, **no semicolons**, `trailingComma: 'es5'`, print width 100.
- **Linter**: ESLint v10 flat config (`eslint.config.js`) with `typescript-eslint`,
  `eslint-plugin-svelte`, `eslint-config-prettier`.
- **Imports**: `verbatimModuleSyntax: true`. Always use `import type` for type-only imports.
- **Language**: UI text and most comments are in **French**. Comments explain _why_, not _what_.
- **No changelog comments.** A comment must still be true and useful a year from now. Never write
  what a change replaced, what used to be there, or what is deprecated (`// remplace l'ancien X`,
  `/** Remplacent les évènements de la version Svelte 4 */`, `// le jeton Y n'a plus cours`). That
  belongs in the commit message and the report, not in the source. Keep only comments that explain
  a non-obvious constraint the reader would otherwise trip on.

### Naming and Patterns

- Server-only files that must not run in the browser live in `$lib/server/` or are named
  `*.server.ts`.
- Validation schemas live in `$lib/models/` and are named `modelUserCreate`, `modelEventUpdate`…
- Mutations live in `*.remote.ts` next to the feature they serve.
- API routes (`+server.ts`) return JSON. Client-side consumption in `$lib/api.ts` uses `axios` +
  `devalue`.
- fuma components import from `'fuma'`; read-side server helpers from `'fuma/server'`; benev's own
  components from `'$lib/ui'`.
- **Icons**: always `@lucide/svelte`, with the `Icon` suffix — `import { CheckIcon, UploadIcon }
from '@lucide/svelte'`, used as `<UploadIcon size={20} class="opacity-70" />`. Lucide strokes
  its icons: colour them with `text-*`, never `fill-*`, which renders them invisible.

---

## Styling and Design System

- **The DaisyUI theme in `src/app.css` is the only source of colour.** No hex in components, no
  raw Tailwind palette (`slate`, `red`…), no config file. A colour that doesn't exist gets added
  to the `@plugin 'daisyui/theme'` block.
- A **single theme** is declared — `light`, rendered by default. There is no dark theme.
- Tokens: `primary` `#2663eb` (frank blue, carries action), `secondary` `#11b981` (green — the
  brand colour, the dot in the logo; **2.54:1, never as text**), `accent` `#e69214` (orange,
  reserved for the planning time-marker; **2.47:1, never as text**), `neutral` `#2b3440`,
  `base-100/200/300` `#ffffff`/`#f2f2f2`/`#e5e6e6`, `base-content` `#1f2937`. `info` / `success` /
  `warning` / `error` are inherited from DaisyUI v5.
- Custom `@utility` rules in `app.css`: `border-soft` / `border-hard` (borders derived from
  `base-content`), `bg-accent-soft` / `bg-accent-softer`. Component classes: `.surface` /
  `.surface-drawer`, `.menu-item`, `.title` / `.title-md` / `.title-sm`.
- Form fields use `variant="block"` and need an explicit full width — DaisyUI's `.input` caps at
  `20rem`.
- **Read `DESIGN.md` before any UI change.** It carries the named rules, the measured contrast
  ratios, and the do/don't list. `PRODUCT.md` carries the audiences and the tone.

---

## Testing Instructions

### Unit Tests (Vitest)

- Config: the `test` block in `vite.config.ts`; environment `node`.
- Test files: `src/**/*.{test,spec}.{js,ts}`, living in `src/tests/`.
- `tippy.js` is force-inlined: the email SSR path pulls editor extensions that import CSS, which
  Node's ESM loader refuses.

### E2E Tests (Playwright)

- Config: `playwright.config.ts`; test directory `tests/`.
- Fixtures: `tests/user.ts`, `tests/event.ts`, `tests/test.ts`, `tests/photon.ts` — they create
  isolated users and events with unique CUIDs.
- The config builds and previews the app on port 4173 with `EMAIL_DISABLED=true` before running.

### CI and Deployment

`.github/workflows/deploy.yml` runs on push to `main` **and to `dev`**: spins up MySQL 8, runs
`bunx prisma migrate deploy`, then `bun run check`, `bun run test:unit`, and `bun run test:e2e`
(Chromium only). Playwright reports are uploaded on failure. The Docker build job (`oven/bun:latest`,
pushed to `ghcr.io`) only runs if that job passes.

Two environments, both on Dokploy, distinguished only by the branch that was pushed:

| Branch | Image tag                  | Domain         | Webhook secret        |
| ------ | -------------------------- | -------------- | --------------------- |
| `main` | `ghcr.io/peufo/benev:main` | `benev.io`     | `DEPLOY_HOOK_URL`     |
| `dev`  | `ghcr.io/peufo/benev:dev`  | `dev.benev.io` | `DEPLOY_HOOK_URL_DEV` |

The tags come from `docker/metadata-action`'s defaults (`type=ref,event=branch`) — nothing declares
them. There is no `:latest`: `flavor.latest=auto` only emits it for a **git tag** push, never for a
branch. A Dokploy application must therefore pull its branch tag by name.

Each Dokploy application exposes its own webhook URL under its _Deployments_ tab; that URL is what
goes into the matching GitHub secret. The two environments share nothing — separate database,
separate domain, separate media volume.

Every key in `.env.example` must be set in CI, even with dummy values: `svelte-kit sync` types
`$env/dynamic` from the present environment, and a missing key becomes `string | undefined` and
breaks `svelte-check`.

---

## Database and Migrations

- **MySQL** + **Prisma v6**, schema in `prisma/schema.prisma`, with `prisma-json-types-generator`.
- Models: `User`, `Session`, `Key`, `Token`, `Event`, `Member`, `Team`, `Period`, `Subscribe`,
  `Page`, `Field`, `View`, `Tag`, `Milestone`, `Gift`, `GiftCondition`, `GiftAllocation`, `Badge`,
  `Media`, `Message`, `Product`, `Checkout`.
- The Prisma client is extended with query middleware in `$lib/server/prisma.ts`:
  - Event soft deletes (renames ID/name instead of hard delete).
  - Event date auto-sync when periods are created/updated/deleted.
  - User data duplicated onto linked `Member` records on create/update.

---

## Authentication and Authorization

- Sessions are handled by **Lucia v2** with a Prisma adapter; `hooks.server.ts` attaches
  `locals.auth`.
- Users authenticate via email + password, GitHub OAuth, or Google OAuth.
- Accounts can also be **created by an organizer through an invitation**: such a user exists but
  has no password, and must go through the password-reset link to claim the account.
  `$lib/me/Login.svelte` handles this case explicitly.
- Role hierarchy within an event: `member` → `leader` → `admin` → `owner`.
- A special `ROOT_USER` email bypasses all permission checks.
- Permission checks go through `permission.*` helpers from `$lib/server/permission.ts`, in `load`
  functions and remote functions.
- Member roles are computed dynamically (`isAdmin`, `leaderOf`…) and merged into
  `MemberWithComputedValues`.

---

## Payments, Email, Media

- **Tiers**: events sit on `basic`, `standard`, `premium` or `pro` (`EventTier` enum), with member
  quotas in `$lib/constant` enforced by `computeIsTierQuotaReached` in `$lib/tierQuota.ts`. Stripe
  handles checkout sessions and webhook validation; the webhook endpoint is
  `/me/checkouts/validation` (`+server.ts`, POST), and signatures are verified with
  `PRIVATE_STRIPE_WEBHOOK_KEY`.
- **Email**: Svelte components in `$lib/email/`, rendered server-side with `render()` from
  `svelte/server` (the old static `Component.render()` is gone). SMTP via Nodemailer.
  `EMAIL_DISABLED=true` logs instead of sending; CI and E2E rely on it. Transactional emails cover
  verification links, password reset, subscribe notifications
  (request/accepted/denied/cancelled) and checkout validation. `/root/mails/*` previews templates
  in the browser.
- **Media**: uploads (avatars, event backgrounds, logos, posters, badge assets) are stored on the
  local filesystem under `MEDIA_DIR` (default `./media`), recorded in the `Media` table with
  relations to `User`, `Event` and `Badge`, and served by `/media/[mediaId]`. `sharp` handles
  image processing.

---

## Security Considerations

- **Server-only imports**: never import `$lib/server` or Prisma into client code. SvelteKit errors
  at build time, but stay vigilant with dynamic imports.
- **Validation**: every remote function takes a Zod schema. Do not hand-parse `FormData`.
- **Account enumeration**: auth flows must answer identically whether or not an account exists.
  `loginUser` returns a single `Invalid credentials` for both unknown email and wrong password;
  `resetPassword` returns silently for unknown addresses.
- **Auth redirects**: unauthenticated users go to `/auth?redirectTo=...`. Unauthorized users get
  HTTP 403.
- **Soft deletes**: events are soft-deleted by renaming their ID/name and setting `deletedAt`,
  preserving referential integrity.

---

## Useful Context for Agents

- **French-first**: all user-facing strings are in French, including error messages. Server-side
  sentinel strings (`'Invalid credentials'`, `'This account already exists'`) stay in English and
  are translated at the component boundary.
- **Manual edits between prompts**: the user frequently edits files manually between prompts.
  **Always re-read a file before modifying it.** Do not assume it still matches your last edit.
- **Never commit**: leave changes in the working tree. The user commits.
- **Fuma first**: before writing a new input, table or dialog, check whether `fuma` already exports
  one. If it almost fits, fix it in `../fuma` rather than growing a local twin.
- **Event-scoped data**: most entities (teams, members, pages, fields, gifts, badges) belong to an
  `Event`; queries should filter by `eventId`.
- **Computed member values**: `getMemberProfile` in `$lib/server/member.ts` enriches raw `Member`
  records with roles, subscription stats and gift allocations. Prefer it over raw Prisma queries
  when member context is needed.
- **Planning grid**: the volunteer schedule visualization is a custom drag-and-drop grid in
  `$lib/plan/`, with its own period stacking and scroll-centering logic.
- **Reusable components must not own their surface**: a component that can be mounted inside a
  `Card` (like `Login`) reads `contextContainer` from `$lib/ui/context.js` and renders bare when it
  is already carried. No nested cards.
- **Meta tags render once**: `MetaTags` does not deduplicate, so only the root layout renders it.
  Pages publish overrides through `metaTags` in their `load` data.
- **Brand naming in UI**: use "benevio" (lowercase) in user-facing copy. Technical references
  (URLs, repo names) may still use "benev".
