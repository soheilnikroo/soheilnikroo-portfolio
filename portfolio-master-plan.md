# Portfolio as Interactive Experience — Master Plan

**Prepared for:** VPORT
**Role of this document:** Creative direction + UX + frontend architecture for a pixel-art, narrative portfolio set in Tehran.
**Date:** 2026-06-29

---

## 0. Read this first: where your brief is wrong (and why it matters)

You asked me to challenge assumptions. Here is the honest version before any praise.

**The single most dangerous idea in your brief is "scrolling no longer moves the page; it moves the character through a linear side-scroller."** It directly fights four of your own stated goals.

1. **It hijacks the one input every visitor trusts.** Wheel, trackpad, and touch all emit wildly different scroll deltas. The moment you remap scroll to "walk," a non-trivial fraction of visitors feel the page is "broken" — momentum overshoots, inertia fights them, and they can't tell how far a flick will travel. Scroll-jacking is the single most complained-about pattern on award sites. You will spend 40% of your engineering budget making it feel _acceptable_, not _great_.

2. **Your highest-value visitor has the least patience for it.** A hiring manager or senior engineer reviewing you spends 30–90 seconds and is often on a locked-down work laptop, sometimes reduced-motion, sometimes screen-reading. A _forced linear traversal_ means they must "play" through Chapter 1 (childhood) to reach Chapter 3 (your actual work). That is a conversion killer for the exact audience the site exists to convert.

3. **A canvas game is nearly the opposite of "crawlable + SEO-friendly + high Lighthouse."** Pixels drawn to a `<canvas>` are invisible to crawlers, invisible to screen readers, and contribute nothing to LCP/CLS except cost. If the game _is_ the site, you must author all content twice and you will fight Lighthouse the whole way.

4. **The art is the real iceberg.** A cohesive, hand-feeling pixel Tehran — streets, metro, cafés, parks, skyline, weather, day/night, a multi-frame animated character — is hundreds of hours of art with strict palette/scale discipline. This, not the code, is what kills these projects. (More in §10 and §15.)

**None of this means abandon the concept. It means invert the relationship.** The senior-engineer signal is _not_ "I built a game instead of a website." It is "I built a fast, accessible, crawlable site, and then layered a streamed, GPU-accelerated, fully-degradable interactive world on top of it from a single content source — and made the right call about which is the foundation." Judgment under constraints is the thing that reads as senior. A monolithic scroll-game reads as a talented junior who hasn't yet been burned by real users.

So my lead recommendation reshapes your concept in two ways (detailed in §1):

- **Two layers from one source of truth.** A canonical, server-rendered, deep-linkable content site is the foundation. The pixel world is a progressive enhancement that reads the same content.
- **A spatial spine that allows non-linear access** instead of a forced linear scroll. I'm proposing the **Tehran Metro** as that spine — it solves "let the recruiter jump straight to Work" _without_ breaking immersion, and the metro map doubles as your skills visualization and your sitemap. I think this is strictly better than a linear side-scroller, and §1 argues why.

If you read nothing else, read §0, §1, §12 (performance), and §15 (risks).

---

## 1. Creative concept

### 1.1 The reframed core: "A Day in Tehran, along the line"

The portfolio is **one continuous day in Tehran, traveled along a metro line.** Dawn at the start, deep night at the end. Time-of-day is the emotional through-line; the metro is the spatial spine.

- **Time as narrative.** You begin at **dawn** — a small room, a humming CRT, the quiet of someone first falling in love with code. You end at **night** — a rooftop over the city lights, the contact scene. The lighting model carries the story arc whether or not the visitor reads a single word. Morning = beginnings/learning; midday = the working city/projects; golden hour = reflection/skills; night = where you are now. This gives you cohesion that disconnected "chapters" never achieve.

- **The Metro as spine and menu.** Each chapter is a **station**. Traveling between them is a short, cinematic **train ride** (your scene transition / streaming boundary). Crucially, the **metro map is always one tap away** and lets anyone fast-travel to any station. That is the escape hatch that makes the experience safe for impatient, high-value visitors — they hit "Work," the camera rides the line there, and immersion is preserved instead of broken. The map _is_ the navigation, _is_ the skills graph (§4, Chapter 4), and _is_ the sitemap.

- **The character is you, but movement is shared, not hijacked.** Scrolling is _an_ input that advances the character along the current scene — but it is normalized, capped, and never the only way through. Keyboard (←/→, Space to interact), click-to-move on the scene, and the metro map all coexist. Scroll feeds a **camera/locomotion controller**, not the DOM scrollbar (§9).

### 1.2 Why this beats a pure linear side-scroller

