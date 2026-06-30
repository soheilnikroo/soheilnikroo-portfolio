# Soheil Nikroo — Portfolio

Interactive pixel-art portfolio built with Next.js 16, React 19, and a custom canvas engine. The homepage is a scroll-scrubbed world experience; `/read` provides an accessible text fallback. Blog posts are stored in Postgres and edited through `/admin`.

## Scripts

| Command        | Description                                   |
| -------------- | --------------------------------------------- |
| `pnpm dev`     | Start the development server                  |
| `pnpm build`   | Production build                              |
| `pnpm check`   | typecheck + lint + format:check + test + knip |
| `pnpm test`    | Vitest unit tests                             |
| `pnpm e2e`     | Playwright end-to-end tests                   |
| `pnpm db:seed` | Seed blog posts from `content/blog/*.mdx`     |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md). Layers:

- **UI** — `app/`, `components/`, `features/*/components`
- **Business** — `lib/world/`, `lib/services/`, `features/*/use-cases`
- **Data** — `lib/data/` (repositories), `lib/db/` (Postgres)
- **Contracts** — `lib/schemas/` (Zod)

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — Postgres connection string
- `ADMIN_PASSWORD` — admin login password
- `SESSION_SECRET` — HMAC cookie secret (32+ chars)

See [ADMIN.md](./ADMIN.md) for the CMS workflow.
