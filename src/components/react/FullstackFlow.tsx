import { useState } from "react";
import { Download, UploadCloud, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";

type Flow = "read" | "write";

interface Track {
  id: string;
  d: string;
}

interface Badge {
  n: number;
  x: number;
  y: number;
  label: string;
  dy: number;
}

interface FlowInfo {
  id: Flow;
  label: string;
  icon: LucideIcon;
  color: string;
  steps: string[];
  tracks: Track[];
  badges: Badge[];
}

const FWD_A = "M210,200 H300";
const FWD_B = "M480,200 H570";
const BACK_B = "M570,220 H480";
const BACK_A = "M300,220 H210";

const flows: FlowInfo[] = [
  {
    id: "read",
    label: "Read data — GET",
    icon: Download,
    color: "#4f46e5",
    steps: [
      "The browser sends GET /api/users to Express.",
      "Express runs a SELECT query against MySQL.",
      "MySQL returns the matching rows.",
      "Express wraps them in JSON and sends them back. That's the round trip.",
    ],
    tracks: [
      { id: "read-req", d: FWD_A },
      { id: "read-query", d: FWD_B },
      { id: "read-rows", d: BACK_B },
      { id: "read-res", d: BACK_A },
    ],
    badges: [
      { n: 1, x: 255, y: 200, label: "request", dy: -22 },
      { n: 2, x: 525, y: 200, label: "query", dy: -22 },
      { n: 3, x: 525, y: 220, label: "rows", dy: 40 },
      { n: 4, x: 255, y: 220, label: "JSON back", dy: 40 },
    ],
  },
  {
    id: "write",
    label: "Create data — POST",
    icon: UploadCloud,
    color: "#ea580c",
    steps: [
      "The browser sends the new user as JSON to POST /api/users.",
      "Express runs an INSERT into MySQL.",
      "MySQL confirms the write and hands back the new id.",
      "Express replies with 201 Created and the new record.",
    ],
    tracks: [
      { id: "write-req", d: FWD_A },
      { id: "write-insert", d: FWD_B },
      { id: "write-ok", d: BACK_B },
      { id: "write-res", d: BACK_A },
    ],
    badges: [
      { n: 1, x: 255, y: 200, label: "new user data", dy: -22 },
      { n: 2, x: 525, y: 200, label: "INSERT", dy: -22 },
      { n: 3, x: 525, y: 220, label: "ok", dy: 40 },
      { n: 4, x: 255, y: 220, label: "201 + row", dy: 40 },
    ],
  },
];

const backgroundPaths = Array.from(
  new Set(flows.flatMap((f) => f.tracks.map((t) => t.d))),
);

function Node({
  x,
  y,
  title,
  lines,
}: {
  x: number;
  y: number;
  title: string;
  lines: string[];
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={180}
        height={104}
        rx={20}
        fill="#ffffff"
        stroke="#e8e3f0"
        strokeWidth={2}
        filter="url(#flowShadow)"
      />
      <text
        x={x + 20}
        y={y + 42}
        fontSize={19}
        fontWeight={600}
        fill="#221c46"
        fontFamily="Fredoka, sans-serif"
      >
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + 20}
          y={y + 66 + i * 18}
          fontSize={12.5}
          fontWeight={700}
          fill="#5d5680"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export default function FullstackFlow() {
  const [flow, setFlow] = useState<Flow>("read");
  const reduced = useReducedMotion();
  const active = flows.find((f) => f.id === flow) ?? flows[0]!;

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Choose request type"
        >
          {flows.map((f) => {
            const Icon = f.icon;
            const isActive = flow === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFlow(f.id)}
                className={`font-display inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? ""
                    : "border-line text-ink-soft hover:border-brand/40 hover:text-ink bg-white"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: f.color,
                        borderColor: f.color,
                        color: "#fff",
                      }
                    : {}
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="text-ink-soft text-xs font-bold">
          Follow the data around the loop
        </p>
      </div>

      <div className="overflow-x-auto px-2 py-4 sm:px-4">
        <svg
          viewBox="0 0 780 420"
          className="mx-auto h-auto w-full min-w-[660px] max-w-[780px]"
          role="img"
          aria-label={`Fullstack flow — ${active.label}`}
        >
          <defs>
            <filter
              id="flowShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="10"
                floodColor="#221c46"
                floodOpacity="0.14"
              />
            </filter>
            {active.tracks.map((t) => (
              <path key={t.id} id={t.id} d={t.d} fill="none" />
            ))}
          </defs>

          {backgroundPaths.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#d9d4ea"
              strokeWidth={2}
              strokeDasharray="6 7"
              strokeLinecap="round"
            />
          ))}

          {active.tracks.map((t) => (
            <use
              key={t.id}
              href={`#${t.id}`}
              stroke={active.color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}

          {!reduced &&
            active.tracks.map((t, ti) => (
              <g key={`dot-${t.id}`}>
                <circle r="5.5" fill={active.color}>
                  <animateMotion
                    dur="1.6s"
                    repeatCount="indefinite"
                    begin={`${ti * 0.25}s`}
                  >
                    <mpath href={`#${t.id}`} xlinkHref={`#${t.id}`} />
                  </animateMotion>
                </circle>
                <circle r="5.5" fill={active.color} opacity="0.5">
                  <animateMotion
                    dur="1.6s"
                    repeatCount="indefinite"
                    begin={`${(ti * 0.25 - 0.8).toFixed(2)}s`}
                  >
                    <mpath href={`#${t.id}`} xlinkHref={`#${t.id}`} />
                  </animateMotion>
                </circle>
              </g>
            ))}

          {active.badges.map((b) => (
            <g key={`badge-${b.n}`}>
              <text
                x={b.x}
                y={b.y + b.dy}
                textAnchor="middle"
                fontSize={12.5}
                fontWeight={800}
                fill={active.color}
                paintOrder="stroke"
                stroke="#faf7f2"
                strokeWidth={5}
                strokeLinejoin="round"
              >
                {b.label}
              </text>
              <circle
                cx={b.x}
                cy={b.y}
                r={11}
                fill={active.color}
                stroke="#faf7f2"
                strokeWidth={2}
              />
              <text
                x={b.x}
                y={b.y + 4.5}
                textAnchor="middle"
                fontSize={12}
                fontWeight={800}
                fill="#ffffff"
                fontFamily="Fredoka, sans-serif"
              >
                {b.n}
              </text>
            </g>
          ))}

          <Node
            x={30}
            y={158}
            title="Client"
            lines={["the browser", "sends requests"]}
          />
          <Node
            x={300}
            y={158}
            title="Express API"
            lines={["routes + logic", "port 5000"]}
          />
          <Node
            x={570}
            y={158}
            title="MySQL"
            lines={["the database", "demo_db"]}
          />
        </svg>
      </div>

      <ol className="border-line space-y-2 border-t px-5 py-4">
        {active.steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm font-bold">
            <span
              className="font-display grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: active.color }}
            >
              {i + 1}
            </span>
            <span className="text-ink-soft leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