| Concern                                               | Linear scroll-game                          | "Day in Tehran, along the line"               |
| ----------------------------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Recruiter wants Work _now_                            | Must traverse everything                    | Metro map → fast travel, immersion intact     |
| Narrative cohesion                                    | Episodic, can feel like disconnected levels | One day/one journey; lighting carries the arc |
| Skills visualization (you wanted "not progress bars") | Bolt-on                                     | The metro map literally _is_ the tech network |
| Navigation / deep links                               | Awkward (scroll position ≠ URL)             | Stations = routes = URLs, naturally           |
| Performance / streaming                               | One giant world to load                     | Stations are natural lazy-load/stream chunks  |

### 1.3 The two-layer architecture of the experience (the senior signal)

Everything renders from **one typed content source** (projects, posts, skills, bio as data — §11).

- **Layer A — Canonical site (the foundation).** Server-rendered HTML: real headings, real prose, real links, real images. Fast, accessible, crawlable, perfect Lighthouse. This is what loads if JS fails, if the GPU is weak, if `prefers-reduced-motion` is set, or if you're a crawler. It is a _genuinely good_ portfolio on its own.
- **Layer B — The world (the enhancement).** When the device is capable and motion is allowed, Layer B mounts as a client island over the same content and turns it into the explorable pixel Tehran. It never invents content Layer A doesn't have; it _dramatizes_ it.

This is the move that demonstrates architecture maturity: progressive enhancement, graceful degradation, single source of truth, and a clean seam between "content" and "presentation of content."

---

## 2. Gameplay & storytelling ideas (a menu, not a commitment)

Pick a small number and execute them to a high finish. Breadth here is a trap; polish is the signal.

**Spine options (choose one):**

- **A. Metro line (recommended).** Stations = chapters; the map = nav + skills + sitemap. Best non-linear access.
- **B. Single unbroken street pan.** One long Tehran boulevard from home to rooftop; transitions are just walking. Most "game-like," weakest for fast access.
- **C. Day/night only.** Time is the spine, scenes are places you wake/work/wind-down. Pair with A.
- _My lead = A + C: the metro through a single day._

**Mechanics that carry meaning (use 3–4, not all):**

- **Collect abilities / tools.** Walking past a milestone "unlocks" a tool (Git, React, TypeScript…) that visibly joins your toolbelt HUD. Skills shown as _acquisition_, not bars.
- **Interactive machines.** A café arcade cabinet that runs a live mini-demo of a project. A workshop bench where you "upgrade equipment" (career progression).
- **The metro map as a tech graph.** Lines = domains (frontend / animation / performance / tooling); stations = technologies; interchanges = where skills combine. Hovering a station shows proficiency + where you used it (links to a project).
- **Dialogue bubbles & environmental storytelling.** Instead of paragraphs: a sticky note on a monitor, a poster, an overheard line. Text lives in the DOM overlay (accessible), anchored to world objects.
- **Enter-a-building = open-a-project.** Doors are project entrances; inside is the case study: architecture, challenge, tech, live demo, animations.
- **Weather/lighting as mood, not decoration.** Rain during the "hard times / debugging" beat; clear golden hour at the skills reflection; first city lights at contact.
- **Found objects / easter eggs.** Optional collectibles reward the curious without gating anyone.

**Anti-patterns to avoid:** timed sections, fail states, anything that can trap a visitor, anything that _requires_ sound, and any mechanic that has no escape to plain content.

---

## 3. Overall world design

**Setting:** A stylized, affectionate Tehran. Not a literal map — a _remembered_ city. Alborz mountains on the far parallax layer, the skyline and Milad Tower mid-layer, streets and shopfronts in the foreground.

**Visual identity:**

- **Resolution & scale.** Pick one base tile (recommend **16×16** for environment tiles, **32×48** character) and never deviate. One "pixel" of art = a fixed integer number of CSS pixels; the whole world snaps to that grid. Mixed pixel scales are the #1 thing that makes pixel art look amateur.
- **Palette.** One master palette (32–48 colors) with **time-of-day ramps** (dawn / day / dusk / night variants) applied as a shader/tint, _not_ as redrawn art. This is how you get day-night cheaply and consistently.
- **Layers (back → front):** sky/weather → mountains → far skyline → mid buildings → street & interactables → character → foreground occluders (lamp posts, foreground foliage) → lighting overlay → DOM UI.
- **Districts (map to chapters):**
  - **Dawn — the small room / home block.** Origins.
  - **Morning — the learning quarter.** Bookstores, a college, internet café. Growth & mistakes.
  - **Midday — the work district.** Project buildings (one per case study).
  - **Golden hour — the workshop / metro interchange.** Skills as the tech-network map.
  - **Evening — the bazaar/library lane.** The blog as a newsstand/bookstore.
  - **Night — the rooftop café.** Contact & farewell.

