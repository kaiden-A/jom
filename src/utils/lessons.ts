import { getCollection, type CollectionEntry } from "astro:content";
import { projects, type Project, type ProjectPart, type UpcomingLesson } from "../data/projects";

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

export function projectOverviewUrl(project: string): string {
  return `/projek/${project}`;
}

/**
 * Projects without explicit parts get one "all" pseudo-part so the rest of
 * the UI can render every project the same way.
 */
export function getProjectParts(project: Project): ProjectPart[] {
  return (
    project.parts ?? [{ id: "all", title: project.title, blurb: project.tagline }]
  );
}

export interface PartGroup {
  part: ProjectPart;
  lessons: Lesson[];
  upcoming: UpcomingLesson[];
}

export function groupLessonsByPart(
  lessons: Lesson[],
  project: Project,
): PartGroup[] {
  return getProjectParts(project).map((part) => {
    const isPseudoPart = part.id === "all";
    return {
      part,
      lessons: isPseudoPart
        ? lessons
        : lessons.filter((l) => l.data.part === part.id),
      upcoming: isPseudoPart
        ? project.upcoming
        : project.upcoming.filter((u) => u.part === part.id),
    };
  });
}

export function getPartTitle(
  project: Project | undefined,
  partId: string | undefined,
): string | undefined {
  if (!project || !partId) return undefined;
  return project.parts?.find((part) => part.id === partId)?.title;
}
