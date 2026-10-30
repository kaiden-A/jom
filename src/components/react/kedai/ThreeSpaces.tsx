import { useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Eye,
  Lock,
  MessageCircle,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";

type SpaceId = "window" | "counter" | "back";

interface Space {
  id: SpaceId;
  label: string;
  title: string;
  icon: typeof Store;
  access: string;
  tone: string;
  summary: string;
  can: string[];
  cannot: string[];
}

const spaces: Space[] = [
  {
    id: "window",
    label: "The shop window",
    title: "Anyone can look",
    icon: Eye,
    access: "Public read",
    tone: "#2F6B4F",
    summary:
      "The shelf and the item pages. No login, no account, no cart. This is the link the seller shares.",
    can: [
      "Browse every published item.",
      "Open a shareable item link.",
      "See the price, condition, photos, and status.",
      "See whether an item is available, reserved, or sold.",
    ],
    cannot: [
      "See who reserved an item.",
      "See buyer emails or phone numbers.",
      "Change a price or a listing.",
    ],
  },
  {
    id: "counter",
    label: "The counter",
    title: "One buyer can reserve",
    icon: MessageCircle,
    access: "Public write, constrained",
    tone: "#B7791F",
    summary:
      "The reservation form. A buyer can hold one item for 24 hours. The database allows only one pending reservation per item.",
    can: [
      "Create a pending reservation with a name and email.",
      "Claim “I’ve paid” as a signal.",
      "Open a receipt with a reference and a WhatsApp handoff.",
      "Let the reservation expire and release the item.",
    ],
    cannot: [
      "Confirm a payment.",
      "Mark an item as sold.",
      "Create a second pending reservation for the same item.",
      "Change the price the server reads from the item.",
    ],
  },
  {
    id: "back",
    label: "The back room",
    title: "Only the seller changes the shop",
    icon: Lock,
    access: "Admin only",
    tone: "#D94A2B",
    summary:
      "The private admin. Publish, edit, confirm, cancel, extend, archive. Every action checks the session inside the action itself.",
    can: [
      "Publish, edit, archive, and price an item.",
      "See the buyer’s details and the reservation timeline.",
      "Confirm a sale exactly once.",
      "Cancel or extend a pending reservation.",
      "Retry a failed receipt email.",
    ],
    cannot: [
      "Be reached without a valid admin session.",
      "Hard-delete an item that has history.",
      "Confirm a reservation that already expired.",
    ],
  },
];

const matrix = [
  { action: "Browse the shelf", window: true, counter: true, back: true },
  { action: "Reserve one item", window: false, counter: true, back: false },
  { action: "See buyer details", window: false, counter: false, back: true },
  { action: "Confirm a sale", window: false, counter: false, back: true },
  { action: "Change a price", window: false, counter: false, back: true },
  { action: "Publish or archive", window: false, counter: false, back: true },
];

export default function ThreeSpaces() {
  const [activeId, setActiveId] = useState<SpaceId>("window");
  const [blocked, setBlocked] = useState(false);
  const active = spaces.find((space) => space.id === activeId) ?? spaces[0];
  const ActiveIcon = active.icon;

  function choose(id: SpaceId) {
    setActiveId(id);
    setBlocked(false);
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[26px] border border-[#d8cbb4] bg-[#f6f0e2] text-[#2b1d14] shadow-[0_24px_60px_-30px_rgba(43,29,20,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8cbb4] px-4 py-3.5 sm:px-5">
        <div>
          <p className="font-mono text-[9px] tracking-[0.18em] text-[#5f5142] uppercase">
            The three spaces
          </p>
          <p
            className="mt-0.5 text-lg leading-tight"
            style={{ fontFamily: 'Fraunces, Georgia, "Times New Roman", serif' }}
          >
            A shop has a window, a counter, and a back room.
          </p>
        </div>
        <span className="rounded-full border border-[#d94a2b]/30 bg-[#d94a2b]/5 px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-[#a83a21] uppercase">
          The database is the lock
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {spaces.map((space) => {
          const Icon = space.icon;
          const isActive = space.id === activeId;
          return (
            <button
              key={space.id}
              type="button"
              onClick={() => choose(space.id)}
              aria-pressed={isActive}
              className={`rounded-xl border-2 p-3.5 text-left transition-all duration-150 ${
                isActive
                  ? "border-[#2b1d14] bg-[#fbf7ec] shadow-[0_10px_22px_-16px_rgba(43,29,20,0.4)]"
                  : "border-[#d8cbb4] bg-[#fbf7ec]/55 hover:border-[#b9a88e]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="grid size-9 place-items-center rounded-lg text-white"
                  style={{ backgroundColor: isActive ? space.tone : "#b9a88e" }}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[9px] tracking-[0.14em] text-[#5f5142] uppercase">
                    {space.access}
                  </span>
                  <span
                    className="block truncate text-sm font-semibold"
                    style={{
                      fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
                    }}
                  >
                    {space.label}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-4 mb-4 rounded-xl border border-[#d8cbb4] bg-[#fbf7ec] p-4 sm:mx-5 sm:mb-5 sm:p-5">
        <div className="flex items-start gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full text-white"
            style={{ backgroundColor: active.tone }}
          >
            <ActiveIcon className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <h4
              className="text-xl leading-tight"
              style={{
                fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
              }}
            >
              {active.title}
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed font-bold text-[#5f5142]">
              {active.summary}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[9px] tracking-[0.14em] text-[#2f6b4f] uppercase">
              What it can do
            </p>
            <ul className="mt-2 space-y-2">
              {active.can.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-relaxed text-[#5f5142]"
                >
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-[#2f6b4f]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-[0.14em] text-[#a83a21] uppercase">
              What it must never do
            </p>
            <ul className="mt-2 space-y-2">
              {active.cannot.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-relaxed text-[#5f5142]"
                >
                  <X
                    className="mt-0.5 size-3.5 shrink-0 text-[#d94a2b]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#d8cbb4] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[9px] tracking-[0.14em] text-[#5f5142] uppercase">
            Who can do what?
          </p>
          <button
            type="button"
            onClick={() => setBlocked((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-[#d94a2b]/35 bg-white px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] text-[#a83a21] uppercase transition-colors hover:bg-[#d94a2b]/5"
          >
            <ShieldCheck className="size-3" aria-hidden="true" />
            Try to confirm as a buyer
          </button>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-[#d8cbb4]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#f1e9d8]">
                <th className="px-3 py-2 font-mono text-[9px] tracking-[0.1em] text-[#5f5142] uppercase">
                  Action
                </th>
                <th className="px-2 py-2 text-center font-mono text-[9px] tracking-[0.08em] text-[#5f5142] uppercase">
                  Window
                </th>
                <th className="px-2 py-2 text-center font-mono text-[9px] tracking-[0.08em] text-[#5f5142] uppercase">
                  Counter
                </th>
                <th className="px-2 py-2 text-center font-mono text-[9px] tracking-[0.08em] text-[#5f5142] uppercase">
                  Back room
                </th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.action} className="border-t border-[#e4dac7]">
                  <td className="px-3 py-2 font-bold text-[#5f5142]">
                    {row.action}
                  </td>
                  {[row.window, row.counter, row.back].map((allowed, index) => (
                    <td key={index} className="px-2 py-2 text-center">
                      {allowed ? (
                        <Check
                          className="mx-auto size-3.5 text-[#2f6b4f]"
                          aria-label="Allowed"
                        />
                      ) : (
                        <X
                          className="mx-auto size-3.5 text-[#c9bca8]"
                          aria-label="Not allowed"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {blocked && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border-2 border-dashed border-[#d94a2b]/45 bg-[#d94a2b]/5 p-3">
            <Lock
              className="mt-0.5 size-4 shrink-0 text-[#d94a2b]"
              aria-hidden="true"
            />
            <div>
              <p className="font-mono text-[9px] tracking-[0.12em] text-[#a83a21] uppercase">
                Blocked
              </p>
              <p className="mt-1 text-xs leading-relaxed font-bold text-[#5f5142]">
                A buyer can reserve, claim, and ask. Only the admin session can
                confirm a sale. Hiding the button is not the security — the
                conditional update in the back room is.
              </p>
            </div>
            <ArrowRight
              className="mt-0.5 size-3.5 shrink-0 text-[#d94a2b]"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#f1e9d8] px-3 py-2.5 text-[11px] leading-relaxed font-bold text-[#5f5142]">
          <ClipboardList className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            The shop window is a read. The counter is a constrained write. The
            back room is an authorized write. Three spaces, three different
            rules.
          </span>
        </div>
      </div>
    </div>
  );
}