**Cohesion rules (write these into the art bible — §10):** fixed light direction, fixed outline policy (e.g., selective dark outlines), consistent dithering density, shared ground-shadow style, one font (a licensed pixel font), one UI chrome style.

---

## 4. Scene-by-scene progression

Each scene is a **streamed unit**: its own asset bundle, its own entities, mounted on enter and torn down on exit. The URL always reflects the current station.

**Chapter 1 — Dawn / "The Beginning"** (`/` or `/start`)
A small room. CRT glow, a chair, posters, late-night quiet. The character sits, then stands and steps out as the visitor advances. Environmental story: a notebook of first programs, a clock reading 2:14 AM. Sets emotional baseline; teaches controls via a gentle in-world prompt ("→ or scroll to walk").

**Chapter 2 — Morning / "Learning"** (`/learning`)
Street comes alive at sunrise. Walk past a bookstore (titles = technologies you learned), an internet café, a wall of stickers. **Mechanic:** passing milestones _unlocks tools_ into the HUD. Mistakes shown as crossed-out posters that get "fixed." Visual metaphor over text.

**Chapter 3 — Midday / "Professional Work"** (`/work`, `/work/[project]`)
The work district. Each significant project is a **building you can enter**. Entering = a smooth camera push-in + interior scene with: the problem, your role, the architecture (an in-world diagram), the tech stack (as objects/signage), an embedded **live demo** (iframe/canvas), and 1–2 standout interactions. Exiting returns you to the street at the same spot. This chapter must be reachable in one tap from the map.

**Chapter 4 — Golden hour / "Skills"** (`/skills`)
A metro interchange / workshop. The **metro map IS the skills graph**: lines are domains, stations are technologies, interchanges show how they combine. Interactive: hover/tap a station → proficiency, years, and "used in →" links to projects. Optional "upgrade the workbench" animation showing career leveling.

**Chapter 5 — Evening / "Blog"** (`/blog`, `/blog/[slug]`)
A newsstand + bookstore lane. Articles are physical: magazines on a rack, books on a shelf, a newspaper headline. Walking the lane reveals them; picking one opens the article as a clean DOM reading view over a dimmed world (best of both: immersive entry, readable content, crawlable HTML).

**Chapter 6 — Night / "Contact"** (`/contact`)
Rooftop café over a lit Tehran, Milad Tower glowing. The journey rests. Contact options as glowing signs; a guestbook; a final dialogue line from "you." Memorable closing image. Subtle ambient parallax, first stars, distant traffic.

---

## 5. Interaction design

- **Camera, not scrollbar.** Input → normalized intent → a camera/locomotion controller with critically-damped easing (spring or exponential smoothing). The DOM scrollbar is decoupled from world position. (§9 details the input model.)
- **Multiple inputs, equal footing.** Scroll, ←/→ + Space, click-to-walk, and the map. Reduced-motion and keyboard users get the full story.
- **Cinematic transitions between scenes.** Train ride / camera dolly / cross-fade with a brief loading mask that hides the stream boundary. Never a hard cut.
- **Parallax** on 4–6 depth layers, driven by camera X, GPU-transformed only.
- **Interactive objects** announce themselves (glow/bob on proximity) and respond to one verb ("Enter," "Read," "Inspect"). Keep the verb set tiny.
- **Dialogue bubbles** are DOM elements positioned over world anchors — accessible, selectable, translatable.
- **Dynamic lighting** as a fragment-shader overlay (radial gradients for lamps/CRT, global tint for time-of-day). Cheap, high-impact.
- **Weather** (rain, light snow, haze) as a particle layer that can be disabled for perf/motion.
- **Day↔night** as a palette ramp + light overlay interpolation tied to chapter, not wall-clock (so the arc is authored, not random).
- **Audio (optional, opt-in, never required).** Ambient city loop, soft footsteps, a chime on unlock. Muted by default; one obvious toggle.

---

## 6. Technical architecture

### 6.1 Recommended stack (greenfield, justified)

