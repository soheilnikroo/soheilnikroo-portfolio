# Audio assets

Royalty-free OGG + MP3 pairs used by the portfolio game and site ambient layer.
Re-encode with `pnpm assets:optimize` after swapping source files (requires ffmpeg).

## Layout

```
public/audio/
├── ambient/site-bed.ogg   # Global bed (non-game pages)
├── music/                 # Per-chapter scroll loops
├── sfx/                   # UI + gameplay one-shots
└── LICENSES.md
```

Wired in `app/layout.tsx` via `<AmbientProvider bedSrc="/audio/ambient/site-bed.ogg">`.
Chapter music is in `lib/world/chapter-audio.ts`. SFX in `lib/world/audio.ts`.

Audio is **opt-in** and never autoplays until a user gesture.
