import { useState } from "react";
import { Eye, UploadCloud, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";

type Flow = "view" | "upload";

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
  anchor?: "start" | "middle" | "end";
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
const RESULT_D = "M570,125 C520,125 520,235 480,235";
const IMAGE_D = "M570,322 C400,404 260,340 212,262";
const STORE_D = "M480,235 C520,235 520,322 570,322";

const flows: FlowInfo[] = [
  {
    id: "view",
    label: "Visitor buka page",
    icon: Eye,
    color: "#4f46e5",
    steps: [
      "React minta data dari Express.",
      "Express query Neon — bagi semua gambar ikut folder.",
      "Neon pulangkan data, Express hantar balik sebagai JSON.",
      "Browser ambil fail gambar terus dari R2 — server kita tak payah lalu.",
    ],
    tracks: [
      { id: "view-req", d: REQ_D },
      { id: "view-query", d: QUERY_D },
      { id: "view-result", d: RESULT_D },
      { id: "view-image", d: IMAGE_D },
    ],
    badges: [
      { n: 1, x: 248, y: 210, label: "minta data", dy: -20 },
      { n: 2, x: 521, y: 140, label: "query", dy: -20 },
      { n: 3, x: 521, y: 180, label: "balik JSON", dy: 34 },
      { n: 4, x: 345, y: 352, label: "gambar terus dari R2", dy: 34 },
    ],
  },
  {
    id: "upload",
    label: "Admin upload gambar",
    icon: UploadCloud,
    color: "#ea580c",
    steps: [
      "Admin pilih gambar, React hantar ke Express.",
      "Express simpan fail gambar ke R2.",
      "Dapat URL gambar, Express simpan metadata (title, folder, URL) dalam Neon.",
    ],
    tracks: [
      { id: "up-req", d: REQ_D },
      { id: "up-store", d: STORE_D },
      { id: "up-meta", d: QUERY_D },
    ],
    badges: [
      { n: 1, x: 248, y: 210, label: "hantar gambar", dy: -20 },
      { n: 2, x: 521, y: 278, label: "simpan fail", dy: 34 },
      { n: 3, x: 521, y: 140, label: "metadata", dy: -20 },
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
        filter="url(#archShadow)"
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

export default function ArchDiagram() {
  const [flow, setFlow] = useState<Flow>("view");
  const reduced = useReducedMotion();
  const active = flows.find((f) => f.id === flow) ?? flows[0]!;

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Pilih flow data"
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
          Tekan butang untuk tukar flow
        </p>
      </div>

      <div className="overflow-x-auto px-2 py-4 sm:px-4">
        <svg
          viewBox="0 0 780 420"
          className="mx-auto h-auto w-full min-w-[660px] max-w-[780px]"
          role="img"
          aria-label={`Diagram arkitektur — ${active.label}`}
        >
          <defs>
            <filter
              id="archShadow"
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
                textAnchor={b.anchor ?? "middle"}
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
            title="React"
            lines={["Public UI + Admin UI", "jalan dalam browser"]}
          />
          <Node
            x={300}
            y={158}
            title="Express API"
            lines={["logic + auth", "pintu masuk data"]}
          />
          <Node
            x={570}
            y={56}
            title="Neon"
            lines={["gambar · folder", "komen · like"]}
          />
          <Node
            x={570}
            y={270}
            title="Cloudflare R2"
            lines={["fail gambar", "murah + laju"]}
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
