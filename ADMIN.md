# Admin panel — publish writing without redeploying

Your blog posts live in a **Postgres database**, and the blog pages read from it at
request time. That means anything you publish from the admin panel appears on the
site immediately — no rebuild, no redeploy.

## One-time setup

1. **Create a Postgres database.** Any provider works. Free options:
   - [Neon](https://neon.tech) (recommended — serverless Postgres)
   - [Supabase](https://supabase.com)
     Copy the connection string (looks like `postgresql://user:pass@host/db?sslmode=require`).

2. **Configure environment variables.** Copy `.env.example` to `.env` and fill in:

   ```
   DATABASE_URL="postgresql://…"          # from step 1
   ADMIN_PASSWORD="your-strong-password"  # what you'll type to log in
   SESSION_SECRET="a-long-random-string"  # signs your login cookie
   ```

3. **Install dependencies and import your existing posts:**

   ```
   pnpm install
   pnpm db:seed        # creates the posts table + imports the 3 starter MDX posts
   ```

4. **Run it:**
   ```
   pnpm dev
   ```
   Open <http://localhost:3000/admin/login> and enter `ADMIN_PASSWORD`.

## Using the panel

- **/admin** — lists every post (published + drafts) with Edit / Delete / View.
- **New post** — title, slug (auto-filled from the title), description, category, tags,
  date, a **Published** toggle, and a Markdown/MDX body. Saving a published post makes
  it live instantly. Leave it unpublished to keep it as a hidden draft.
- **Log out** clears your session.

## Deploying

Set the same three environment variables in your host (e.g. Vercel → Project →
Settings → Environment Variables). The table is created automatically on first use.
Because the blog renders dynamically from the database, **publishing never requires a
redeploy** — just hit Create/Save in the admin panel.

## Notes

- `/admin` and `/api` are `noindex` and disallowed in `robots.txt`.
- The login session is an httpOnly, HMAC-signed cookie (7-day expiry).
- The old `content/blog/*.mdx` files are only used by `pnpm db:seed`; after seeding,
  the database is the source of truth.
