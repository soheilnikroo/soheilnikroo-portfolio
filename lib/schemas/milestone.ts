import { z } from "zod";

export const MilestoneSchema = z.object({
  id: z.string().min(1),
  period: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});
export type Milestone = z.infer<typeof MilestoneSchema>;
export const MilestonesSchema = z.array(MilestoneSchema).min(1);
export type Milestones = z.infer<typeof MilestonesSchema>;
