import { useState } from "react";
import {
  Eye,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  MessageCircle,
  MousePointerClick,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const visitorSteps: Step[] = [
  {
    icon: Globe,
    title: "Buka website",
    body: "Terus nampak grid gambar. Takde login, takde apa — public punya page.",
  },
  {
    icon: LayoutGrid,
    title: "Pilih folder",
    body: "Klik kategori macam \u201cAlam\u201d atau \u201cKucing\u201d. Grid filter ikut folder tu.",
  },
  {
    icon: MousePointerClick,
    title: "Klik gambar",
    body: "Gambar besar keluar (orang panggil lightbox). Title dan folder pun nampak.",
  },
  {
    icon: MessageCircle,
    title: "Like & komen",
    body: "Visitor boleh tekan like atau tinggal komen. Ni yang buat blog rasa hidup.",
  },
];

const adminSteps: Step[] = [
  {
    icon: LogIn,
    title: "Login",
    body: "Masuk laluan admin. Ni kawasan kau sorang je — visitor tak nampak langsung.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    body: "Nampak statistik ringkas: berapa gambar, komen dan like setakat ni.",
  },
  {
    icon: UploadCloud,
    title: "Upload gambar",
    body: "Pilih fail, letak title, pilih folder, tekan upload. Siap.",
  },
  {
    icon: Eye,
    title: "Terus live",
    body: "Gambar tu terus muncul kat public page. Magic? Tak — tu kerja API.",
  },
];

type Mode = "visitor" | "admin";

export default function FlowSteps() {
  const [mode, setMode] = useState<Mode>("visitor");
  const [active, setActive] = useState<number>(0);
  const steps = mode === "visitor" ? visitorSteps : adminSteps;

  function switchMode(next: Mode) {
    setMode(next);
    setActive(0);
  }

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="border-line flex rounded-full border bg-white p-1"
          role="tablist"
          aria-label="Pilih flow"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "visitor"}
            onClick={() => switchMode("visitor")}
            className={`font-display min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
              mode === "visitor"
                ? "bg-brand text-white shadow-clay-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Sebagai visitor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "admin"}
            onClick={() => switchMode("admin")}
            className={`font-display min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
              mode === "admin"
                ? "bg-ink text-white shadow-clay-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Sebagai admin
          </button>
        </div>
        <p className="text-ink-soft text-xs font-bold">
          Tekan setiap step untuk fokus
        </p>
      </div>

      <ol className="p-4 sm:p-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = active === i;
          const isLast = i === steps.length - 1;
          return (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="border-line absolute top-11 left-[21px] h-[calc(100%-2.5rem)] border-l-2 border-dashed"
                />
              )}
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`z-10 grid size-11 shrink-0 place-items-center rounded-2xl border-2 font-display text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "border-brand bg-brand scale-105 text-white shadow-clay-xs"
                    : "border-line hover:border-brand/40 bg-white text-ink-soft"
                }`}
              >
                {i + 1}
              </button>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`flex-1 rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
                  isActive
                    ? "border-brand bg-brand-soft/70"
                    : "border-transparent bg-paper/60 hover:border-line"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`grid size-8 place-items-center rounded-xl transition-colors ${
                      isActive ? "bg-brand text-white" : "bg-white text-ink-soft"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-display text-base font-semibold">
                    {step.title}
                  </span>
                </span>
                <span
                  className={`text-ink-soft mt-2 block text-sm leading-relaxed ${
                    isActive ? "" : "opacity-80"
                  }`}
                >
                  {step.body}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="border-line bg-brand-soft/50 border-t px-5 py-3 text-sm font-bold">
        {mode === "visitor"
          ? "Ringkasan: buka → tengok → klik → like/komen. Semua tanpa login."
          : "Ringkasan: login → upload → publish. Semua dalam kawalan kau."}
      </p>
    </div>
  );
}
