# Admin CMS

The `/admin` panel edits blog posts, projects, and site content stored in **Supabase Postgres**.

## Local setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Run `pnpm db:seed` once to create tables and load seed content from `content/seed/`.
3. Start the app with `pnpm dev` and open `/admin/login`.

## Liara deployment

Set these **environment variables** on the `soheilnikroo` app in the Liara dashboard (or via `liara env:set`):

| Variable                               | Purpose                                              |
| -------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`                         | Supabase Postgres pooler URL                         |
| `ADMIN_PASSWORD`                       | Password for `/admin/login`                          |
| `SESSION_SECRET`                       | HMAC secret for the admin session cookie (32+ chars) |
| `NEXT_PUBLIC_SITE_URL`                 | `https://soheilnikroo.liara.run`                     |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL (if using Supabase Auth)        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key                             |

### Database connection timeouts

Supabase does **not** expose port in Database Settings. The port is part of the **connection string**:

1. In Supabase, open your project → click **Connect** (top bar) → **ORMs** or **URI**.
2. Choose **Session pooler** (recommended for Liara) — the URI ends with `:5432/postgres`.
3. Or **Transaction pooler** — ends with `:6543/postgres`.
4. Copy the full URI into Liara `DATABASE_URL` (replace `[YOUR-PASSWORD]` with your DB password).

If logs show `DATABASE_CONNECT_TIMEOUT` on Liara:

1. Edit `DATABASE_URL` on Liara — change `:6543` to `:5432` (same host, same password).
2. Confirm the hostname matches Supabase exactly (`aws-0-…` vs `aws-1-…` — copy from Supabase **Connect** panel).
3. Redeploy after saving env vars.
4. Run `pnpm db:seed` locally to verify the connection string works before redeploying.

The public site falls back to bundled content when the database is unreachable, but **admin requires a live connection**.

## Seeding

```bash
pnpm db:seed
```

This is idempotent: it upserts posts, projects, profile, skills, milestones, site settings, and world narrative.

## Content model

- **posts** — blog articles (markdown bodies)
- **projects** — work portfolio entries
- **site_content** — JSON blobs for `profile`, `skills`, `milestones`, `site`, `world`

Seed files live in `content/seed/` and `content/blog/`.
