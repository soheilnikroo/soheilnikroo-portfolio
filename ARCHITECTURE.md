# Architecture

Clean-architecture layering with dependencies flowing inward (UI → business → data).
Path alias: `@/*` → repo root.

```
UI layer        app/ · components/ · features/*/components
Business layer  features/*/use-cases · lib/services
Data layer      lib/data (repositories) · content/*.mdx
Contracts       lib/schemas (Zod)        ← data & business validate against these
Design system   lib/design/tokens.ts · app/globals.css · components/ui
```

## Layers

- **`lib/schemas`** — Zod schemas + inferred types. The single contract shared by data,
  business, and UI. Source of truth for shapes (`Profile`, `Project`, `PostMeta`, `ContactFormValues`).
- **`lib/data`** — repositories that read content (typed modules now; `content/blog/*.mdx`
  via gray-matter from Step 12) and validate with Zod before returning. UI never reads raw content.
- **`lib/services`** — framework-agnostic business helpers: `Result` type, ambient `audio`
  controller, and (later) reading-time / TOC / blog search-filter-sort.
- **`features/*`** — vertical UI slices (see `features/README.md`). Server Components by default;
  interactivity isolated into small client islands.
- **`components/`** — shared, cross-feature UI (`ui/` primitives, `theme/`, `motion/`).
- **`lib/design`** — design tokens; motion values mirrored from `app/globals.css`.

## Ambient / cinematic layer (opt-in)

The `ambient` feature provides a lofi/cinematic atmosphere (background + interaction SFX +
film-style section transitions). Rules:

1. **No autoplay** — sound starts only on an explicit user gesture; the choice is persisted.
2. **Reduced-motion & sound-off aware** — silent and still when the user opts out or prefers
   reduced motion; nothing essential is conveyed by sound or motion alone.
3. **Performance-budgeted** — background art/audio are lazy-loaded and optimized to protect LCP.

Contract lives in `lib/services/audio.ts` (`AmbientAudioController`, SSR-safe no-op default);
the browser implementation and UI controls land in the motion + homepage steps.
