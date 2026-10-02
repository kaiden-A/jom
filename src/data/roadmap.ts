export interface RoadmapItem {
  n: number;
  title: string;
  blurb: string;
}

export const roadmap: RoadmapItem[] = [
  {
    n: 2,
    title: "Setup monorepo + React + Express",
    blurb: "Skeleton projek, satu repo banyak app. Hello world dulu.",
  },
  {
    n: 3,
    title: "Database & API",
    blurb: "Table Neon, endpoint Express, CRUD gambar sampai jalan.",
  },
  {
    n: 4,
    title: "Upload gambar ke R2",
    blurb: "File upload, URL awam, dan cara optimize saiz gambar.",
  },
  {
    n: 5,
    title: "Admin section + auth",
    blurb: "Login, dashboard, manage folder. Ni kawasan kau sorang.",
  },
  {
    n: 6,
    title: "Komen, like & deploy",
    blurb: "Interaksi visitor, lepas tu naikkan ke internet.",
  },
];
