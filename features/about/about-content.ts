/** Narrative milestones for the About chapter (edit freely). */
export type Milestone = {
  id: string;
  period: string;
  title: string;
  description: string;
};

export const milestones: Milestone[] = [
  {
    id: "spark",
    period: "The spark",
    title: "Fell for the web by breaking it",
    description:
      "Started by viewing source, tweaking things until they broke, then learning why. That loop never really stopped.",
  },
  {
    id: "craft",
    period: "Finding the craft",
    title: "From pages to products",
    description:
      "Moved from one-off pages to real products — and learned that the interesting problems live in architecture, performance, and motion.",
  },
  {
    id: "systems",
    period: "Systems thinking",
    title: "Design systems & accessibility",
    description:
      "Built token-driven design systems and made accessibility a default, not a checklist. Consistency became a feature.",
  },
  {
    id: "now",
    period: "Now",
    title: "Immersive, accessible experiences",
    description:
      "Today I focus on scroll-driven storytelling that stays fast and inclusive — expressive when you want it, calm when you need it.",
  },
];
