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
  level: "Beginner" | "Intermediate" | "Advanced";
  build: string;
  requirements?: string[];
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
    level: "Beginner",
    build: "Calorie calculator",
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
    level: "Intermediate",
    build: "Gallery blog",
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
    slug: "safelight",
    title: "Safelight: Digital Photography Marketplace",
    tagline:
      "A photography shop with two doors: watermarked previews in public, originals in a private vault. Next.js, Neon, R2, Resend, and a manual WhatsApp payment workflow.",
    stack: ["Next.js", "TypeScript", "Neon", "Cloudflare R2", "Resend"],
    status: "available",
    level: "Intermediate",
    build: "Safelight marketplace",
    requirements: [
      "Node.js 22+ and a code editor.",
      "A Neon account for Postgres.",
      "A Cloudflare account with R2 enabled.",
      "A Resend account and a domain you can verify for email.",
      "A WhatsApp number for the shop (a test number is fine).",
    ],
    parts: [
      {
        id: "plan",
        title: "The Plan",
        blurb:
          "Understand the two doors, design the shop window, and write the blueprint before code.",
      },
      {
        id: "build",
        title: "The Build",
        blurb:
          "Next.js, the order state machine, admin sessions, uploads, WhatsApp, email, and the download gateway.",
      },
      {
        id: "ship",
        title: "Prove & Ship",
        blurb:
          "Break the failure paths on purpose, deploy, and learn the house rules that keep the vault closed.",
      },
    ],
    upcoming: [
      {
        order: 6,
        slug: "one-admin-a-real-session",
        title: "One admin, a real session",
        blurb:
          "Argon2id, database sessions, login rate limits, and authorization inside every action.",
        part: "build",
      },
      {
        order: 7,
        slug: "the-public-door",
        title: "The public door",
        blurb:
          "The gallery, the photograph detail page, responsive previews, and SEO — with no original in sight.",
        part: "build",
      },
      {
        order: 8,
        slug: "the-vault-and-the-watermark",
        title: "The vault and the watermark",
        blurb:
          "Direct-to-R2 uploads, server-side sharp watermarks, preview variants, and publish/archive.",
        part: "build",
      },
      {
        order: 9,
        slug: "from-click-to-whatsapp",
        title: "From click to WhatsApp",
        blurb:
          "A server-priced order, a price snapshot, the WhatsApp handoff, and a claim that does not equal paid.",
        part: "build",
      },
      {
        order: 10,
        slug: "the-ledger",
        title: "The ledger",
        blurb:
          "The admin order desk, idempotent payment confirmation, refunds, and an audit timeline.",
        part: "build",
      },
      {
        order: 11,
        slug: "the-last-mile",
        title: "The last mile",
        blurb:
          "Resend, hashed download tokens, email retries, and a signed R2 URL that expires.",
        part: "build",
      },
      {
        order: 12,
        slug: "break-it-on-purpose",
        title: "Break it on purpose",
        blurb:
          "Tests and failure drills: double clicks, failed email, expired links, refunds, and price changes.",
        part: "ship",
      },
      {
        order: 13,
        slug: "ship-it-then-harden",
        title: "Ship it, then harden",
        blurb:
          "Vercel, Neon, R2 CORS, a verified sending domain, security headers, and redacted logs.",
        part: "ship",
      },
      {
        order: 14,
        slug: "house-rules-and-the-boss-fight",
        title: "House rules & the boss fight",
        blurb:
          "The invariants, the footgun gallery, the definition of done, and where to grow next.",
        part: "ship",
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
    level: "Intermediate",
    build: "Users API",
    upcoming: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
