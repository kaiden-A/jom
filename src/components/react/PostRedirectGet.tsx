import { useState } from "react";
import { ArrowRight, RefreshCcw, TriangleAlert } from "lucide-react";

type Lane = "good" | "bad";

const goodSteps = [
  {
    title: "POST /photos",
    body: "Title, notes, and the image key arrive as a normal form body.",
  },
  {
    title: "safeParse passes",
    body: "The service writes the row to Neon. One write, one row.",
  },
  {
    title: "303 redirect → /photos",
    body: "The browser follows with a fresh GET.",
  },
  {
    title: "A GET rendered this page",
    body: "Refresh it as much as you like — no resubmit prompt, no duplicate row.",
  },
];

const badSteps = [
  {
    title: "POST /photos",
    body: "But the title is empty.",
  },
  {
    title: "safeParse fails",
    body: "Nothing is written. Not a single row.",
  },
  {
    title: "422 — same page, re-rendered",
    body: "Your input is still in the fields; the mistake is pointed out. (Never the password — that rule is absolute.)",
  },
  {
    title: "No redirect",
    body: "Fix it in place and submit again.",
  },
];

export default function PostRedirectGet() {
  const [lane, setLane] = useState<Lane>("good");

  const lanes = {
    good: {
      label: "Submit a valid form",
      color: "#047857",
      chip: "303 Created → redirect",
      steps: goodSteps,
    },
    bad: {
      label: "Submit a broken form",
      color: "#ea580c",
      chip: "422 → re-render with input",
      steps: badSteps,
    },
  } as const;

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pick a form outcome">
          {(Object.keys(lanes) as Lane[]).map((id) => {
            const info = lanes[id];
            const isActive = lane === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setLane(id)}
                className={`font-display inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? ""
                    : "border-line text-ink-soft hover:border-brand/40 hover:text-ink bg-white"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: info.color,
                        borderColor: info.color,
                        color: "#fff",
                      }
                    : {}
                }
              >
                {info.label}
              </button>
            );
          })}
        </div>
        <p className="text-ink-soft text-xs font-bold">
          Post → Redirect → Get. Every form, every time.
        </p>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
        {(Object.keys(lanes) as Lane[]).map((id) => {
          const info = lanes[id];
          const isActive = lane === id;
          return (
            <div
              key={id}
              className={`rounded-2xl border-2 p-4 transition-all duration-200 sm:p-5 ${
                isActive
                  ? "shadow-clay-xs bg-white"
                  : "border-line bg-paper/50 opacity-60"
              }`}
              style={isActive ? { borderColor: info.color } : {}}
            >
              <span
                className="font-mono inline-block rounded-full px-3 py-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: info.color }}
              >
                {info.chip}
              </span>
              <ol className="mt-4">
                {info.steps.map((step, i) => {
                  const isLast = i === info.steps.length - 1;
                  return (
                    <li key={step.title} className="relative flex gap-3.5 pb-4 last:pb-0">
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="border-line absolute top-9 left-[17px] h-[calc(100%-2rem)] border-l-2 border-dashed"
                        />
                      )}
                      <span
                        className="font-display grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: info.color }}
                      >
                        {i + 1}
                      </span>
                      <div className="pt-0.5">
                        <p className="font-display text-sm font-semibold">
                          {step.title}
                        </p>
                        <p className="text-ink-soft mt-0.5 text-sm leading-relaxed font-bold">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>

      <div className="border-line border-t-2 border-dashed px-4 py-4 sm:px-5">
        <div className="border-rose/40 bg-rose/10 flex items-start gap-3.5 rounded-2xl border-2 p-4">
          <span className="bg-rose grid size-9 shrink-0 place-items-center rounded-xl text-white">
            <TriangleAlert className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display flex flex-wrap items-center gap-2 text-sm font-semibold">
              The trap: rendering the page straight from a successful POST
            </p>
            <p className="text-ink-soft mt-1 text-sm leading-relaxed font-bold">
              POST → render the page directly → the user refreshes → the browser
              says "resubmit form?" → one extra click and you've written the row
              twice. The 303 redirect erases the POST from the browser's memory.
            </p>
            <p className="text-ink-soft/80 mt-2 flex items-center gap-1.5 text-xs font-bold">
              <RefreshCcw className="size-3.5" aria-hidden="true" />
              Refresh should always be harmless. That's the whole point.
            </p>
          </div>
        </div>
      </div>

      <p className="border-line bg-brand-soft/50 flex flex-wrap items-center gap-2 border-t px-4 py-3 text-sm font-bold sm:px-5">
        The rule: GET renders.
        <ArrowRight className="size-3.5 text-ink-soft" aria-hidden="true" />
        POST decides, then redirects.
      </p>
    </div>
  );
}
