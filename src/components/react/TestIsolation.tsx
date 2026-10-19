import { useState } from "react";
import {
  CheckCheck,
  Database,
  Eraser,
  FlaskConical,
  RefreshCw,
  Send,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

type Tab = "setup" | "life" | "flakes";

interface TabInfo {
  id: Tab;
  label: string;
  icon: LucideIcon;
  color: string;
}

const tabs: TabInfo[] = [
  { id: "setup", label: "The setup", icon: ShieldAlert, color: "#4f46e5" },
  { id: "life", label: "One test's life", icon: FlaskConical, color: "#047857" },
  { id: "flakes", label: "Neon flakes", icon: RefreshCw, color: "#ea580c" },
];

const lifeSteps = [
  {
    title: "buildTestApp()",
    body: "testSettings() builds Settings from fixed fake env vars; FakeStorage replaces R2 — in memory, and it records every call.",
  },
  {
    title: "loggedInAgent(app)",
    body: "Logs in once with the real login form. The supertest agent keeps the cookie, so later calls are just… signed in.",
  },
  {
    title: "Hit the route, assert everything",
    body: "Status 422? The error text in the HTML? FakeStorage.removed contains the key? Tests assert on behavior, not on real cloud objects.",
  },
  {
    title: "Next test, blank slate",
    body: "afterEach truncates every table. No test can leave a mark on the next one.",
  },
];

export default function TestIsolation() {
  const [tab, setTab] = useState<Tab>("setup");
  const [showFlake, setShowFlake] = useState(false);

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Choose a view of the test setup"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.id)}
                className={`font-display inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-3.5 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? ""
                    : "border-line text-ink-soft hover:border-brand/40 hover:text-ink bg-white"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: t.color,
                        borderColor: t.color,
                        color: "#fff",
                      }
                    : {}
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="text-ink-soft hidden text-xs font-bold sm:block">
          Tests never touch your real data — or real R2
        </p>
      </div>

      {tab === "setup" && (
        <div className="pop-in space-y-4 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="border-line rounded-2xl border-2 bg-white p-4">
              <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
                The app runs against
              </p>
              <code className="font-mono text-brand-deep mt-1.5 block text-sm font-bold">
                DATABASE_URL
              </code>
              <p className="text-ink-soft mt-1 text-sm font-bold">
                your real Neon branch — the one with real rows
              </p>
            </div>
            <div className="grid place-items-center">
              <span className="border-line text-ink-soft grid size-12 place-items-center rounded-2xl border-2 border-dashed bg-white">
                <ShieldAlert className="size-5" aria-hidden="true" />
              </span>
            </div>
            <div className="border-mint-deep/40 bg-mint/10 rounded-2xl border-2 p-4">
              <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
                The tests run against
              </p>
              <code className="font-mono text-mint-deep mt-1.5 block text-sm font-bold">
                TEST_DATABASE_URL
              </code>
              <p className="text-ink-soft mt-1 text-sm font-bold">
                a separate Neon branch — disposable by design
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-line rounded-2xl border-2 bg-white p-4">
              <span className="bg-rose/15 grid size-10 place-items-center rounded-xl">
                <ShieldAlert className="size-5 text-rose" aria-hidden="true" />
              </span>
              <p className="font-display mt-3 text-sm font-semibold">
                The guard, before anything
              </p>
              <p className="text-ink-soft mt-1 text-sm leading-relaxed font-bold">
                TEST_DATABASE_URL empty — or equal to DATABASE_URL? The suite
                throws on the spot. Your real data is never in the room.
              </p>
            </div>
            <div className="border-line rounded-2xl border-2 bg-white p-4">
              <span className="bg-brand-soft grid size-10 place-items-center rounded-xl">
                <Database className="size-5 text-brand" aria-hidden="true" />
              </span>
              <p className="font-display mt-3 text-sm font-semibold">
                Migrations first
              </p>
              <p className="text-ink-soft mt-1 text-sm leading-relaxed font-bold">
                beforeAll runs the same migrations against the test branch. The
                test schema is never behind the code.
              </p>
            </div>
            <div className="border-line rounded-2xl border-2 bg-white p-4">
              <span className="bg-sun/40 grid size-10 place-items-center rounded-xl">
                <Eraser className="size-5 text-ink" aria-hidden="true" />
              </span>
              <p className="font-display mt-3 text-sm font-semibold">
                Zero between tests
              </p>
              <p className="text-ink-soft mt-1 text-sm leading-relaxed font-bold">
                afterEach: TRUNCATE … RESTART IDENTITY CASCADE. Every test starts
                from an empty database — and tests can't be order-dependent.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "life" && (
        <ol className="pop-in p-4 sm:p-6">
          {lifeSteps.map((step, i) => {
            const isLast = i === lifeSteps.length - 1;
            return (
              <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="border-line absolute top-10 left-[19px] h-[calc(100%-2.25rem)] border-l-2 border-dashed"
                  />
                )}
                <span className="font-display bg-mint-deep grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <p className="font-display font-mono text-base font-semibold">
                    {step.title}
                  </p>
                  <p className="text-ink-soft mt-1 text-sm leading-relaxed font-bold">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
          <li className="border-line mt-2 rounded-2xl border-2 border-dashed bg-paper/70 p-4">
            <p className="text-sm leading-relaxed font-bold">
              <span className="text-ink">A representative test:</span>{" "}
              <span className="text-ink-soft">
                a wrong password gets 401 and sets no cookie.{" "}
              </span>
              <code className="font-mono text-brand-deep text-xs font-bold">
                next=//evil.com
              </code>{" "}
              <span className="text-ink-soft">
                lands on / instead. An anonymous GET to /photos redirects to
                /login?next=… Three lines of setup, three real guarantees.
              </span>
            </p>
          </li>
        </ol>
      )}

      {tab === "flakes" && (
        <div className="pop-in space-y-4 p-4 sm:p-6">
          <div className="border-line rounded-2xl border-2 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-line grid size-10 place-items-center rounded-xl">
                <Send className="size-5 text-ink-soft" aria-hidden="true" />
              </span>
              <code className="font-mono text-sm font-bold text-[#be123c]">
                Error: read ECONNRESET
              </code>
              <span className="text-ink-soft text-xs font-bold">
                (or a surprise timeout against Neon)
              </span>
            </div>
            <p className="text-ink-soft mt-3 text-sm leading-relaxed font-bold">
              That's a network hiccup between your test runner and Neon — a
              pooled connection that got recycled, a cold branch. It is not your
              code. Rerun the test.
            </p>
            <button
              type="button"
              onClick={() => setShowFlake((v) => !v)}
              className="border-line hover:border-brand/40 text-ink mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border-2 bg-white px-4 text-sm font-bold transition-colors"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {showFlake ? "Hide the rule" : "Rerun it — and what NOT to do"}
            </button>
            {showFlake && (
              <div className="pop-in border-mint-deep/40 bg-mint/15 mt-3 rounded-2xl border-2 p-4">
                <p className="text-mint-deep font-display flex items-center gap-2 text-sm font-semibold">
                  <CheckCheck className="size-4" aria-hidden="true" />
                  Rerun. Do not "fix" code for it.
                </p>
                <p className="text-ink-soft mt-1 text-sm leading-relaxed font-bold">
                  The plan says it plainly: a flaky connection is a flaky
                  connection. If you start adding retry logic or timeouts to your
                  routes to chase it, you're breaking working code to hide a
                  cloud's weather.
                </p>
              </div>
            )}
          </div>

          <p className="border-line bg-brand-soft/50 rounded-2xl border-2 px-4 py-3 text-sm font-bold">
            CI gates the exact same commands you run:{" "}
            <code className="font-mono text-brand-deep text-xs">npm test</code>{" "}
            and{" "}
            <code className="font-mono text-brand-deep text-xs">
              npm run typecheck
            </code>
            . Green locally → eligible to ship.
          </p>
        </div>
      )}
    </div>
  );
}