| Concern            | Choice                                                                                                | Why                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | **Next.js 16 (App Router, RSC, Turbopack)** + **TypeScript (strict)**                                 | Server-renders Layer A for SEO/LCP; route segments = stations = deep links; per-route code-splitting; the world mounts as a client island.                                                                        |
| Content            | **MDX + Zod-validated content collections** (file-based)                                              | Projects/posts/skills authored as typed data; rendered as crawlable HTML _and_ fed to the world. One source of truth. (Swap to Sanity/Contentful later if you want a CMS — the content interface stays the same.) |
| Game renderer      | **PixiJS v8** (WebGL backend in production, WebGPU progressively, **Canvas fallback**)                | Mature 2D/sprite/atlas pipeline, excellent batching, shader hooks for lighting/tint. v8's experimental Canvas renderer + your DOM Layer A give a real fallback chain.                                             |
| Scroll/input       | **Lenis** (normalized scroll) feeding a custom camera controller; **not** GSAP ScrollTrigger pinning  | Lenis is the 2026 standard for normalized, momentum scroll without breaking sticky/CSS; you consume its delta as _intent_, not page position.                                                                     |
| UI micro-animation | **Motion (motion.dev)**                                                                               | Small, React-friendly, for HUD/menus/overlays. Keep it off the hot game loop.                                                                                                                                     |
| Game logic         | **Lightweight ECS (Miniplex)** or a minimal hand-rolled scene-graph + systems                         | Entities (character, NPCs, doors, collectibles) as data; systems for movement, parallax, interaction, animation. Clean separation, testable.                                                                      |
| App/game state     | **Zustand** (vanilla store, used outside React render) + **XState** for the narrative/chapter machine | Game loop mutates a store that does _not_ trigger React re-renders; XState models chapter transitions explicitly. URL is source of truth for "where am I."                                                        |
| Tilemaps           | **LDtk** (or Tiled) → JSON → typed loader                                                             | Author levels visually; load as data.                                                                                                                                                                             |
| Audio              | **Howler.js**, lazy-loaded, opt-in                                                                    | Simple, robust sprite-based audio.                                                                                                                                                                                |
| Testing            | **Vitest** (unit), **Playwright** (e2e + visual + a11y via axe), **Lighthouse CI**                    | Proves the quality claims in CI.                                                                                                                                                                                  |
| Deploy             | **Vercel** (or static export → Cloudflare)                                                            | First-class Next support; edge caching for Layer A.                                                                                                                                                               |

**Strong alternative worth naming:** **Astro** (islands) is arguably an even cleaner fit for "static content + one heavy interactive island," with less JS by default. I lead with Next because route-based scene streaming, deep-linking into project interiors, and a single app model are slightly more ergonomic for this design — but if you want the absolute leanest Layer A, Astro + a Pixi island is defensible. Either is a senior-credible choice; pick one and own the rationale.

### 6.2 Layered runtime model

```
┌────────────────────────────────────────────────────────────┐
│ Layer A — Canonical site (RSC/SSR HTML)                      │
│   semantic sections, real content, links, <img>, metadata    │
│   ← this is what crawlers, no-JS, reduced-motion, low-end see │
├────────────────────────────────────────────────────────────┤
│ Capability gate (JS + WebGL + !reduced-motion + viewport ok) │
├────────────────────────────────────────────────────────────┤
│ Layer B — The World (client island)                          │
│   ┌── Engine ──────────────────────────────────────────┐    │
│   │ Renderer (Pixi)  Camera  Input  Systems(ECS)  Loop  │    │
│   └─────────────────────────────────────────────────────┘   │
│   ┌── Scene streaming ─────────────────────────────────┐    │
│   │ load/unload station bundles + atlases on demand     │    │
│   └─────────────────────────────────────────────────────┘   │
│   ┌── DOM overlay (accessible) ─────────────────────────┐    │
│   │ dialogue, HUD, menus, project/article reading views │    │
│   └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
   Shared: typed content layer • app store (Zustand) • narrative machine (XState)
```

The engine is **framework-agnostic** (plain TS, no React imports). React/Next only _mounts_ it and renders the DOM overlay + Layer A. This keeps the hot path out of React's reconciler and makes the engine independently testable and reusable.

---

## 7. Folder structure

