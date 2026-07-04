import Image from "next/image";

import { worldAssetUrl } from "@/lib/world/asset-url";
import { CHAPTER_ACCENTS } from "@/lib/world/world-theme";

const SPLASH_BG = worldAssetUrl("/world/scenes/intro-hero-dawn.png");
const PORTRAIT_SRC = worldAssetUrl("/world/character/idle/east/0.png");
const intro = CHAPTER_ACCENTS.intro;

const STARS = [
  { left: "11%", top: "14%", delay: "0s", size: 2 },
  { left: "24%", top: "7%", delay: "0.7s", size: 1 },
  { left: "38%", top: "11%", delay: "1.4s", size: 2 },
  { left: "52%", top: "5%", delay: "0.3s", size: 1 },
  { left: "67%", top: "9%", delay: "1.1s", size: 2 },
  { left: "81%", top: "13%", delay: "0.5s", size: 1 },
  { left: "91%", top: "6%", delay: "1.8s", size: 2 },
  { left: "18%", top: "22%", delay: "1.2s", size: 1 },
  { left: "44%", top: "18%", delay: "0.9s", size: 1 },
  { left: "73%", top: "20%", delay: "1.6s", size: 2 },
  { left: "58%", top: "24%", delay: "0.2s", size: 1 },
  { left: "86%", top: "17%", delay: "1.3s", size: 1 },
] as const;

export function WorldSplash() {
  return (
    <div
      id="world-splash"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[150] h-svh w-full overflow-hidden bg-[#05040b] transition-opacity duration-300 ease-out"
    >
      <div
        className="absolute inset-0 bg-cover bg-bottom opacity-55"
        style={{ backgroundImage: `url("${SPLASH_BG}")`, imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e1038]/80 via-[#05040b]/50 to-[#05040b]" />
      <div className="scene-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="world-splash-horizon pointer-events-none absolute inset-x-0 bottom-[30%] h-28 bg-gradient-to-t from-indigo-300/15 via-indigo-200/5 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-0" aria-hidden>
        {STARS.map((star, i) => (
          <span
            key={i}
            className="star-twinkle absolute bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.55) 2px 4px)",
        }}
      />
      <div className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex justify-center px-3 sm:px-4">
        <div
          className={`flex w-full max-w-md items-stretch overflow-hidden border-4 ${intro.border} ${intro.panel} ${intro.glow}`}
          style={{ imageRendering: "pixelated" }}
        >
          <div
            aria-hidden
            className="relative shrink-0 border-r-4 border-black/40 bg-[#0a0818]/90 p-1.5 sm:p-2"
          >
            <div className="relative size-12 overflow-hidden border-4 border-white/30 bg-[#1a1830] sm:size-16">
              <Image
                src={PORTRAIT_SRC}
                alt=""
                width={68}
                height={68}
                priority
                unoptimized
                className="absolute -top-1 left-1/2 h-[130%] w-auto max-w-none -translate-x-1/2 object-cover object-[center_15%]"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5 sm:px-4 sm:py-3">
            <p
              className={`text-[10px] font-bold tracking-[0.18em] uppercase sm:text-xs sm:tracking-[0.22em] ${intro.kicker}`}
            >
              {intro.label}
            </p>
            <p className="mt-0.5 text-sm font-bold text-white [text-shadow:2px_2px_0_#000] sm:text-base">
              Booting save file
              <span className="world-splash-cursor ml-0.5 inline-block">_</span>
            </p>
            <div className="mt-2 flex items-center gap-1" role="presentation" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="world-splash-block size-2 bg-indigo-300 shadow-[1px_1px_0_#000]"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
