import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/lessons" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    lesson: z.number(),
    summary: z.string(),
    duration: z.string(),
    tags: z.array(z.string()).default([]),
    updated: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { lessons };
