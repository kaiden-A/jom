import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Database,
  FlaskConical,
  Hammer,
  ImageUp,
  KeyRound,
  Mail,
  Rocket,
  Store,
  Timer,
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
  href?: string;
}

const phases: Phase[] = [
  {
    n: 1,
    name: "Scaffold & health",
    icon: Hammer,
    color: "#2B1D14",
    get: "An empty Next.js app that boots",
    detail:
      "TypeScript strict, Tailwind 4, Zod-validated env, a health route that checks Neon, and a proxy that only does optimistic redirects.",
    lesson: "Lesson 04",
    href: "/projek/kedai/scaffold-and-health",
  },
  {
    n: 2,
    name: "Database & migrations",
    icon: Database,
    color: "#2F6B4F",
    get: "One item, one pending reservation",
    detail:
      "Items, photos, reservations, events, sessions, and the audit trail. Integer money, CHECK constraints, a partial unique index, and migrations a human reads.",
    lesson: "Lesson 05",
    href: "/projek/kedai/the-item-is-the-unit-of-stock",
  },
  {
    n: 3,
    name: "Admin auth",
    icon: KeyRound,
    color: "#D94A2B",
    get: "One admin, a real session",
    detail:
      "Argon2id, opaque session tokens hashed in the DB, a rate-limited login, and requireAdmin inside every action — not just the layout.",
    lesson: "Lesson 06",
  },
  {
    n: 4,
    name: "Public shelf",
    icon: Store,
    color: "#B7791F",
    get: "The shop window, with no back room in sight",
    detail:
      "Server Components, published-only queries, the item detail page, share metadata, responsive photos, and a 404 for drafts and archived items.",
    lesson: "Lesson 07",
  },
  {
    n: 5,
    name: "Photos & uploads",
    icon: ImageUp,
    color: "#8A5A2B",
    get: "Direct-to-R2 uploads and honest photos",
    detail:
      "A five-minute presigned PUT, HeadObject verification, sharp display and card variants, EXIF/GPS stripping, a blur placeholder, and cover ordering.",
    lesson: "Lesson 08",
  },
  {
    n: 6,
    name: "Reservations & WhatsApp",
    icon: Timer,
    color: "#7A4B8C",
    get: "A hold, a race, and a handoff",
    detail:
      "The server reads the price, snapshots it, creates one pending reservation, releases it on expiry, and opens a receipt with a prefilled WhatsApp message.",
    lesson: "Lesson 09",
  },
  {
    n: 7,
    name: "Admin back room",
    icon: ClipboardList,
    color: "#2F6B4F",
    get: "The ledger, and a sale that happens once",
    detail:
      "The item list, the reservation desk, conditional confirm, cancel, extend, email correction, archive, and an audit timeline.",
    lesson: "Lesson 10",
  },
  {
    n: 8,
    name: "Email & receipts",
    icon: Mail,
    color: "#D94A2B",
    get: "The last mile: a receipt, not a promise",
    detail:
      "Resend with idempotency keys, a buyer receipt and a seller alert, email statuses and retries, and a link back to the live reservation page.",
    lesson: "Lesson 11",
  },
  {
    n: 9,
    name: "Tests & failure drills",
    icon: FlaskConical,
    color: "#6D4A9C",
    get: "Break the race before a buyer does",
    detail:
      "Vitest against a separate Neon branch, fake storage and email, two buyers, expiry during confirm, price changes, and a failed receipt.",
    lesson: "Lesson 12",
  },
  {
    n: 10,
    name: "Deploy & harden",
    icon: Rocket,
    color: "#2B1D14",
    get: "A real shop, with real secrets",
    detail:
      "Vercel, Neon, R2 CORS, a verified Resend domain, migrations by hand, rate limits, security headers, redacted logs, and the go-live checklist.",
    lesson: "Lesson 13",
  },
];

export default function KedaiRoadmap() {
  const [open, setOpen] = useState(1);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[26px] border border-[#d8cbb4] bg-[#f6f0e2] text-[#2b1d14] shadow-[0_24px_60px_-30px_rgba(43,29,20,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8cbb4] px-4 py-3.5 sm:px-5">
        <p
          className="text-sm font-semibold"
          style={{ fontFamily: 'Fraunces, Georgia, "Times New Roman", serif' }}
        >
          The build order — 10 phases, no skipping
        </p>
        <p className="font-mono text-[9px] tracking-[0.08em] text-[#6f5e4b] uppercase">
          Tap a phase to see the verify
        </p>
      </div>

      <ol className="list-none p-4 sm:p-6">
        {phases.map((phase, i) => {
          const Icon = phase.icon;
          const isOpen = open === phase.n;
          const isLast = i === phases.length - 1;
          return (
            <li key={phase.n} className="relative">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute top-12 left-[23px] h-[calc(100%-2.5rem)] border-l-2 border-dashed border-[#d8cbb4]"
                />
              )}
              <button
                type="button"
                onClick={() => setOpen(isOpen ? 0 : phase.n)}
                aria-expanded={isOpen}
                className={`relative z-10 w-full rounded-xl border-2 p-3 text-left transition-all duration-150 ${
                  isOpen
                    ? "border-transparent bg-[#fbf7ec] shadow-[0_10px_22px_-16px_rgba(43,29,20,0.4)]"
                    : "border-transparent hover:bg-[#fbf7ec]/70"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-xl text-white transition-transform duration-150"
                    style={{
                      backgroundColor: isOpen ? phase.color : "#c9bca8",
                      color: isOpen ? "#fff" : "#6e5e4c",
                    }}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span
                        className="text-base font-semibold"
                        style={{
                          fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
                        }}
                      >
                        <span className="font-mono text-[10px] tracking-[0.08em] text-[#6f5e4b] uppercase">
                          Phase {phase.n}
                        </span>{" "}
                        · {phase.name}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed font-bold text-[#6e5e4c]">
                      {phase.get}
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-[#6f5e4b] transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {isOpen && (
                <div
                  className="relative z-10 mr-1 ml-[62px] rounded-xl border-2 border-dashed bg-[#fbf7ec] px-4 py-3.5"
                  style={{ borderColor: `${phase.color}44` }}
                >
                  <p className="text-sm leading-relaxed font-bold text-[#6e5e4c]">
                    {phase.detail}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 font-mono text-[9px] font-bold tracking-[0.08em] text-white uppercase"
                      style={{ backgroundColor: phase.color }}
                    >
                      {phase.lesson}
                    </span>
                    {phase.href ? (
                      <a
                        href={phase.href}
                        className="rounded-full border border-[#d8cbb4] bg-white px-3 py-1 font-mono text-[9px] tracking-[0.08em] text-[#6e5e4c] uppercase transition-colors hover:border-[#d94a2b]/40 hover:text-[#d94a2b]"
                      >
                        Read the lesson →
                      </a>
                    ) : (
                      <span className="rounded-full border border-[#d8cbb4] bg-white px-3 py-1 font-mono text-[9px] tracking-[0.08em] text-[#6e5e4c] uppercase">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
