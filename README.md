# Soheil Nikroo — Interactive Portfolio

A personal portfolio that plays like a side-scrolling pixel game. Scroll forward to walk through chapters of my story — intro, projects, skills, writing, and contact — or switch to a calm text version anytime. Built with **Next.js 16**, **React 19**, and a custom canvas engine.

**Live:** [soheilnikroo.com](https://soheilnikroo.com)

---

## What’s inside

| Route    | What you get                                                            |
| -------- | ----------------------------------------------------------------------- |
| `/`      | Scroll-scrubbed pixel-art world — the main experience                   |
| `/read`  | Same story as plain, accessible text (great for screen readers & no-JS) |
| `/work`  | Project case studies with screenshots and tech stacks                   |
| `/blog`  | Writing on motion, architecture, and front-end craft                    |
| `/admin` | Password-protected CMS for all editable content                         |

### The world experience

Five chapters, one continuous scroll:

```
intro → work → skills → writing → contact
```

- **Canvas engine** — custom 2D renderer in `lib/engine/` (framework-agnostic)
- **Pixel art** — hand-crafted sprites and Tehran-inspired scenes
- **Ambient audio** — opt-in chapter music; respects mute and reduced-motion preferences
- **3D meta room** — a hidden Three.js easter egg for the curious
- **Accessible by design** — semantic narrative layer, skip links, `/read` fallback, crawler nav

---

## Quick start

**Prerequisites:** Node.js 22+, [pnpm](https://pnpm.io/) 9+

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET

# 3. Seed content into Postgres (first run)
pnpm db:seed

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin).

> **No database yet?** The site needs Postgres for blog posts, projects, profile, skills, and world copy. [Supabase](https://supabase.com) works well — use the connection pooler string from **Settings → Database**.

---

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable                         | Purpose                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Public URL (metadata, JSON-LD, Open Graph)               |
| `DATABASE_URL`                   | Postgres connection string (Supabase pooler recommended) |
| `ADMIN_PASSWORD`                 | Password for `/admin` login                              |
| `SESSION_SECRET`                 | HMAC cookie secret — **32+ random characters**           |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity (optional, production)                 |
| `GOOGLE_SITE_VERIFICATION`       | Search Console verification (optional)                   |

`NEXT_PUBLIC_ASSET_VERSION` is set automatically on `pnpm build` to bust caches for world sprites after deploy.

---

## Managing content

All editable content lives in **Postgres**. The admin panel at `/admin` is the day-to-day editor.

**Seed files** under `content/seed/` and blog posts under `content/blog/` are the source of truth for bootstrapping:

```bash
pnpm db:seed    # Push seed JSON + MDX blog posts into the database
pnpm db:ping    # Check database connectivity
pnpm db:list    # List current content in the database
```

| Content           | Seed file                    | Admin route       |
| ----------------- | ---------------------------- | ----------------- |
| Profile & socials | `content/seed/profile.json`  | `/admin/profile`  |
| Projects          | `content/seed/projects.json` | `/admin/projects` |
| Skills            | `content/seed/skills.json`   | `/admin/skills`   |
| World narrative   | `content/seed/world.json`    | `/admin/world`    |
| Site copy & nav   | `content/seed/site.json`     | `/admin/settings` |
| Blog posts        | `content/blog/*.mdx`         | `/admin`          |

After editing in admin, changes appear on the site within the content revalidation window (~5 minutes). For local dev, a refresh is usually enough.

---

## Scripts

| Command                             | Description                                            |
| ----------------------------------- | ------------------------------------------------------ |
| `pnpm dev`                          | Development server                                     |
| `pnpm build`                        | Production build                                       |
| `pnpm start`                        | Serve production build                                 |
| `pnpm check`                        | Full quality gate: typecheck, lint, format, test, knip |
| `pnpm test`                         | Vitest unit tests                                      |
| `pnpm test:watch`                   | Vitest in watch mode                                   |
| `pnpm e2e`                          | Playwright end-to-end tests                            |
| `pnpm e2e:ui`                       | Playwright with UI                                     |
| `pnpm lint` / `pnpm lint:fix`       | Oxlint                                                 |
| `pnpm format` / `pnpm format:check` | Oxfmt                                                  |
| `pnpm typecheck`                    | TypeScript (`tsc --noEmit`)                            |
| `pnpm knip`                         | Find unused exports & dependencies                     |
| `pnpm db:seed`                      | Seed database from `content/`                          |
| `pnpm assets:optimize`              | Optimize audio assets                                  |

---

## Tech stack

- **Framework** — Next.js 16 (App Router), React 19, TypeScript
- **Styling** — Tailwind CSS 4, Radix UI, Motion
- **Content** — MDX, Zod schemas, Postgres via `postgres` driver
- **Graphics** — Custom canvas engine, React Three Fiber (meta room)
- **Testing** — Vitest, Testing Library, Playwright (+ axe)
- **Tooling** — Oxlint, Oxfmt, Knip, Husky, commitlint

---

## Project structure

```
app/                  # Next.js routes (pages, API, admin)
components/           # Shared UI (layout, theme, SEO)
features/             # Vertical UI slices (world, blog, admin, ambient)
lib/
  data/               # Repositories — the only layer that talks to the DB
  db/                 # Raw Postgres access & migrations
  engine/             # Canvas rendering engine (no React imports)
  schemas/            # Zod contracts shared across layers
  services/           # Pure helpers (dates, TOC, audio)
  world/              # Scroll-world domain logic (chapters, audio, assets)
content/
  blog/               # MDX posts (seed source)
  seed/               # JSON seed data (profile, projects, skills, world, site)
public/
  world/              # Pixel art sprites & scenes
  work/               # Project screenshots
  audio/              # Music & sound effects
```

Dependencies flow inward: **UI → business → data**. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full picture.

---

## Deployment

The app targets Node.js 22 and builds with:

```bash
pnpm build && pnpm start
```

CI runs on every push and PR to `main` — typecheck, lint, format, knip, unit tests, and production build. See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

Set the same environment variables from `.env.example` in your host’s dashboard (e.g. Liara, Vercel). Run `pnpm db:seed` once against your production database to populate initial content.

---

## License

Private project — all rights reserved unless otherwise noted. Third-party audio licenses are listed in [`public/audio/LICENSES.md`](./public/audio/LICENSES.md).
