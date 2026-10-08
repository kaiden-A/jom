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
      "A photo website — people can browse, filter by folder, like and comment. Meanwhile you get an admin section to upload.",
    stack: ["React", "Express", "Neon", "Cloudflare R2"],
    status: "available",
    upcoming: [
      {
        order: 3,
        slug: "setup-monorepo",
        title: "Set up the monorepo + React + Express",
        blurb: "Project skeleton, one repo many apps. Hello world first.",
      },
      {
        order: 4,
        slug: "database-api",
        title: "Database & API",
        blurb: "Neon tables, Express endpoints, photo CRUD working end to end.",
      },
      {
        order: 5,
        slug: "upload-r2",
        title: "Upload photos to R2",
        blurb: "File upload, public URLs, and how to optimise image size.",
      },
      {
        order: 6,
        slug: "admin-auth",
        title: "Admin section + auth",
        blurb: "Login, dashboard, manage folders. This one's all yours.",
      },
      {
        order: 7,
        slug: "comments-likes-deploy",
        title: "Comments, likes & deploy",
        blurb: "Visitor interactions, then ship it to the internet.",
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
