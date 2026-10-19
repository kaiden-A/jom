import { useState } from "react";
import { Eye, Trash2, UploadCloud, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";

type Flow = "upload" | "read" | "delete";

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

const REQ_D = "M210,210 H300";
const QUERY_D = "M480,185 C520,185 520,95 570,95";
const IMAGE_D = "M570,322 C400,404 260,340 212,262";
const UPLOAD_D = "M212,262 C260,340 400,404 570,322";
const STORE_D = "M480,235 C520,235 520,322 570,322";

const flows: FlowInfo[] = [
  {
    id: "upload",
    label: "Upload a photo",
    icon: UploadCloud,
    color: "#ea580c",
    steps: [
      "Admin picks a file. upload.js asks Express for a ticket: POST /uploads/sign with {contentType, size}.",
      "Express checks the allowlist (jpeg, png, webp, gif, avif — never SVG), checks the size cap, mints a key like images/2026/<uuid>.jpg, and returns a presigned URL that dies in 5 minutes.",
      "The browser PUTs the file straight to R2 with the same Content-Type. No cookies, no server relay.",
      "The key lands in a hidden field. On submit, assertUploadedImage runs: pattern ok? HeadObject finds it? Size and type still right?",
      "Only then is the key written to Neon. A bad object is deleted, and the form comes back with an error.",
    ],
    tracks: [
      { id: "up-sign", d: REQ_D },
      { id: "up-put", d: UPLOAD_D },
      { id: "up-head", d: STORE_D },
      { id: "up-insert", d: QUERY_D },
    ],
    badges: [
      { n: 1, x: 248, y: 210, label: "ask for a ticket", dy: -20 },
      { n: 2, x: 345, y: 352, label: "PUT straight to R2", dy: 38 },
      { n: 3, x: 521, y: 278, label: "HeadObject check", dy: 34 },
      { n: 4, x: 521, y: 140, label: "key saved", dy: -20 },
    ],
  },
  {
    id: "read",
    label: "View photos",
    icon: Eye,
    color: "#4f46e5",
    steps: [
      "Express queries Neon and builds one image URL per row — a public URL if R2_PUBLIC_BASE_URL is set, otherwise a fresh signed GET valid for one hour.",
      "Those URLs ride along in the HTML.",
      "The browser fetches every photo straight from R2. Our server never streams the bytes — that's why the page stays snappy.",
    ],
    tracks: [
      { id: "rd-page", d: REQ_D },
      { id: "rd-keys", d: QUERY_D },
      { id: "rd-img", d: IMAGE_D },
    ],
    badges: [
      { n: 1, x: 248, y: 210, label: "GET /", dy: -20 },
      { n: 2, x: 521, y: 140, label: "keys", dy: -20 },
      { n: 3, x: 345, y: 352, label: "files straight from R2", dy: 34 },
    ],
  },
  {
    id: "delete",
    label: "Delete a photo",
    icon: Trash2,
    color: "#e11d48",
    steps: [
      "The delete form POSTs to /photos/:id/delete.",
      "The row goes first: DELETE … RETURNING. Nothing matched? A clean 404.",
      "Then the R2 object is removed. If that call fails: log it, never fail the user — the database already told the truth.",
      "Leftovers get swept by sweep-orphans: images/ objects older than 24h that no row references.",
    ],
    tracks: [
      { id: "del-req", d: REQ_D },
      { id: "del-row", d: QUERY_D },
      { id: "del-obj", d: STORE_D },
    ],
    badges: [
      { n: 1, x: 248, y: 210, label: "DELETE it", dy: -20 },
      { n: 2, x: 521, y: 140, label: "row first", dy: -20 },
      { n: 3, x: 521, y: 278, label: "object second", dy: 34 },
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
        filter="url(#uploadShadow)"
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

export default function UploadFlow() {
  const [flow, setFlow] = useState<Flow>("upload");
  const reduced = useReducedMotion();
  const active = flows.find((f) => f.id === flow) ?? flows[0]!;

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Choose the image flow"
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
          The browser talks to R2 directly
        </p>
      </div>

      <div className="overflow-x-auto px-2 py-4 sm:px-4">
        <svg
          viewBox="0 0 780 420"
          className="mx-auto h-auto w-full min-w-[660px] max-w-[780px]"
          role="img"
          aria-label={`Image flow — ${active.label}`}
        >
          <defs>
            <filter
              id="uploadShadow"
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
            title="Browser"
            lines={["picks the file", "holds no secrets"]}
          />
          <Node
            x={300}
            y={158}
            title="Express app"
            lines={["mints keys + URLs", "never touches bytes"]}
          />
          <Node
            x={570}
            y={56}
            title="Neon"
            lines={["stores the key", "text, not files"]}
          />
          <Node
            x={570}
            y={270}
            title="Cloudflare R2"
            lines={["stores the file", "S3-compatible"]}
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
