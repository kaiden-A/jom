import {
  ArrowRight,
  Container,
  GitBranch,
  HeartPulse,
  Package,
  Rocket,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

interface Stage {
  icon: LucideIcon;
  title: string;
  sub: string;
  color: string;
}

const stages: Stage[] = [
  {
    icon: GitBranch,
    title: "git push",
    sub: "to the default branch",
    color: "#4f46e5",
  },
  {
    icon: ShieldCheck,
    title: "CI gates",
    sub: "typecheck + tests",
    color: "#047857",
  },
  {
    icon: Package,
    title: "Build the image",
    sub: "tsup, prune, tag by commit SHA",
    color: "#0ea5e9",
  },
  {
    icon: Container,
    title: "Push the image",
    sub: "one container, one process",
    color: "#7c3aed",
  },
  {
    icon: Rocket,
    title: "Deploy to Cloud Run",
    sub: "one origin, no CORS",
    color: "#ea580c",
  },
  {
    icon: HeartPulse,
    title: "You hit /health",
    sub: '{"status":"ok"}',
    color: "#221c46",
  },
];

const settings = [
  ["NODE_ENV", "production — enables the view cache"],
  ["COOKIE_SECURE", "true — it's HTTPS now"],
  ["PUBLIC_BASE_URL", "the exact public origin, scheme and all"],
  ["TRUST_PROXY", "1 on Cloud Run — or the login limiter bans everyone"],
];

const traps = [
  "views/ and public/ must ship in the image — the app resolves them from the working directory. Skip them and pages 500 with “Failed to lookup view”.",
  "Migrations are manual: docker run --rm -e DATABASE_URL=… <image> node dist/scripts/migrate.js. Deploys never migrate.",
  "Another edge in front? Firebase strips every cookie except __session — set SESSION_COOKIE_NAME=__session.",
  "Secrets (ADMIN_PASSWORD, APP_SECRET, R2 keys, DATABASE_URL) live in the platform's secret store — never in the image, never in the repo.",
];

export default function DeployPipeline() {
  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <p className="font-display text-sm font-semibold">
          From your laptop to the internet
        </p>
        <p className="text-ink-soft text-xs font-bold">
          One image, one origin, no CORS
        </p>
      </div>

      <div className="overflow-x-auto p-4 sm:p-6">
        <ol className="flex min-w-[760px] items-stretch gap-2">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isLast = i === stages.length - 1;
            return (
              <li key={stage.title} className="flex flex-1 items-center gap-2">
                <div className="border-line w-full flex-1 rounded-2xl border-2 bg-white p-3.5 text-center">
                  <span
                    className="mx-auto grid size-10 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="font-display mt-2.5 text-sm leading-tight font-semibold">
                    {stage.title}
                  </p>
                  <p className="text-ink-soft mt-1 text-[11px] leading-snug font-bold">
                    {stage.sub}
                  </p>
                </div>
                {!isLast && (
                  <ArrowRight
                    className="text-ink-soft/60 size-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-4 px-4 pb-5 sm:px-6 md:grid-cols-2">
        <div className="border-line rounded-2xl border-2 bg-white p-4 sm:p-5">
          <p className="font-display text-sm font-semibold">
            Production settings — the ones that bite
          </p>
          <ul className="mt-3 space-y-2">
            {settings.map(([key, note]) => (
              <li key={key} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <code className="font-mono text-brand-deep text-xs font-bold">
                  {key}
                </code>
                <span className="text-ink-soft text-sm leading-relaxed font-bold">
                  {note}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-rose/30 bg-rose/5 rounded-2xl border-2 p-4 sm:p-5">
          <p className="font-display text-sm font-semibold">
            The traps the plan warns about
          </p>
          <ul className="mt-3 space-y-2.5">
            {traps.map((trap) => (
              <li key={trap} className="flex items-start gap-2.5">
                <TriangleAlert
                  className="mt-0.5 size-3.5 shrink-0 text-rose"
                  aria-hidden="true"
                />
                <span className="text-ink-soft text-sm leading-relaxed font-bold">
                  {trap}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="border-line bg-mint/15 border-t px-4 py-3 text-sm font-bold sm:px-5">
        Deploy is the easy part —{" "}
        <span className="text-ink-soft">
          it's easy because phases 1–7 made it boring. Nothing new is introduced;
          it just moves.
        </span>
      </p>
    </div>
  );
}
