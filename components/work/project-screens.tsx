import Image from "next/image";

import type { ProjectGalleryStyle } from "@/lib/schemas/project";

function resolveGalleryStyle(
  galleryStyle: ProjectGalleryStyle | undefined,
  slug: string,
): ProjectGalleryStyle {
  if (galleryStyle) return galleryStyle;
  if (slug === "jaan") return "promo";
  if (slug === "snapp") return "browser";
  return "showcase";
}

function hexToRgb(hex: string): string {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return "14, 14, 20";
  return `${r}, ${g}, ${b}`;
}

function FluidShot({
  src,
  alt,
  priority,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1440}
      height={900}
      priority={priority}
      sizes="(max-width: 768px) 100vw, 1200px"
      className={`h-auto w-full ${className ?? ""}`}
    />
  );
}

function StageGlow({ accent }: { accent: string }) {
  const rgb = hexToRgb(accent);
  return (
    <>
      <div
        className="pointer-events-none absolute -top-16 left-[12%] size-56 rounded-full blur-3xl"
        style={{ background: `rgba(${rgb}, 0.35)` }}
      />
      <div
        className="pointer-events-none absolute right-[8%] -bottom-20 size-72 rounded-full blur-3xl"
        style={{ background: `rgba(${rgb}, 0.22)` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: `rgba(${rgb}, 0.12)` }}
      />
    </>
  );
}

