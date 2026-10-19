import { useState } from "react";
import {
  ChevronDown,
  Database,
  FlaskConical,
  Hammer,
  ImageUp,
  KeyRound,
  LayoutTemplate,
  Rocket,
  Server,
  type LucideIcon,
} from "lucide-react";

interface Phase {
  n: number;
  name: string;
  icon: LucideIcon;
  color: string;
  get: string;
  detail: string;
  lesson: string;
  slug: string;
}

const phases: Phase[] = [
  {
    n: 1,
    name: "Scaffold",
    icon: Hammer,
    color: "#4f46e5",
    get: "An empty project that installs",
    detail:
      "package.json, tsconfig, .gitignore, .env + .env.example. Nothing runs yet — but every tool is in place.",
    lesson: "Lesson 04",
    slug: "scaffold",
  },
  {
    n: 2,
    name: "Server skeleton",
    icon: Server,
    color: "#0ea5e9",
    get: "A server that boots and answers /health",
    detail:
      "config (zod-parsed env), the database client, error handling, security headers, app.ts, and one health route.",
    lesson: "Lesson 05",
    slug: "server-skeleton",
  },
  {
    n: 3,
    name: "Auth",
    icon: KeyRound,
    color: "#ea580c",
    get: "You can log in; strangers can't",
    detail:
      "One email + one password from env vars. A signed, HttpOnly cookie. Rate limiting. Same-origin checks.",
    lesson: "Lesson 06",
    slug: "auth",
  },
  {
    n: 4,
    name: "Pages",
    icon: LayoutTemplate,
    color: "#f59e0b",
    get: "Real screens, zero CSP errors",
    detail:
      "EJS templates with automatic escaping, post/redirect/get forms, and two tiny browser JS files. No framework.",
    lesson: "Lesson 07",
    slug: "pages",
  },
  {
    n: 5,
    name: "Resources",
    icon: Database,
    color: "#047857",
    get: "Your domain, stored and listed",
    detail:
      "The six-file pattern: table → service → router → view → mount → test. Migrations generated, then read by hand.",
    lesson: "Lesson 08",
    slug: "resources",
  },
  {
    n: 6,
    name: "Images",
    icon: ImageUp,
    color: "#e11d48",
    get: "Uploads go straight to R2",
    detail:
      "Presigned PUT from the browser, verified with HeadObject. The database keeps the key, never the file.",
    lesson: "Lesson 09",
    slug: "images",
  },
  {
    n: 7,
    name: "Tests",
    icon: FlaskConical,
    color: "#7c3aed",
    get: "Green suite, clean typecheck",
    detail:
      "vitest against a separate Neon branch, FakeStorage instead of real R2, a logged-in supertest agent.",
    lesson: "Lesson 10",
    slug: "tests",
  },
  {
    n: 8,
    name: "Deploy",
    icon: Rocket,
    color: "#221c46",
    get: "One container, live on the internet",
    detail:
      "Docker, CI/CD with a paths filter, secrets in the platform store, migrations applied by hand.",
    lesson: "Lesson 11",
    slug: "deploy",
  },
];

export default function PlanRoadmap() {
  const [open, setOpen] = useState(1);

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <p className="font-display text-sm font-semibold">
          The build order — 8 phases, no skipping
        </p>
        <p className="text-ink-soft text-xs font-bold">
          Tap a phase to see what you get
        </p>
      </div>

      <ol className="p-4 sm:p-6">
        {phases.map((phase, i) => {
          const Icon = phase.icon;
          const isOpen = open === phase.n;
          const isLast = i === phases.length - 1;
          return (
            <li key={phase.n} className="relative">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="border-line absolute top-12 left-[23px] h-[calc(100%-2.5rem)] border-l-2 border-dashed"
                />
              )}
              <button
                type="button"
                onClick={() => setOpen(isOpen ? 0 : phase.n)}
                aria-expanded={isOpen}
                className={`relative z-10 w-full rounded-2xl border-2 p-3 text-left transition-all duration-150 ${
                  isOpen
                    ? "border-transparent shadow-clay-xs bg-white"
                    : "border-transparent hover:bg-paper/70"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="font-display grid size-12 shrink-0 place-items-center rounded-2xl text-white transition-transform duration-150"
                    style={{
                      backgroundColor: isOpen ? phase.color : "#e8e3f0",
                      color: isOpen ? "#fff" : "#5d5680",
                    }}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-base font-semibold">
                        <span className="text-ink-soft/70">
                          Phase {phase.n}
                        </span>{" "}
                        · {phase.name}
                      </span>
                    </span>
                    <span
                      className={`text-ink-soft mt-0.5 block text-sm leading-relaxed font-bold ${
                        isOpen ? "" : "opacity-80"
                      }`}
                    >
                      {phase.get}
                    </span>
                  </span>
                  <ChevronDown
                    className={`text-ink-soft size-4 shrink-0 transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {isOpen && (
                <div className="pop-in relative z-10 mr-1 ml-[62px] rounded-2xl border-2 border-dashed px-4 py-3.5"
                  style={{ borderColor: `${phase.color}55` }}
                >
                  <p className="text-ink-soft text-sm leading-relaxed font-bold">
                    {phase.detail}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className="font-display rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: phase.color }}
                    >
                      {phase.lesson}
                    </span>
                    <a
                      href={`/projek/gallery-blog/${phase.slug}`}
                      className="border-line hover:border-brand/50 text-ink rounded-full border-2 bg-white px-3 py-1 text-xs font-bold transition-colors"
                    >
                      Jump to it
                    </a>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="border-line bg-mint/15 border-t px-4 py-3 text-sm font-bold sm:px-5">
        Every phase ends with a mission — the plan's own{" "}
        <code className="font-mono text-xs">Verify:</code> line. Pass it before you
        move on. That's the whole discipline.
      </p>
    </div>
  );
}
