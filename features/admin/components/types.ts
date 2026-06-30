import type { Project } from "@/lib/schemas";

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  cover: string | null;
  published: boolean;
  date: string; // YYYY-MM-DD
};

export type AdminProject = {
  id: string;
  slug: string;
  data: Project;
};
