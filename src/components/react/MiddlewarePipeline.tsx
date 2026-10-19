import { useState } from "react";
import {
  Braces,
  Bug,
  ClipboardList,
  Cookie,
  FolderOpen,
  Globe,
  Route,
  SearchX,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface Stage {
  icon: LucideIcon;
  name: string;
  what: string;
  breaks?: string;
}

const asPlanned: Stage[] = [
  {
    icon: ShieldCheck,
    name: "securityHeaders",
    what: "Sets the CSP and the safety headers on every single response.",
  },
  {
    icon: FolderOpen,
    name: 'express.static("public")',
    what: "Serves css and js straight from disk — no route even wakes up.",
  },
  {
    icon: Braces,
    name: "express.json()",
    what: "Parses JSON bodies. The upload ticket endpoint needs this.",
  },
  {
    icon: ClipboardList,
    name: "express.urlencoded()",
    what: "Parses form bodies. No parser, no req.body.",
  },
  {
    icon: Cookie,
    name: "cookieParser()",
    what: "Turns the Cookie header into req.cookies.",
  },
  {
    icon: Globe,
    name: "sameOriginOnly",
    what: "A non-GET request with a foreign Origin? Blocked before anything acts on it.",
  },
  {
    icon: Route,
    name: "The routers",
    what: "health, auth, home, uploads, photos — where the actual work happens.",
  },
  {
    icon: SearchX,
    name: "404 catcher",
    what: "Nothing matched any route? A clean 404, rendered as the error page.",
  },
  {
    icon: Bug,
    name: "errorHandler",
    what: "Something threw? It lands here. Mounted dead last, always.",
  },
];

const sabotaged: Stage[] = [
  {
    icon: Route,
    name: "The routers",
    what: "First, because why not.",
    breaks: "Runs before the body parsers — req.body is empty, so every form looks haunted.",
  },
  {
    icon: Braces,
    name: "express.json()",
    what: "Still parsing…",
    breaks: "Too late. The route that needed the body already answered.",
  },
  {
    icon: ClipboardList,
    name: "express.urlencoded()",
    what: "Still parsing…",
    breaks: "Same story — posted forms arrive empty.",
  },
  {
    icon: Cookie,
    name: "cookieParser()",
    what: "Setting up cookies after the party.",
    breaks: "req.cookies was undefined when the routes read it. No cookie, no session — everyone's a stranger.",
  },
  {
    icon: Globe,
    name: "sameOriginOnly",
    what: "A polite suggestion at this point.",
    breaks: "The cross-site POST already reached a route before this check. That's the whole defense, skipped.",
  },
  {
    icon: ShieldCheck,
    name: "securityHeaders",
    what: "Setting headers on responses that should already be gone.",
    breaks: "Static files served above you never got a CSP.",
  },
  {
    icon: FolderOpen,
    name: 'express.static("public")',
    what: "Fine here, honestly.",
  },
  {
    icon: SearchX,
    name: "404 catcher",
    what: "Fine here too.",
  },
  {
    icon: Bug,
    name: "errorHandler",
    what: "Mounted too high up the stack.",
    breaks: "Errors thrown by anything after it never reach it — blank 500s with nothing rendered.",
  },
];

export default function MiddlewarePipeline() {
  const [mode, setMode] = useState<"planned" | "sabotaged">("planned");
  const stages = mode === "planned" ? asPlanned : sabotaged;

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="border-line flex rounded-full border bg-white p-1"
          role="tablist"
          aria-label="Choose the middleware order"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "planned"}
            onClick={() => setMode("planned")}
            className={`font-display min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
              mode === "planned"
                ? "bg-mint-deep text-white shadow-clay-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            As the plan says
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sabotaged"}
            onClick={() => setMode("sabotaged")}
            className={`font-display min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
              mode === "sabotaged"
                ? "bg-rose text-white shadow-clay-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Sabotaged
          </button>
        </div>
        <p className="text-ink-soft text-xs font-bold">
          A request enters at the top and walks down
        </p>
      </div>

      <ol className="space-y-1.5 p-4 sm:p-5">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          const broken = Boolean(stage.breaks);
          return (
            <li
              key={stage.name}
              className={`flex items-start gap-3 rounded-2xl border-2 p-3 transition-colors ${
                broken
                  ? "border-rose/50 bg-rose/10"
                  : "border-transparent bg-paper/60"
              }`}
            >
              <span
                className={`font-display grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold ${
                  broken
                    ? "bg-rose text-white"
                    : mode === "planned"
                      ? "bg-mint/25 text-mint-deep"
                      : "bg-line text-ink-soft"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <Icon
                    className={`size-4 shrink-0 ${
                      broken ? "text-rose" : "text-ink-soft"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-brand-deep text-sm font-bold">
                    {stage.name}
                  </span>
                </span>
                <span className="text-ink-soft mt-1 block text-sm leading-relaxed font-bold">
                  {stage.what}
                </span>
                {stage.breaks && (
                  <span className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed font-bold text-[#be123c]">
                    <Bug className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    {stage.breaks}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <p
        className={`border-line border-t px-4 py-3 text-sm font-bold sm:px-5 ${
          mode === "planned" ? "bg-mint/15" : "bg-rose/10"
        }`}
      >
        {mode === "planned"
          ? "Rule of thumb: protect and parse first, routes in the middle, the net at the bottom."
          : "Same middleware, wrong order — this is why the plan is picky about it."}
      </p>
    </div>
  );
}
