import { useState } from "react";
import {
  Eye,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  MessageCircle,
  MousePointerClick,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const visitorSteps: Step[] = [
  {
    icon: Globe,
    title: "Open the website",
    body: "The photo grid is right there. No login, nothing — it's a public page.",
  },
  {
    icon: LayoutGrid,
    title: "Pick a folder",
    body: "Click a category like \u201cNature\u201d or \u201cCats\u201d. The grid filters to that folder.",
  },
  {
    icon: MousePointerClick,
    title: "Click a photo",
    body: "The big version pops up (people call it a lightbox). Title and folder show too.",
  },
  {
    icon: MessageCircle,
    title: "Like & comment",
    body: "Visitors can hit like or leave a comment. This is what makes a blog feel alive.",
  },
];

const adminSteps: Step[] = [
  {
    icon: LogIn,
    title: "Log in",
    body: "Enter the admin route. This area is just for you — visitors never see it.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    body: "See quick stats: how many photos, comments and likes so far.",
  },
  {
    icon: UploadCloud,
    title: "Upload a photo",
    body: "Pick a file, add a title, choose a folder, hit upload. Done.",
  },
  {
    icon: Eye,
    title: "Live right away",
    body: "The photo shows up on the public page instantly. Magic? No — that's the API doing its job.",
  },
];

type Mode = "visitor" | "admin";

export default function FlowSteps() {
  const [mode, setMode] = useState<Mode>("visitor");
  const [active, setActive] = useState<number>(0);
  const steps = mode === "visitor" ? visitorSteps : adminSteps;

  function switchMode(next: Mode) {
    setMode(next);
    setActive(0);
  }

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="border-line flex rounded-full border bg-white p-1"
          role="tablist"
          aria-label="Choose flow"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "visitor"}
            onClick={() => switchMode("visitor")}
            className={`font-display min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
              mode === "visitor"
                ? "bg-brand text-white shadow-clay-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            As a visitor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "admin"}
            onClick={() => switchMode("admin")}
            className={`font-display min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
              mode === "admin"
                ? "bg-ink text-white shadow-clay-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            As an admin
          </button>
        </div>
        <p className="text-ink-soft text-xs font-bold">
          Click each step to focus
        </p>
      </div>

      <ol className="p-4 sm:p-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = active === i;
          const isLast = i === steps.length - 1;
          return (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="border-line absolute top-11 left-[21px] h-[calc(100%-2.5rem)] border-l-2 border-dashed"
                />
              )}
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`z-10 grid size-11 shrink-0 place-items-center rounded-2xl border-2 font-display text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "border-brand bg-brand scale-105 text-white shadow-clay-xs"
                    : "border-line hover:border-brand/40 bg-white text-ink-soft"
                }`}
              >
                {i + 1}
              </button>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`flex-1 rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
                  isActive
                    ? "border-brand bg-brand-soft/70"
                    : "border-transparent bg-paper/60 hover:border-line"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`grid size-8 place-items-center rounded-xl transition-colors ${
                      isActive ? "bg-brand text-white" : "bg-white text-ink-soft"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-display text-base font-semibold">
                    {step.title}
                  </span>
                </span>
                <span
                  className={`text-ink-soft mt-2 block text-sm leading-relaxed ${
                    isActive ? "" : "opacity-80"
                  }`}
                >
                  {step.body}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="border-line bg-brand-soft/50 border-t px-5 py-3 text-sm font-bold">
        {mode === "visitor"
          ? "Summary: open → browse → click → like/comment. All without logging in."
          : "Summary: log in → upload → publish. All under your control."}
      </p>
    </div>
  );
}
