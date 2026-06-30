import { getSiteContentRow, upsertSiteContentRow } from "@/lib/db/site-content-store";
import { MilestonesSchema } from "@/lib/schemas";
import type { Milestone } from "@/lib/schemas";

const fallbackMilestones: Milestone[] = [
  {
    id: "spark",
    period: "The spark",
    title: "When the turtle moved",
    description:
      'In high school in Tehran I finally sat at a computer — Python 2, a little turtle on the screen. Everyone else seemed ahead of me. I wasn\'t "good at computers." But something clicked when that turtle drew its first line. I liked it too much to quit.',
  },
  {
    id: "craft",
    period: "Finding the craft",
    title: "C#, then the web",
    description:
      "I went to a private institute and learned C#. Then I found the web — and honestly, frontend stole my heart. React, tutorials, Quera contests — I was catching up, one late night at a time.",
  },
  {
    id: "career",
    period: "Stepping in",
    title: "Intern to developer",
    description:
      "My first step was an internship at ILIA Corporation (2019). Then Jaan — my first frontend role, React in production. All while studying computer science at Islamic Azad University, Tehran. School and work, side by side.",
  },
  {
    id: "now",
    period: "Now",
    title: "Snapp — shipping at scale",
    description:
      "Since 2022, Frontend Engineer at Snapp — TypeScript, React, Next.js, PWAs, UI kit, Redux Toolkit, and SWR on a product used by millions. I care about performance, design patterns, cross-browser quality, and mobile-first delivery. Side quests: learning Swift & SwiftUI; exploring Rust.",
  },
];

function warnDb(error: unknown): void {
  console.warn(
    "[milestones] database unavailable — using bundled fallback. Set DATABASE_URL and run `pnpm db:seed`.",
    error instanceof Error ? error.message : error,
  );
}

export async function getMilestones(): Promise<Milestone[]> {
  try {
    const row = await getSiteContentRow("milestones");
    if (!row) return fallbackMilestones;
    return MilestonesSchema.parse(row.data);
  } catch (error) {
    warnDb(error);
    return fallbackMilestones;
  }
}

export async function saveMilestones(data: Milestone[]): Promise<void> {
  const parsed = MilestonesSchema.parse(data);
  await upsertSiteContentRow("milestones", parsed);
}

/** @deprecated Use getMilestones() — kept for seed script compatibility. */
export const milestones = fallbackMilestones;

export type { Milestone };

export { fallbackMilestones };
