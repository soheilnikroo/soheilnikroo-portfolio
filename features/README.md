# Features (UI layer)

Each feature is a self-contained vertical slice of the UI layer. Dependencies flow
inward only: features may import from `lib/world`, `lib/services`, `lib/data`, and
`lib/schemas`, never the reverse.

## Per-feature layout

```
features/<name>/
  index.ts           # public barrel
  components/        # Server by default; client islands as needed
  use-cases/         # feature-specific business logic (pure functions)
```

## Active features

- `world` — interactive scroll-scrubbed homepage (`lib/world` holds domain logic)
- `blog` — listing, reading, client-side search/filter
- `admin` — Postgres-backed post editor
- `ambient` — opt-in cinematic audio + volume controls

Domain logic for the world experience lives in **`lib/world/`**, not in the feature folder.
