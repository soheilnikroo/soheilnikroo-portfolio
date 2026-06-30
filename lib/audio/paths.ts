/** Royalty-free audio under `public/audio/` — see `public/audio/LICENSES.md`. */
export const AUDIO = {
  ambient: {
    siteBed: "/audio/ambient/site-bed.ogg",
  },
  music: {
    intro: "/audio/music/intro.ogg",
    work: "/audio/music/work.ogg",
    skills: "/audio/music/skills.ogg",
    writing: "/audio/music/writing.ogg",
    contact: "/audio/music/contact.ogg",
  },
  sfx: {
    click: "/audio/sfx/click.ogg",
    select: "/audio/sfx/select.ogg",
    chime: "/audio/sfx/chime.ogg",
    dialogue: "/audio/sfx/dialogue.ogg",
    boxOpen: "/audio/sfx/box-open.ogg",
    reveal: "/audio/sfx/reveal.ogg",
    metaSwell: "/audio/sfx/meta-swell.ogg",
    transition: "/audio/sfx/transition.ogg",
    hover: "/audio/sfx/hover.ogg",
  },
} as const;

export type SfxId = keyof typeof AUDIO.sfx;
