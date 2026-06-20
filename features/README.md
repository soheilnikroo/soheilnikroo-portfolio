# Features (UI layer)

Each feature is a self-contained vertical slice of the UI layer. Dependencies flow
inward only: features may import from `lib/services` (business) and `lib/data`/`lib/schemas`
(data/contracts), never the reverse.

## Per-feature layout

```
features/<name>/
  index.ts          # public barrel (what the rest of the app imports)
  components/        # section + sub-components (Server by default; client islands as needed)
  use-cases/         # feature-specific business logic (e.g. contact submission)
  motion.ts          # the section's motion language (durations/easings from lib/design/tokens)
```

## Planned features

- `hero`     — interactive, curiosity-driven intro
- `about`    — scroll-driven narrative timeline
- `skills`   — interactive relationship graph / constellation
- `projects` — immersive "destinations" with View Transitions into detail
- `blog`     — listing, reading, search/filter
- `contact`  — accessible form (Zod + Server Action) + social links
- `ambient`  — opt-in cinematic/lofi audio + background atmosphere (reduced-motion aware)

Created per step (7–12); `ambient` is wired in the motion step (5) and homepage steps.
