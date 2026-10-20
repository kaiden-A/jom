export interface UpcomingLesson {
  order: number;
  slug: string;
  title: string;
  blurb: string;
  part?: string;
}

export interface ProjectPart {
  id: string;
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
  parts?: ProjectPart[];
}

export const projects: Project[] = [
  {
    slug: "frontend-development",
    title: "Frontend Development: HTML to React",
    tagline:
      "Start with a blank file, finish with a real React app. Build a calorie calculator three ways — static HTML and CSS, vanilla JavaScript, then React.",
    stack: ["HTML", "CSS", "JavaScript", "React"],
    status: "available",
    parts: [
      {
        id: "html",
        title: "HTML",
        blurb:
          "Structure. Headings, links, forms, tables, and the skeleton of a real page.",
      },
      {
        id: "css",
        title: "CSS",
        blurb:
          "Style. Layout, color, type, responsive design, and the small details that make it feel finished.",
      },
      {
        id: "javascript",
        title: "JavaScript",
        blurb:
          "Behavior. Data, logic, the DOM, events, storage, and talking to an API.",
      },
      {
        id: "react",
        title: "React",
        blurb:
          "Components. State, props, effects, and the same calculator rebuilt as a modern app.",
      },
    ],
    upcoming: [],
  },
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