```
portfolio/
├─ app/                              # Next.js App Router (Layer A + island mount)
│  ├─ layout.tsx                     # metadata, fonts, JSON-LD
│  ├─ page.tsx                       # Chapter 1 (canonical content)
│  ├─ work/[slug]/page.tsx           # project case studies (crawlable)
│  ├─ blog/[slug]/page.tsx           # articles (crawlable)
│  ├─ skills/page.tsx
│  ├─ contact/page.tsx
│  └─ (experience)/ExperienceMount.tsx  # client island that boots the engine
│
├─ content/                          # SINGLE SOURCE OF TRUTH (authored data)
│  ├─ projects/*.mdx
│  ├─ posts/*.mdx
│  ├─ skills.ts
│  └─ schema.ts                      # Zod schemas + types
│
├─ engine/                           # framework-agnostic game engine (pure TS)
│  ├─ core/                          # GameLoop, Clock, Ticker, EventBus
│  ├─ render/                        # Pixi setup, layers, camera, lighting shader
│  ├─ input/                         # scroll(Lenis)/keyboard/pointer → Intent
│  ├─ ecs/                           # world, components, systems
│  │  ├─ components/                 # Position, Sprite, Animatable, Interactable…
│  │  └─ systems/                    # movement, parallax, animation, interaction
│  ├─ scenes/                        # per-station scene definitions + streaming
│  │  ├─ SceneManager.ts
│  │  └─ stations/<chapter>/
│  ├─ narrative/                     # XState chapter machine, triggers
│  ├─ assets/                        # AssetManifest, loaders, atlas registry
│  └─ a11y/                          # reduced-motion + keyboard story driver
│
├─ ui/                               # React DOM overlay components
│  ├─ hud/  dialogue/  menu/  reading/  MetroMap.tsx
│
├─ state/                            # Zustand stores (app, settings, progress)
├─ lib/                              # capability detection, content loaders, seo
├─ public/assets/                    # packed atlases (.json+.webp/.png), audio, fonts
├─ art-bible/                        # palette, scale rules, references (non-shipped)
├─ tests/                            # unit, e2e, visual, a11y, lighthouse config
└─ tooling/                          # asset-pack scripts (Aseprite/LDtk → atlas)
```

**Separation of concerns is the headline here:** `content/` knows nothing about rendering; `engine/` knows nothing about React; `ui/` is the only place DOM and engine meet; `state/` is the shared contract. A reviewer reading this tree should immediately see the discipline.

---

## 8. Rendering strategy

- **Two render targets, one content model.** DOM (Layer A + overlay) and a single Pixi canvas (Layer B world). They never fight: the world draws environment + character; the DOM draws all _text_ and UI.
- **Renderer fallback chain:** WebGPU (if stable in that browser) → WebGL (production default) → Pixi Canvas renderer → **Layer A only** (no canvas). Detect once at boot; never assume.
- **Pixel-perfect discipline.** Integer scaling only; `roundPixels` on; nearest-neighbor sampling; snap camera to the device-pixel grid to avoid shimmer. Render the world at a fixed virtual resolution and upscale by an integer factor chosen from viewport size.
- **Layered parallax via container transforms.** 4–6 `Container`s, each translated as a function of camera X and a depth factor. GPU transforms only — no per-frame re-layout.
- **Sprite batching & atlases.** Everything from packed texture atlases so draw calls stay low; group by atlas/layer; avoid tint/blend-mode thrash.
- **Lighting & time-of-day as shaders.** A full-screen overlay pass (tint + radial light masks) and a palette-ramp filter. Day/night = interpolate two ramp LUTs by a `t` the narrative machine sets per chapter. Cheap, consistent, no redrawn art.
- **Culling & resolution caps.** Only draw what's near the camera; cap `resolution` at ~2 (don't render a giant world at DPR 3 on a phone); render weather/particles at lower res.
- **Fixed-timestep simulation, interpolated render.** Deterministic movement/physics at a fixed dt; render interpolates between states for smoothness independent of frame rate.

---

## 9. Animation strategy

**Three clearly separated animation domains — do not mix their tools:**

1. **World simulation (the game loop).** Character locomotion, camera, parallax, particles, sprite frame animation. Driven by a single `requestAnimationFrame` loop with a fixed-timestep accumulator. State lives in the ECS, _not_ in React. This is the hot path; it must allocate nothing per frame (object pools for particles, reused vectors).

2. **Sprite/frame animation.** Aseprite-exported animation tags (idle, walk, interact) → atlas frames → an `Animatable` component with a frame clock. Blend by swapping clips, not by tweening pixels.

3. **UI micro-interactions (DOM).** HUD reveals, menu transitions, dialogue pop-in — **Motion**, on the DOM, off the game loop.

**The input→motion model (this is the answer to "not ScrollTrigger pinning"):**

```
raw scroll/key/pointer
   → Lenis normalizes wheel/touch into a smooth delta
   → InputSystem converts delta into an *intent* (e.g., walkVelocityTarget)
   → LocomotionSystem critically-damps current → target (spring)
   → CameraSystem follows character with its own damping + look-ahead
   → render reads camera each frame
```

Scroll never sets world position directly; it expresses _intent to move_, which the simulation smooths. That's why it feels like driving a camera, not nudging a scrollbar — and it's why keyboard/click can feed the exact same pipeline.