function PromoGallery({ title, shots }: { title: string; shots: string[] }) {
  const [hero, ...rest] = shots;
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[20px] shadow-[0_28px_80px_-24px_rgba(0,0,0,0.55)]">
        <FluidShot src={hero} alt={`${title} — hero`} priority />
      </div>
      {rest.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {rest.map((src, i) => (
            <div
              key={src}
              className="overflow-hidden rounded-[18px] shadow-[0_20px_60px_-28px_rgba(0,0,0,0.5)]"
            >
              <FluidShot src={src} alt={`${title} screenshot ${i + 2}`} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const TILTS = ["-rotate-[2.5deg]", "rotate-[2deg]", "-rotate-[1.5deg]", "rotate-[2.5deg]"] as const;

function ShowcaseGallery({
  title,
  accent,
  shots,
}: {
  title: string;
  accent: string;
  shots: string[];
}) {
  const rgb = hexToRgb(accent);
  const [hero, ...rest] = shots;

  return (
    <div className="space-y-6">
      <div
        className="relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-10 sm:py-14"
        style={{
          background: `radial-gradient(ellipse 90% 80% at 50% 20%, rgba(${rgb}, 0.42) 0%, rgba(${rgb}, 0.14) 38%, #09090f 72%)`,
        }}
      >
        <StageGlow accent={accent} />
        <div className="relative flex justify-center">
          <div className={`${TILTS[0]} transition-transform duration-500 hover:rotate-0`}>
            <FluidShot
              src={hero}
              alt={`${title} — hero`}
              priority
              className="max-h-[min(74vh,700px)] w-auto max-w-[min(92vw,360px)] drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>
      </div>

      {rest.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((src, i) => (
            <div
              key={src}
              className="relative overflow-hidden rounded-[24px] px-5 py-8 sm:px-8 sm:py-10"
              style={{
                background: `radial-gradient(ellipse 85% 75% at 50% 15%, rgba(${rgb}, 0.34) 0%, rgba(${rgb}, 0.1) 42%, #0b0b12 78%)`,
              }}
            >
              <StageGlow accent={accent} />
              <div className="relative flex justify-center">
                <div
                  className={`${TILTS[(i + 1) % TILTS.length]} transition-transform duration-500 hover:rotate-0`}
                >
                  <FluidShot
                    src={src}
                    alt={`${title} screenshot ${i + 2}`}
                    className="max-h-[min(58vh,560px)] w-auto max-w-[min(88vw,300px)] drop-shadow-[0_28px_60px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function isPortraitShot(src: string): boolean {
  return /mobile|portrait|phone/i.test(src);
}

function BrowserWindow({
  title,
  accent,
  src,
  alt,
  priority,
}: {
  title: string;
  accent: string;
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const rgb = hexToRgb(accent);
  return (
    <div
      className="overflow-hidden rounded-[20px] border border-white/10 shadow-[0_32px_90px_-30px_rgba(0,0,0,0.65)]"
      style={{ background: `linear-gradient(180deg, rgba(${rgb}, 0.08), rgba(9,9,15,0.98))` }}
    >
      <div className="flex items-center gap-2 border-b border-white/8 bg-[#14141c]/90 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-md bg-white/6 px-3 py-1 text-[11px] text-white/55">
          {title.toLowerCase().replace(/\s+/g, "")}.com
        </span>
      </div>
      <FluidShot src={src} alt={alt} priority={priority} />
    </div>
  );
}

function BrowserGallery({
  title,
  accent,
  shots,
}: {
  title: string;
  accent: string;
  shots: string[];
}) {
  const rgb = hexToRgb(accent);
  const [hero, ...rest] = shots;

  return (
    <div className="space-y-6">
      <div
        className="relative overflow-hidden rounded-[28px] p-5 sm:p-8"
        style={{
          background: `radial-gradient(ellipse 95% 85% at 50% 0%, rgba(${rgb}, 0.28) 0%, rgba(${rgb}, 0.08) 40%, #09090f 100%)`,
        }}
      >
        <StageGlow accent={accent} />
        <div className="relative">
          {isPortraitShot(hero) ? (
            <div className="flex justify-center py-4">
              <div className="-rotate-[2deg]">
                <FluidShot
                  src={hero}
                  alt={`${title} — hero`}
                  priority
                  className="max-h-[min(70vh,640px)] w-auto max-w-[min(90vw,320px)] rounded-[24px] drop-shadow-[0_36px_70px_rgba(0,0,0,0.55)]"
                />
              </div>
            </div>
          ) : (
            <BrowserWindow
              title={title}
              accent={accent}
              src={hero}
              alt={`${title} — hero`}
              priority
            />
          )}
        </div>
      </div>

      {rest.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((src, i) =>
            isPortraitShot(src) ? (
              <div
                key={src}
                className="relative overflow-hidden rounded-[24px] px-5 py-8"
                style={{
                  background: `radial-gradient(ellipse 85% 75% at 50% 20%, rgba(${rgb}, 0.3) 0%, #0b0b12 78%)`,
                }}
              >
                <StageGlow accent={accent} />
                <div className="relative flex justify-center">
                  <div className={`${TILTS[(i + 1) % TILTS.length]}`}>
                    <FluidShot
                      src={src}
                      alt={`${title} screenshot ${i + 2}`}
                      className="max-h-[min(56vh,520px)] w-auto max-w-[min(88vw,280px)] drop-shadow-[0_28px_60px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <BrowserWindow
                key={src}
                title={title}
                accent={accent}
                src={src}
                alt={`${title} screenshot ${i + 2}`}
              />
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ProjectScreens({
  title,
  slug,
  accent,
  galleryStyle,
  cover,
  screenshots,
}: {
  title: string;
  slug: string;
  accent: string;
  galleryStyle?: ProjectGalleryStyle;
  cover?: string;
  screenshots: string[];
}) {
  const shots = [...(cover ? [cover] : []), ...screenshots.filter((src) => src !== cover)];
  if (shots.length === 0) return null;

  const style = resolveGalleryStyle(galleryStyle, slug);
  const color = accent || "#6366f1";

  return (
    <section className="mt-10">
      <h2 className="text-xs tracking-[0.3em] text-amber-700/80 uppercase dark:text-amber-300/80">
        Screens
      </h2>
      <div className="mt-5">
        {style === "promo" ? (
          <PromoGallery title={title} shots={shots} />
        ) : style === "browser" ? (
          <BrowserGallery title={title} accent={color} shots={shots} />
        ) : (
          <ShowcaseGallery title={title} accent={color} shots={shots} />
        )}
      </div>
    </section>
  );
}
