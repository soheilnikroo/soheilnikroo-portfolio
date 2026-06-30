# Architecture

Clean-architecture layering with dependencies flowing inward (UI → business → data).
Path alias: `@/*` → repo root.

```
UI layer        app/ · components/ · features/*/components
Business layer  lib/world · lib/services · features/*/use-cases
Data layer      lib/data (repositories) · content/blog/*.mdx (seed only)
Contracts       lib/schemas (Zod)
Design system   lib/design/tokens.ts · app/globals.css · components/ui
```

## Layers

- **`lib/schemas`** — Zod schemas + inferred types. Shared contracts for data, business, and UI.
- **`lib/data`** — repositories. Validates with Zod before returning. The only layer that imports `lib/db`.
- **`lib/db`** — raw Postgres access (`posts-store`, migrations). Never imported from `app/` or `features/`.
- **`lib/world`** — scroll-linked portfolio world: chapter config, canvas helpers, audio, prop aggregation.
- **`lib/engine`** — framework-agnostic canvas engine (no React/Next imports).
- **`lib/services`** — pure helpers: date formatting, TOC, ambient audio controller.
- **`features/*`** — vertical UI slices (see `features/README.md`).
- **`components/`** — shared cross-feature UI.

## Blog

Runtime source of truth is **Postgres**. MDX files under `content/blog/` are used only by `pnpm db:seed`. Public routes and admin both go through `lib/data/posts.ts`.

## Ambient layer

The `ambient` feature provides opt-in background audio. No autoplay; respects reduced motion and mute preferences. Contract in `lib/services/audio.ts`.
