import { useState } from "react";
import {
  Cookie,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

type Tab = "anatomy" | "login" | "tamper" | "rolling";
type Tamper = "none" | "signature" | "subject" | "expired";

interface TabInfo {
  id: Tab;
  label: string;
  icon: LucideIcon;
  color: string;
}

const tabs: TabInfo[] = [
  { id: "anatomy", label: "Cookie anatomy", icon: Cookie, color: "#4f46e5" },
  { id: "login", label: "Login flow", icon: KeyRound, color: "#ea580c" },
  { id: "tamper", label: "Tamper with it", icon: ShieldAlert, color: "#e11d48" },
  { id: "rolling", label: "Rolling session", icon: RefreshCw, color: "#047857" },
];

const payloadB64 =
  "eyJzdWIiOiJ5b3VAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjA4ODAwMDAsImV4cCI6MTc2MzQ3MjAwMH0";
const signatureB64 = "hK9vX2mT7Qa8Lc3Zf1RwB6yU0sPnE5dJ4gHoNcMxKlQ";

const loginSteps = [
  {
    title: "The form posts",
    body: "email + password + next go to POST /login as a normal HTML form.",
  },
  {
    title: "Both checks always run",
    body: "safeEqual(email) AND safeEqual(password) — hashed, compared in constant time. No short-circuit, because timing shouldn't rat you out.",
  },
  {
    title: "Wrong? 401, one generic line",
    body: '"Wrong email or password." The email is kept in the form; the password never is. The message never says which one failed.',
  },
  {
    title: "Right? Sign a cookie",
    body: "signPayload({sub, iat, exp}) with APP_SECRET → Set-Cookie: HttpOnly, SameSite=Lax. Then 303 to localPath(next).",
  },
];

const tamperButtons: { id: Tamper; label: string }[] = [
  { id: "signature", label: "Flip one character of the signature" },
  { id: "subject", label: "Edit the email inside the payload" },
  { id: "expired", label: "Fast-forward 31 days" },
];

const dayPresets = [1, 10, 20, 29];
const TTL_DAYS = 30;

export default function AuthCookieLab() {
  const [tab, setTab] = useState<Tab>("anatomy");
  const [tamper, setTamper] = useState<Tamper>("none");
  const [day, setDay] = useState(1);

  const checks = [
    {
      label: "Signature verifies?",
      ok: tamper !== "signature" && tamper !== "subject",
    },
    { label: "exp is in the future?", ok: tamper !== "expired" },
    { label: "sub === ADMIN_EMAIL?", ok: tamper !== "subject" },
  ];
  const valid = checks.every((c) => c.ok);

  const remaining = TTL_DAYS - day;
  const reissued = remaining < TTL_DAYS / 2;

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Choose a view of the session cookie"
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
          The whole auth model, in one cookie
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {tab === "anatomy" && (
          <div className="pop-in space-y-5">
            <div>
              <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
                The cookie value
              </p>
              <div className="border-line mt-2 rounded-2xl border-2 bg-white p-3 sm:p-4">
                <p className="font-mono text-[12px] leading-relaxed break-all">
                  <span className="text-brand-deep">{payloadB64}</span>
                  <span className="text-ink-soft">.</span>
                  <span className="text-accent-deep">{signatureB64}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="border-brand/40 text-brand-deep rounded-full border bg-brand-soft px-2.5 py-1">
                    payload — base64url JSON
                  </span>
                  <span className="border-accent/40 text-accent-deep bg-accent/10 rounded-full border px-2.5 py-1">
                    signature — HMAC-SHA256
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
                  Decoded payload
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-[#1e1938] px-4 py-3 font-mono text-xs leading-relaxed text-[#e9e6f7]">
                  <code>{`{
  "sub": "you@example.com",
  "iat": 1760880000,
  "exp": 1763472000
}`}</code>
                </pre>
              </div>
              <div className="space-y-2">
                {[
                  ["sub", "who this cookie claims to be — checked against ADMIN_EMAIL on every request"],
                  ["iat", "issued at — the moment the session started"],
                  ["exp", "expires at — a Unix timestamp, checked before anything else gets trusted"],
                ].map(([claim, meaning]) => (
                  <div
                    key={claim}
                    className="border-line flex items-start gap-3 rounded-xl border-2 bg-white px-3.5 py-2.5"
                  >
                    <code className="font-mono text-brand-deep shrink-0 text-sm font-bold">
                      {claim}
                    </code>
                    <span className="text-ink-soft text-sm leading-relaxed font-bold">
                      {meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-line flex flex-wrap items-center gap-2 border-t-2 border-dashed pt-4">
              <span className="text-ink-soft text-xs font-bold">
                And the attributes the browser enforces:
              </span>
              {["HttpOnly", "SameSite=Lax", "Path=/", "Secure (in production)"].map(
                (attr) => (
                  <span
                    key={attr}
                    className="border-line text-ink rounded-full border-2 bg-white px-3 py-1 font-mono text-[11px] font-bold"
                  >
                    {attr}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        {tab === "login" && (
          <ol className="pop-in">
            {loginSteps.map((step, i) => {
              const isLast = i === loginSteps.length - 1;
              return (
                <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="border-line absolute top-10 left-[19px] h-[calc(100%-2.25rem)] border-l-2 border-dashed"
                    />
                  )}
                  <span
                    className="font-display grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "#ea580c" }}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="font-display text-base font-semibold">
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
                <span className="text-ink">Every request after this:</span>{" "}
                <span className="text-ink-soft">
                  requireAuth unsigns the cookie, checks the signature, the exp, and
                  that sub still equals ADMIN_EMAIL. Valid → in. Missing or wrong →
                  GET pages get redirected to /login?next=…; JSON endpoints get a
                  clean 401.
                </span>
              </p>
            </li>
          </ol>
        )}

        {tab === "tamper" && (
          <div className="pop-in space-y-5">
            <p className="text-sm leading-relaxed font-bold">
              <span className="text-ink">Change something in the cookie</span>{" "}
              <span className="text-ink-soft">
                — exactly like an attacker with dev tools would — and watch the three
                checks requireAuth runs.
              </span>
            </p>

            <div className="flex flex-wrap gap-2">
              {tamperButtons.map((b) => {
                const isActive = tamper === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTamper(isActive ? "none" : b.id)}
                    className={`min-h-10 rounded-full border-2 px-3.5 text-sm font-bold transition-colors ${
                      isActive
                        ? "border-rose bg-rose text-white"
                        : "border-line text-ink-soft hover:border-rose/50 hover:text-ink bg-white"
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
              {tamper !== "none" && (
                <button
                  type="button"
                  onClick={() => setTamper("none")}
                  className="text-brand-deep bg-brand-soft hover:bg-brand-soft/70 min-h-10 rounded-full px-3.5 text-sm font-bold transition-colors"
                >
                  Reset the cookie
                </button>
              )}
            </div>

            <ul className="space-y-2">
              {checks.map((check) => (
                <li
                  key={check.label}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-bold transition-colors ${
                    check.ok
                      ? "border-mint-deep/40 bg-mint/15"
                      : "border-rose/50 bg-rose/10"
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-white ${
                      check.ok ? "bg-mint-deep" : "bg-rose"
                    }`}
                  >
                    {check.ok ? (
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-sm sm:text-[15px] ${
                      check.ok ? "text-mint-deep" : "text-[#be123c]"
                    }`}
                  >
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className={`rounded-2xl border-2 p-4 ${
                valid
                  ? "border-mint-deep/40 bg-mint/15"
                  : "border-rose/50 bg-rose/10"
              }`}
            >
              <p className="font-display text-sm font-semibold">
                {valid ? "Welcome in." : "Rejected — back to /login."}
              </p>
              <p className="text-ink-soft mt-1 text-sm leading-relaxed font-bold">
                {tamper === "signature" &&
                  "One flipped character and the HMAC comparison fails. The cookie's mere presence means nothing — only a valid signature counts."}
                {tamper === "subject" &&
                  "Editing the payload changes the math — the signature covers it, so the signature check fails first, and even if it verified, sub wouldn't match ADMIN_EMAIL. Re-signing would require APP_SECRET, which lives only on the server."}
                {tamper === "expired" &&
                  "Signature is fine, structure is fine — but exp is in the past, so it's ignored. No grace period, no 'remember me' extension."}
                {tamper === "none" &&
                  reissued
                  ? "All three checks pass. You're signed in — and with under half the TTL left, the cookie just got re-issued. The session keeps rolling."
                  : "All three checks pass. You're signed in."}
              </p>
            </div>
          </div>
        )}

        {tab === "rolling" && (
          <div className="pop-in space-y-5">
            <p className="text-sm leading-relaxed font-bold">
              <span className="text-ink">Sessions roll.</span>{" "}
              <span className="text-ink-soft">
                Skip ahead in time and watch what requireAuth does when the cookie
                gets old.
              </span>
            </p>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink-soft text-xs font-bold">
                  Day {day} after signing in · TTL is {TTL_DAYS} days
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    reissued
                      ? "bg-brand text-white"
                      : "border-line text-ink-soft border bg-white"
                  }`}
                >
                  {reissued ? "cookie re-issued on this request" : "cookie rides along"}
                </span>
              </div>
              <div
                className="bg-line/60 relative h-4 overflow-hidden rounded-full"
                role="img"
                aria-label={`${remaining} of ${TTL_DAYS} days remaining`}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                    reissued ? "bg-brand" : "bg-mint"
                  }`}
                  style={{ width: `${(remaining / TTL_DAYS) * 100}%` }}
                />
                <span
                  aria-hidden="true"
                  className="bg-ink/30 absolute top-0 h-full w-0.5"
                  style={{ left: "50%" }}
                />
              </div>
              <p className="text-ink-soft/70 text-[11px] font-bold">
                The mark at 50% is the rule: less than half the TTL left → refresh.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {dayPresets.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={day === d}
                  onClick={() => setDay(d)}
                  className={`min-h-10 rounded-full border-2 px-4 text-sm font-bold transition-colors ${
                    day === d
                      ? "border-mint-deep bg-mint-deep text-white"
                      : "border-line text-ink-soft hover:border-brand/40 hover:text-ink bg-white"
                  }`}
                >
                  Skip to day {d}
                </button>
              ))}
            </div>

            <div className="border-line rounded-2xl border-2 border-dashed bg-paper/70 p-4">
              <p className="text-sm leading-relaxed font-bold">
                <span className="text-ink">Why roll?</span>{" "}
                <span className="text-ink-soft">
                  An active user never gets logged out mid-project; an idle cookie
                  still dies on its own. There's no session table to keep, so the
                  only real "log everyone out" switch is rotating APP_SECRET (or
                  changing ADMIN_EMAIL) — every existing cookie instantly fails the
                  signature check.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="border-line bg-brand-soft/50 border-t px-4 py-3 text-sm font-bold sm:px-5">
        No users table. No sessions table. No signup, no reset, no OIDC. One owner,
        one signed cookie —{" "}
        <span className="text-ink-soft">
          the database has nothing to steal because it never held anything.
        </span>
      </p>
    </div>
  );
}
