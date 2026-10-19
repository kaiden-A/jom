export interface UpcomingLesson {
  order: number;
  slug: string;
  title: string;
  blurb: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  stack: string[];
  status: "available" | "coming";
  upcoming: UpcomingLesson[];
}

export const projects: Project[] = [
  {
    slug: "gallery-blog",
    title: "Gallery Blog",
    tagline:
      "A photo website built one phase at a time with The Master Plan — visitors browse, you upload from an admin section. One app: Express, EJS, Neon, R2.",
    stack: ["Express", "EJS", "Neon", "Cloudflare R2"],
    status: "available",
    upcoming: [
      {
        order: 13,
        slug: "folders-filtering",
        title: "Folders & filtering",
        blurb: "Group photos into folders and filter the public page.",
      },
      {
        order: 14,
        slug: "likes-comments",
        title: "Likes & comments",
        blurb: "Let visitors interact — and keep it friendly.",
      },
      {
        order: 15,
        slug: "scheduled-chores",
        title: "Scheduled chores",
        blurb: "Sweep orphaned R2 objects and keep the house tidy.",
      },
    ],
  },
  {
    slug: "backend-expressjs",
    title: "Backend Development with ExpressJS",
    tagline:
      "The server side, explained — follow a request from the browser to the database and back, then build a real REST API with Express and MySQL.",
    stack: ["Node.js", "Express", "MySQL", "DBngin"],
    status: "available",
    upcoming: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
