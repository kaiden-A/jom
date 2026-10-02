import { getCollection, type CollectionEntry } from "astro:content";

export type Lesson = CollectionEntry<"lessons">;

function byOrder(a: Lesson, b: Lesson): number {
  return a.data.order - b.data.order;
}

export async function getPublishedLessons(): Promise<Lesson[]> {
  const lessons = await getCollection("lessons", ({ data }) => !data.draft);
  return lessons.sort((a, b) => {
    if (a.data.project !== b.data.project) {
      return a.data.project.localeCompare(b.data.project);
    }
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