**Reduced-motion path:** the same narrative machine advances on click/key/scroll _as discrete steps_ — no parallax drift, no camera spring, no particles. The story still progresses; it just doesn't move continuously.

---

## 10. Asset pipeline

This is the part most likely to sink the project, so treat it as an engineering system, not "draw some sprites."

**Authoring → shipping flow:**

```
Art bible (palette, scale, light rules)        ← write this BEFORE drawing anything
   → Aseprite (hero sprites, animations, tilesets)   [$20 one-time, the standard]
   → LDtk/Tiled (assemble scenes from tiles → JSON)
   → tooling/pack: TexturePacker/free-tex-packer → atlas (.json + .png)
   → optimize: oxipng/pngquant for indexed PNG; WebP/AVIF for large static art
   → public/assets/<chapter>/ as versioned, hashed bundles
   → engine AssetManifest references atlases per scene → streamed on demand
```

**On AI generation (and the PixelAILab MCP you mentioned):**

- If the **PixelAILab MCP** (or similar) is connected, I can use it to generate _drafts_. It was not in my available tools this session — wire it up and I'll integrate it into `tooling/`.
- Realistic 2026 workflow that actually yields consistency: **train a custom style model (LoRA) on your art bible** (Scenario-style) or use a "style-lock" generator, produce drafts, then **finish hero assets by hand in Aseprite.** AI is good for backgrounds/props/first drafts; it is _not_ reliable for frame-coherent character animation — those frames you draw/clean up yourself. Do not ship raw generations; they drift in palette, scale, and outline and will break the cohesion that you correctly flagged as critical.

**Consistency enforcement (automate it):**

- A lint script that checks every shipped PNG against the master palette and flags off-palette pixels.
- A scale check: every sprite's native size is a multiple of the base grid.
- Atlas budget per scene (e.g., ≤ 4–8 MB decoded); CI fails if exceeded.

**Asset list to commission/produce (minimum viable, hero-quality):**

- Character: 32×48, tags = idle, walk, interact, sit (8–12 frames each).
- Tilesets: street, interior, metro, rooftop (16×16).
- Building facades incl. enterable doors (one per project).
- Props/interactables: bookstore, arcade cabinet, newsstand, workbench, lamp posts, signage.
- Skyline + Milad Tower + mountains (parallax plates).
- Weather particles (rain, snow, haze) + light masks.
- One licensed pixel font; one UI chrome set.

---

## 11. State management

**Three stores, three jobs — keep them apart:**

1. **Content (build-time, read-only).** Zod-validated MDX/TS collections. Typed. Imported by both Layer A pages and the engine's scene definitions. Never mutated at runtime.

2. **Narrative machine (XState).** Explicit finite states for chapters and scene transitions (`dawn → riding → morning → …`), plus interaction sub-states (`exploring → enteringBuilding → readingProject → exiting`). Benefits: transitions are legible, illegal states are impossible, and the machine is unit-testable in isolation. The machine sets `timeOfDay`, current scene, and what's interactable.

3. **App/runtime store (Zustand, vanilla).** Settings (reduced-motion, audio on/off, quality tier), progress (chapters seen, tools unlocked), and a _bridge_ the engine writes to. **The game loop mutates engine state directly (ECS), not React state.** Only discrete, low-frequency facts (current chapter, unlocked tool, dialogue text) cross into Zustand to update the DOM overlay. This is the key perf decision: 60fps simulation must never trigger React renders.

**URL is the source of truth for "where."** Each station is a route; deep links work; back/forward work; sharing a project link lands on the crawlable case study (which can then offer "enter the world here"). This single decision is what reconciles immersion with navigation, SEO, and accessibility.

---

## 12. Performance optimization plan

Treat performance as a feature with budgets enforced in CI.

**Budgets (initial route / Layer A):**

