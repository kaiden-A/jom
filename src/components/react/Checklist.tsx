import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";

const defaultItems = [
  "Nama projek (guna pemilih nama kat atas tu)",
  "Laptop + Node.js dah install",
  "Akaun Neon (untuk database)",
  "Akaun Cloudflare (untuk R2)",
  "Editor code — VS Code ke, apa-apa pun boleh",
  "Masa 5-10 minit sehari, secara konsisten",
];

interface Props {
  items?: string[];
  storageKey?: string;
}

export default function Checklist({
  items = defaultItems,
  storageKey = "jom-mula-checklist",
}: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setChecked(items.map((_, i) => Boolean(parsed[i])));
        }
      }
    } catch {
      // localStorage tak available — takpe, demo je
    }
    setReady(true);
  }, [storageKey, items]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, ready, storageKey]);

  const count = checked.filter(Boolean).length;
  const pct = Math.round((count / items.length) * 100);

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function reset() {
    setChecked(items.map(() => false));
  }

  return (
    <div className="clay not-prose my-8 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-lg font-semibold">Senarai keperluan</p>
        <div className="flex items-center gap-3">
          <span className="text-ink-soft text-sm font-bold">
            {count}/{items.length} siap
          </span>
          {count > 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-xs font-bold transition-colors"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div
        className="bg-line/60 mt-4 h-2.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kemajuan senarai keperluan"
      >
        <div
          className="bg-mint h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-1.5">
        {items.map((item, i) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={checked[i]}
              className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-paper"
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
                  checked[i]
                    ? "border-mint bg-mint text-ink"
                    : "border-line bg-white text-transparent group-hover:border-brand/50"
                }`}
              >
                <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              </span>
              <span
                className={`text-sm font-bold transition-colors sm:text-base ${
                  checked[i] ? "text-ink-soft line-through" : "text-ink"
                }`}
              >
                {item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
