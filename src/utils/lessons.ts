import { getCollection, type CollectionEntry } from "astro:content";
import { projects } from "../data/projects";

export type Lesson = CollectionEntry<"lessons">;

function byOrder(a: Lesson, b: Lesson): number {
  return a.data.order - b.data.order;
}

function projectOrder(slug: string): number {
  const index = projects.findIndex((p) => p.slug === slug);
  return index === -1 ? projects.length : index;
}

export async function getPublishedLessons(): Promise<Lesson[]> {
  const lessons = await getCollection("lessons", ({ data }) => !data.draft);
  return lessons.sort((a, b) => {
    const pa = projectOrder(a.data.project);
    const pb = projectOrder(b.data.project);
    if (pa !== pb) return pa - pb;
    return byOrder(a, b);
  });
}

export function lessonsOf(lessons: Lesson[], project: string): Lesson[] {
  return lessons.filter((l) => l.data.project === project).sort(byOrder);
}

export function lessonUrl(lesson: Lesson): string {
  return `/projek/${lesson.data.project}/${lesson.data.slug}`;
}

export function projectUrl(project: string, slug: string): string {
  return `/projek/${project}/${slug}`;
}