- JS ≤ ~120 KB gz on first load; engine + Pixi load _only_ when Layer B is gated in.
- LCP < 2.0s, CLS < 0.05, INP < 200ms on mid-tier mobile. Lighthouse ≥ 95 for the canonical routes (the game canvas is excluded from those routes' critical path by construction).

**Tactics:**

- **The engine is lazy.** `import()` Pixi + engine behind the capability gate and an idle/interaction trigger. A crawler or a quick visitor never downloads it.
- **Scene streaming / code-split per station.** Each chapter's bundle + atlases load on approach and unload on exit (texture eviction). Memory stays bounded regardless of journey length.
- **Asset discipline.** Atlases (few draw calls), indexed PNGs, AVIF/WebP for big static plates, audio sprites, font subsetting, `font-display: swap`.
- **GPU-friendly only.** Animate `transform`/`alpha` (compositor); never animate layout properties. Lighting/tint in shaders, not CPU.
- **Hot loop hygiene.** Fixed timestep, object pools, zero per-frame allocation, no `console.log`, no closures created in `update()`. Profile with the Performance panel; keep main-thread work per frame well under the frame budget.
- **Adaptive quality tiers.** Detect device (cores, memory, DPR, GPU) → choose tier (particles on/off, parallax layer count, resolution cap, MSAA). Fall back automatically if frame time degrades (measure, then downgrade).
- **Render only when needed.** Pause the ticker when the tab is hidden or the world is fully idle; throttle off-screen work.
- **Ship-time checks.** Lighthouse CI + bundle-size CI + a WebGL-context-loss test (the GPU _will_ drop the context on some machines — handle it).

---

## 13. Accessibility strategy

Accessibility is not a fallback here; it's Layer A done right.

- **Semantic foundation.** Layer A is real HTML: landmark regions, a logical heading hierarchy, lists, links, `<img alt>`. Everything a screen reader needs exists independent of the canvas.
- **`prefers-reduced-motion` is first-class.** When set (or toggled in-UI), the world runs in **step mode**: no continuous camera/parallax/particles; chapters advance as discrete, focusable sections. The story is fully consumable.
- **Keyboard end-to-end.** Tab order through interactables; ←/→ + Space to move/act; visible focus rings; a persistent **"Skip the experience / read as a page"** control as the very first focusable element.
- **Canvas is `aria-hidden`; the truth is in the DOM.** Dialogue, labels, and content are DOM nodes (`aria-live` for dialogue updates), so AT users get the narrative text, not a black box.
- **Contrast & legibility.** UI text meets WCAG AA against its backdrop (a scrim behind dialogue over busy art); never rely on color alone for state.
- **Focus management across scene changes.** On transition, move focus to the new scene's heading; announce the chapter via a live region.
- **No seizure risk.** Cap flashing; gentle weather/lighting transitions; respect reduced-motion for any rapid change.
- **Prove it.** axe in Playwright + manual screen-reader passes (VoiceOver/NVDA) as a release gate.

---

## 14. SEO strategy

- **Server-render the content (RSC/SSR).** Every chapter and every project/article is a real, crawlable route with server-rendered prose and headings. The interactive layer enhances these pages; it does not replace their content.
- **Per-route metadata.** Titles, descriptions, canonical URLs, Open Graph/Twitter cards (use a generated pixel-art OG image per project — on brand _and_ good for shares).
- **Structured data (JSON-LD).** `Person` (you), `WebSite`, `BreadcrumbList`, `CreativeWork`/`SoftwareSourceCode` per project, `BlogPosting` per article. This is what earns rich results and feeds AI answer engines.
- **Crawlable internal linking.** The metro map and project doors render as real `<a href>`s in Layer A (the world intercepts clicks for capable clients via progressive enhancement). Crawlers follow the links; users get the animation.
- **Sitemap + robots.** Generated `sitemap.xml`, sensible `robots.txt`, clean canonical strategy (one canonical per piece of content; the "enter the world" state is a layer, not a duplicate URL).
- **Performance = ranking.** The Core Web Vitals work in §12 is also SEO work.
- **Content is authored once** (§11) so there is zero risk of the crawlable copy drifting from the in-world copy.

---

## 15. Risks & trade-offs

| Risk                                                                                  | Severity | Mitigation                                                                                                                                    |
| ------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Art production overruns / inconsistency** (the real project killer)                 | High     | Art bible first; palette/scale lint in CI; AI for drafts only, hand-finish heroes; ship chapters incrementally so partial art still launches. |
| **Scope creep** (you listed ~15 mechanics + weather + day/night + audio + 6 chapters) | High     | Pick 3–4 mechanics; vertical-slice one chapter end-to-end before widening; everything else is post-launch.                                    |
| **Scroll feel never satisfies everyone**                                              | Medium   | Decouple from scrollbar (§9); offer keyboard/click/map; persistent "read as page" escape; user-tunable sensitivity.                           |
| **Performance on low-end / locked-down devices**                                      | Medium   | Capability gate + quality tiers + Layer A fallback; bounded memory via scene streaming; context-loss handling.                                |
| **WebGPU/WebGL inconsistency across browsers**                                        | Medium   | WebGL is the production default in 2026; WebGPU is progressive; Canvas + Layer A below it.                                                    |
| **Accessibility regressions as visuals grow**                                         | Medium   | a11y gates in CI; reduced-motion step-mode built from day one, not retrofitted.                                                               |
| **You over-build the engine and under-ship the content**                              | Medium   | The content site (Layer A) is independently shippable in week ~2; the world is enhancement. Always have a launchable site.                    |
| **Time-to-first-meaningful-impression for recruiters**                                | Medium   | Map/fast-travel + deep links + a Work-first entry option so the high-value visitor reaches your projects in one action.                       |

**Honest trade-off summary:** the layered approach costs you _more_ up-front engineering (two presentations of one content model, a capability gate, an a11y step-mode) than a monolithic scroll-game. You buy, in return: a site that's always shippable, always accessible, always crawlable, always fast — and an interactive layer that can be as ambitious as time allows without ever putting the core portfolio at risk. For a portfolio whose job is to _get you hired by senior engineers_, that trade is correct.

---

## 16. Development roadmap

Milestone-based, not calendar-bound (adjust to your hours). Each milestone ends in something shippable.

**M0 — Foundations & decisions (week ~1)**
Lock stack, base grid/palette, art bible v1. Scaffold repo per §7. Set up CI: typecheck, lint, Vitest, Playwright+axe, Lighthouse CI, bundle-size + palette-lint gates. _Exit: empty app deploys; CI green._

**M1 — Layer A, the real portfolio (week ~2)**
Typed content layer (projects/posts/skills as MDX+Zod). Server-rendered, accessible, SEO-complete canonical site for all six sections + JSON-LD + sitemap + OG images. _Exit: a genuinely good, fast, accessible portfolio is live — independent of any game._ (This de-risks everything.)

**M2 — Engine core + vertical slice (weeks ~3–4)**
Framework-agnostic engine: game loop, Pixi setup, layers, camera + locomotion controller, Lenis-fed input, one ECS pass. Build **one** chapter end-to-end (recommend Chapter 1 Dawn → Chapter 3 Work as the slice): character, parallax, scene streaming, one enterable project, DOM dialogue overlay, capability gate, reduced-motion step-mode. _Exit: one chapter is playable AND fully degradable; this proves or kills the concept cheaply._

**M3 — Narrative machine + remaining chapters (weeks ~5–7)**
XState chapter machine; metro map (nav + skills graph); stream in Learning, Skills, Blog, Contact. Time-of-day ramps + lighting overlay. Tool-unlock mechanic. _Exit: full journey traversable with placeholder-to-final art._

**M4 — Art finishing & atmosphere (weeks ~6–8, overlaps M3)**
Replace placeholders with finished hero art; weather; audio (opt-in); transitions; polish interactions. Palette/scale lint must pass. _Exit: cohesive, atmospheric world._

**M5 — Performance, a11y, SEO hardening (week ~8–9)**
Hit budgets (§12); quality tiers; context-loss handling; screen-reader passes; Lighthouse ≥95 on canonical routes; cross-browser/device matrix incl. low-end mobile and reduced-motion. _Exit: all quality gates green._

**M6 — Launch & iterate**
Ship. Add analytics for drop-off (where do recruiters bail? add a fast-path). Backlog: extra easter eggs, more projects-as-buildings, seasonal weather. _The site was launchable since M1; everything after is upside._

---

## Appendix: immediate next steps I can take for you

- Scaffold the repo (§7) with CI gates and the engine skeleton.
- Build the M2 vertical slice (one playable, degradable chapter) to de-risk the concept before art investment.
- Draft the **art bible** (palette, scale rules, light direction, the exact asset spec from §10).
- Wire up the **PixelAILab MCP** (or a LoRA/style-lock pipeline) into `tooling/` for draft generation.

Tell me which and I'll start.

---

### Sources (stack currency, June 2026)

- Next.js current stable (16.2.x), App Router/RSC/Turbopack defaults: [Next.js releases](https://github.com/vercel/next.js/releases), [Next.js docs](https://nextjs.org/docs)
- React 19.2 stable, Server Components production-ready: [React v19.2](https://react.dev/blog/2025/10/01/react-19-2), [React versions](https://react.dev/versions)
- PixiJS v8 (v8.16, WebGPU core + Canvas fallback, WebGL recommended for prod): [PixiJS v8 launch](https://pixijs.com/blog/pixi-v8-launches), [PixiJS renderers guide](https://pixijs.com/8.x/guides/components/renderers)
- Lenis as the 2026 smooth-scroll standard (lenis/react): [Lenis](https://github.com/darkroomengineering/lenis), [lenis.dev](https://www.lenis.dev/)
- Pixel-art workflow & consistency (Aseprite + LoRA/style-lock AI drafts): [Best pixel art generators 2026](https://www.sprite-ai.art/blog/best-pixel-art-generators-2026), [PixelLab](https://www.pixellab.ai/)
