import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Database,
  FlaskConical,
  Hammer,
  ImageUp,
  KeyRound,
  LayoutGrid,
  Mail,
  Rocket,
  ShoppingBag,
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
    color: "#141210",
    get: "An empty Next.js app that boots",
    detail:
      "TypeScript strict, Tailwind 4, Zod-validated env, a health route that checks Neon, and a proxy that only does optimistic redirects.",
    lesson: "Lesson 04",
    href: "/projek/safelight/scaffold-and-health",
  },
  {
    n: 2,
    name: "Database & migrations",
    icon: Database,
    color: "#047857",
    get: "The order state machine, in Postgres",
    detail:
      "Photographs, orders, tokens, sessions, and the audit trail. Integer money, CHECK constraints, partial unique indexes, and migrations a human reads.",
    lesson: "Lesson 05",
    href: "/projek/safelight/the-order-is-the-source-of-truth",
  },
  {
    n: 3,
    name: "Admin auth",
    icon: KeyRound,
    color: "#c63b2f",
    get: "One admin, a real session",
    detail:
      "Argon2id, opaque session tokens hashed in the DB, a rate-limited login, and requireAdmin inside every action — not just the layout.",
    lesson: "Lesson 06",
  },
  {
    n: 4,
    name: "Public gallery",
    icon: LayoutGrid,
    color: "#d97706",
    get: "The shop window, with no original in sight",
    detail:
      "Server Components, published-only queries, the photograph detail page, responsive previews, metadata, and a 404 for drafts.",
    lesson: "Lesson 07",
  },
  {
    n: 5,
    name: "Upload & preview",
    icon: ImageUp,
    color: "#e11d48",
    get: "Direct-to-R2 uploads and a burned-in watermark",
    detail:
      "A five-minute presigned PUT, HeadObject verification, sharp resize and watermark, a thumb and blur placeholder, then publish or archive.",
    lesson: "Lesson 08",
  },
  {
    n: 6,
    name: "Orders & WhatsApp",
    icon: ShoppingBag,
    color: "#7c3aed",
    get: "A receipt, a WhatsApp handoff, and a claim",
    detail:
      "The server reads the price, snapshots it, reuses a duplicate pending order, and sends the customer to a receipt with a prefilled WhatsApp message.",
    lesson: "Lesson 09",
  },
  {
    n: 7,
    name: "Admin order desk",
    icon: ClipboardList,
    color: "#0e7490",
    get: "The ledger, and a payment that happens once",
    detail:
      "Filters, the order timeline, conditional mark-paid, cancel/refund, email correction, and a token that can be revoked.",
    lesson: "Lesson 10",
  },
  {
    n: 8,
    name: "Email & download",
    icon: Mail,
    color: "#c63b2f",
    get: "The last mile: a ticket, not a file",
    detail:
      "Resend with idempotency keys, a hashed download token, email statuses and retries, an app-controlled download page, and a signed R2 URL.",
    lesson: "Lesson 11",
  },
  {
    n: 9,
    name: "Tests & failure drills",
    icon: FlaskConical,
    color: "#6d28d9",
    get: "Break it before a customer does",
    detail:
      "Vitest against a separate Neon branch, fake storage and email, double-clicks, failed email, expired tokens, refunds, and price changes.",
    lesson: "Lesson 12",
  },
  {
    n: 10,
    name: "Deploy & harden",
    icon: Rocket,
    color: "#141210",
    get: "A real shop, with real secrets",
    detail:
      "Vercel Pro, Neon, R2 CORS, a verified Resend domain, migrations by hand, security headers, redacted logs, and the go-live checklist.",
    lesson: "Lesson 13",
  },
];

export default function SafelightRoadmap() {
  const [open, setOpen] = useState(1);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[26px] border border-[#d9d1c3] bg-[#f3efe6] text-[#141210] shadow-[0_24px_60px_-30px_rgba(20,18,16,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9d1c3] px-4 py-3.5 sm:px-5">
        <p
          className="text-sm font-semibold"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          The build order — 10 phases, no skipping
        </p>
        <p className="font-mono text-[9px] tracking-[0.08em] text-[#8b8173] uppercase">
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
                  className="absolute top-12 left-[23px] h-[calc(100%-2.5rem)] border-l-2 border-dashed border-[#d9d1c3]"
                />
              )}
              <button
                type="button"
                onClick={() => setOpen(isOpen ? 0 : phase.n)}
                aria-expanded={isOpen}
                className={`relative z-10 w-full rounded-xl border-2 p-3 text-left transition-all duration-150 ${
                  isOpen
                    ? "border-transparent bg-[#fbf9f3] shadow-[0_10px_22px_-16px_rgba(20,18,16,0.4)]"
                    : "border-transparent hover:bg-[#fbf9f3]/70"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-xl text-white transition-transform duration-150"
                    style={{
                      backgroundColor: isOpen ? phase.color : "#d9d1c3",
                      color: isOpen ? "#fff" : "#6e675c",
                    }}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span
                        className="text-base font-semibold"
                        style={{
                          fontFamily: 'Georgia, "Times New Roman", serif',
                        }}
                      >
                        <span className="font-mono text-[10px] tracking-[0.08em] text-[#8b8173] uppercase">
                          Phase {phase.n}
                        </span>{" "}
                        · {phase.name}
                      </span>
                    </span>
                    <span
                      className={`mt-0.5 block text-sm leading-relaxed font-bold text-[#6e675c] ${
                        isOpen ? "" : "opacity-80"
                      }`}
                    >
                      {phase.get}
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-[#8b8173] transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {isOpen && (
                <div
                  className="relative z-10 mr-1 ml-[62px] rounded-xl border-2 border-dashed bg-[#fbf9f3] px-4 py-3.5"
                  style={{ borderColor: `${phase.color}44` }}
                >
                  <p className="text-sm leading-relaxed font-bold text-[#6e675c]">
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
                        className="rounded-full border border-[#d9d1c3] bg-white px-3 py-1 font-mono text-[9px] tracking-[0.08em] text-[#6e675c] uppercase transition-colors hover:border-[#c63b2f]/40 hover:text-[#c63b2f]"
                      >
                        Read the lesson →
                      </a>
                    ) : (
                      <span className="rounded-full border border-[#d9d1c3] bg-white px-3 py-1 font-mono text-[9px] tracking-[0.08em] text-[#6e675c] uppercase">
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

      <p className="border-t border-[#d9d1c3] bg-[#fbf9f3] px-4 py-3 text-sm font-bold text-[#6e675c] sm:px-5">
        Every phase ends with a <span className="font-mono text-xs">Verify:</span>{" "}
        line. Pass it before you touch the next phase. That is the whole
        discipline.
      </p>
    </div>
  );
}
