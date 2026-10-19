import { useState } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

interface Trap {
  area: string;
  color: string;
  symptom: string;
  cause: string;
  fix: string;
}

const traps: Trap[] = [
  {
    area: "Auth",
    color: "#4f46e5",
    symptom: "Login works locally, but bounces you back in production",
    cause: "COOKIE_SECURE=true over plain HTTP — or an edge stripping the cookie.",
    fix: "Serve HTTPS. Behind Firebase Hosting, set SESSION_COOKIE_NAME=__session.",
  },
  {
    area: "Auth",
    color: "#4f46e5",
    symptom: "Login returns 429 for everyone behind a proxy",
    cause: "trust proxy unset — every request looks like it came from the proxy's IP.",
    fix: "TRUST_PROXY=1, matching the real hop count.",
  },
  {
    area: "Pages",
    color: "#ea580c",
    symptom: "Form POST returns 403 “Cross-site request blocked.”",
    cause: "PUBLIC_BASE_URL doesn't match the browser's origin — port, scheme, or host.",
    fix: "Set it to exactly what the browser shows.",
  },
  {
    area: "Pages",
    color: "#ea580c",
    symptom: "An inline script silently does nothing",
    cause: "The CSP blocks inline code. No error, just… nothing.",
    fix: "Move it to public/js — the CSP won't stop a real file.",
  },
  {
    area: "Pages",
    color: "#ea580c",
    symptom: "Someone's HTML shows up unescaped on the page",
    cause: "<%- %> used for data instead of <%= %>.",
    fix: "<%= %> for data; <%- %> only for include().",
  },
  {
    area: "Images",
    color: "#e11d48",
    symptom: "R2 PUT returns 403 SignatureDoesNotMatch",
    cause: "The Content-Type at upload differs from the one that was signed.",
    fix: "Send exactly file.type — the same string you gave /uploads/sign.",
  },
  {
    area: "Images",
    color: "#e11d48",
    symptom: "Images 403 after the page sat open for an hour",
    cause: "The signed GET URL expired.",
    fix: "Reload the page, or use R2_PUBLIC_BASE_URL for public images.",
  },
  {
    area: "Images",
    color: "#e11d48",
    symptom: "Orphaned objects pile up in the bucket",
    cause: "An upload was minted but never attached, or an R2 delete failed.",
    fix: "sweep-orphans on a schedule — dry-run first, --apply when you trust it.",
  },
  {
    area: "Database",
    color: "#047857",
    symptom: "“Relation does not exist” after a deploy",
    cause: "The migration was never applied — deploys never migrate.",
    fix: "Run db:migrate explicitly; every table lives on appSchema.",
  },
  {
    area: "Deploy",
    color: "#221c46",
    symptom: "Pages 500 with “Failed to lookup view” in Docker",
    cause: "views/ or public/ wasn't copied into the image.",
    fix: "Copy them to /app — the app resolves them from the working directory.",
  },
];

export default function TrapCards() {
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());
  const count = flipped.size;

  function toggle(i: number) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div>
          <p className="font-display text-sm font-semibold">
            The footgun gallery
          </p>
          <p className="text-ink-soft mt-0.5 text-xs font-bold">
            Every one of these is a real paragraph in the plan. Tap a card to see
            what's under it.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-ink-soft text-sm font-bold">
            {count}/{traps.length} revealed
          </span>
          {count > 0 && (
            <button
              type="button"
              onClick={() => setFlipped(new Set())}
              className="text-ink-soft hover:text-ink inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-xs font-bold transition-colors"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {traps.map((trap, i) => {
          const isFlipped = flipped.has(i);
          return (
            <button
              key={trap.symptom}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isFlipped}
              className={`flex min-h-[9.5rem] flex-col rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
                isFlipped
                  ? "border-transparent bg-paper shadow-clay-xs"
                  : "border-line hover:border-rose/40 bg-white"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"
                  style={{ backgroundColor: trap.color }}
                >
                  {trap.area}
                </span>
                {!isFlipped && (
                  <TriangleAlert className="text-ink-soft/50 size-4" aria-hidden="true" />
                )}
              </span>

              {!isFlipped ? (
                <>
                  <span className="font-display mt-2.5 text-sm leading-snug font-semibold">
                    “{trap.symptom}”
                  </span>
                  <span className="text-ink-soft/70 mt-auto pt-2 text-xs font-bold">
                    Tap to see the cause and the fix
                  </span>
                </>
              ) : (
                <span className="pop-in mt-2.5 block space-y-2">
                  <span className="block">
                    <span className="text-ink-soft/80 block text-[10px] font-bold tracking-widest uppercase">
                      Why it happens
                    </span>
                    <span className="text-ink-soft mt-0.5 block text-sm leading-relaxed font-bold">
                      {trap.cause}
                    </span>
                  </span>
                  <span className="border-mint-deep/30 bg-mint/15 block rounded-xl border-2 px-3 py-2">
                    <span className="text-mint-deep block text-[10px] font-bold tracking-widest uppercase">
                      The fix
                    </span>
                    <span className="text-ink-soft mt-0.5 block text-sm leading-relaxed font-bold">
                      {trap.fix}
                    </span>
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="border-line bg-brand-soft/50 border-t px-4 py-3 text-sm font-bold sm:px-5">
        The plan keeps this list so you never have to earn these scars yourself.
      </p>
    </div>
  );
}
