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
      "Website gambar — orang boleh tengok, filter ikut folder, like dan komen. Kau pula ada admin section untuk upload.",
    stack: ["React", "Express", "Neon", "Cloudflare R2"],
    status: "available",
    upcoming: [
      {
        order: 3,
        slug: "setup-monorepo",
        title: "Setup monorepo + React + Express",
        blurb: "Skeleton projek, satu repo banyak app. Hello world dulu.",
      },
      {
        order: 4,
        slug: "database-api",
        title: "Database & API",
        blurb: "Table Neon, endpoint Express, CRUD gambar sampai jalan.",
      },
      {
        order: 5,
        slug: "upload-r2",
        title: "Upload gambar ke R2",
        blurb: "File upload, URL awam, dan cara optimize saiz gambar.",
      },
      {
        order: 6,
        slug: "admin-auth",
        title: "Admin section + auth",
        blurb: "Login, dashboard, manage folder. Ni kawasan kau sorang.",
      },
      {
        order: 7,
        slug: "komen-like-deploy",
        title: "Komen, like & deploy",
        blurb: "Interaksi visitor, lepas tu naikkan ke internet.",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
