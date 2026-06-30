import { z } from "zod";

export const ChapterIdSchema = z.enum(["intro", "work", "skills", "writing", "contact"]);
export type ChapterId = z.infer<typeof ChapterIdSchema>;

export const ChapterMetaSchema = z.object({
  id: ChapterIdSchema,
  title: z.string().min(1),
  weight: z.number().positive(),
});

export type ChapterMeta = z.infer<typeof ChapterMetaSchema>;

export const StoryBeatSchema = z.object({
  at: z.number().min(0).max(1),
  text: z.string().min(1),
});

export type StoryBeat = z.infer<typeof StoryBeatSchema>;

export const WorldNarrativeSchema = z.object({
  introProse: z.string().min(1),
  chapters: z.array(ChapterMetaSchema).min(1),
  chapterGoals: z.record(z.string(), z.string()),
  storyBeats: z.record(z.string(), z.array(StoryBeatSchema)),
});

export type WorldNarrative = z.infer<typeof WorldNarrativeSchema>;
