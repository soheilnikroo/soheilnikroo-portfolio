import Link from "next/link";
import type { ReactNode } from "react";

import { EmailLink } from "@/components/layout/email-link";
import { pixelFont } from "@/lib/world/pixel-font";
import {
  CHAPTER_ACCENTS,
  PIXEL_READABLE_BODY,
  PIXEL_READABLE_ON_DARK,
  WORLD_SHELL,
} from "@/lib/world/world-theme";

import type { WorldExperienceProps } from "./world-experience";

export type WorldNarrativeProps = WorldExperienceProps & {
  readonly variant?: "embedded" | "standalone";
};
function ChapterPanel({
  id,
  chapterId,
  goal,
  children,
}: {
  id: string;
  chapterId: keyof typeof CHAPTER_ACCENTS;
  goal: string;
  children: ReactNode;
}) {
  const accent = CHAPTER_ACCENTS[chapterId];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div
        className={`border-4 ${accent.border} ${accent.panel} ${accent.glow} px-4 py-5 sm:px-6 sm:py-6`}
      >
        <p className={`text-xs font-bold tracking-[0.18em] uppercase ${accent.kicker}`}>
          {accent.label}
        </p>
        <h2 id={`${id}-title`} className={`mt-2 text-xl font-bold sm:text-2xl ${accent.heading}`}>
          {goal}
        </h2>
        <div className={`mt-4 space-y-3 ${PIXEL_READABLE_BODY}`}>{children}</div>
      </div>
    </section>
  );
}
export function WorldNarrative({
  profileName,
  role,
  introProse,
  chapterGoals,
  projects,
  skills,
  posts,
  email,
  socials,
  variant = "embedded",
}: WorldNarrativeProps) {
  const standalone = variant === "standalone";
  return (
    <div
      id={standalone ? undefined : "world-narrative"}
      data-world-narrative={standalone ? undefined : "embedded"}
      className={`${pixelFont.variable} ${WORLD_SHELL} relative min-h-screen overflow-hidden${standalone ? "" : " world-narrative--game-mode"}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.14) 2px 4px)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8 border-4 border-white/25 bg-[#0d0b16]/95 px-5 py-5 shadow-[4px_4px_0_#000] sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/55">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] bg-rose-400/80" />
              <span className="size-2.5 rounded-[2px] bg-amber-300/80" />
              <span className="size-2.5 rounded-[2px] bg-indigo-400/80" />
              <span className="ml-2">save file — readable mode</span>
            </span>
            {standalone ? (
              <Link
                href="/"
                className="border-2 border-white/30 px-2 py-0.5 text-white/80 hover:border-white/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                ▶ resume game
              </Link>
            ) : (
              <Link
                href="/read"
                className="border-2 border-white/30 px-2 py-0.5 text-white/80 hover:border-white/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                open full page →
              </Link>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{profileName}</h1>
          <p className="mt-1 text-sm text-indigo-200/90">{role}</p>
          <p className={`mt-4 ${PIXEL_READABLE_ON_DARK}`}>{introProse}</p>
        </header>

        <div className="space-y-6">
          <ChapterPanel id="read-intro" chapterId="intro" goal={chapterGoals.intro ?? "About me"}>
            <p className={CHAPTER_ACCENTS.intro.body}>
              Same story as the opening chapter — Tehran, the turtle, the long climb into
              engineering.
            </p>
          </ChapterPanel>

          <ChapterPanel id="read-work" chapterId="work" goal={chapterGoals.work ?? "Work"}>
            <ul className="space-y-4">
              {projects.map((p) => (
                <li key={p.title}>
                  <Link
                    href={`/work/${p.slug}`}
                    className={`font-bold underline-offset-4 hover:underline ${CHAPTER_ACCENTS.work.link}`}
                  >
                    {p.title}
                  </Link>{" "}
                  <span className={CHAPTER_ACCENTS.work.muted}>
                    ({p.role} · {p.year})
                  </span>
                  <p className={`mt-1 ${CHAPTER_ACCENTS.work.body}`}>{p.summary}</p>
                </li>
              ))}
            </ul>
          </ChapterPanel>

          <ChapterPanel id="read-skills" chapterId="skills" goal={chapterGoals.skills ?? "Skills"}>
            <p className={CHAPTER_ACCENTS.skills.body}>{skills.map((s) => s.label).join(" · ")}</p>
          </ChapterPanel>

          {posts.length > 0 ? (
            <ChapterPanel
              id="read-writing"
              chapterId="writing"
              goal={chapterGoals.writing ?? "Writing"}
            >
              <ul className="space-y-2">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className={`underline-offset-4 hover:underline ${CHAPTER_ACCENTS.writing.link}`}
                    >
                      {post.title}
                    </Link>{" "}
                    <span className={`text-xs ${CHAPTER_ACCENTS.writing.muted}`}>
                      ({post.category} · {post.minutes} min)
                    </span>
                  </li>
                ))}
              </ul>
            </ChapterPanel>
          ) : null}

          <ChapterPanel
            id="read-contact"
            chapterId="contact"
            goal={chapterGoals.contact ?? "Contact"}
          >
            <p className={CHAPTER_ACCENTS.contact.body}>
              Life is a lot like a game — it all depends on how you play it.
            </p>
            <p className="mt-3">
              <EmailLink
                href={`mailto:${email}`}
                className={`underline-offset-4 hover:underline ${CHAPTER_ACCENTS.contact.link}`}
              >
                {email}
              </EmailLink>
            </p>
            <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-1 ${CHAPTER_ACCENTS.contact.body}`}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {s.label}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              ))}
            </div>
          </ChapterPanel>
        </div>

        <p className="mt-10 text-center text-xs text-white/40">
          $ <span className="animate-pulse">_</span> end of save file
        </p>
      </div>
    </div>
  );
}
