import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

interface NameIdea {
  name: string;
  tag: string;
  desc: string;
}

const ideas: NameIdea[] = [
  {
    name: "Galblog",
    tag: "gallery + blog",
    desc: "Terus orang faham apa benda ni. Simple dan selamat.",
  },
  {
    name: "Pixspace",
    tag: "pixel + space",
    desc: "Bunyi modern sikit. Macam nama startup.",
  },
  {
    name: "Galeri Kito",
    tag: "kito = kita",
    desc: "Mesra dan warm. Macam orang ajak sembang.",
  },
  {
    name: "Snapshelf",
    tag: "snap + shelf",
    desc: "Macam rak gambar. English tapi comel.",
  },
];

export default function NamePicker() {
  const [picked, setPicked] = useState<string | null>(null);

  function shuffle() {
    const others = ideas.filter((i) => i.name !== picked);
    const next = others[Math.floor(Math.random() * others.length)];
    if (next) setPicked(next.name);
  }

  return (
    <div className="not-prose my-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {ideas.map((idea) => {
          const active = picked === idea.name;
          return (
            <button
              key={idea.name}
              type="button"
              onClick={() => setPicked(idea.name)}
              aria-pressed={active}
              className={`group relative min-h-11 rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
                active
                  ? "border-brand bg-brand-soft shadow-clay-xs -translate-y-0.5"
                  : "border-line hover:border-brand/40 bg-white shadow-clay-xs hover:-translate-y-0.5"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-semibold">
                  {idea.name}
                </span>
                <span
                  className={`grid size-6 place-items-center rounded-full transition-colors ${
                    active ? "bg-brand text-white" : "bg-line/60 text-transparent"
                  }`}
                >
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
              </span>
              <span className="bg-sun/40 text-ink mt-1.5 inline-block rounded-full px-2 py-0.5 font-mono text-[11px]">
                {idea.tag}
              </span>
              <span className="text-ink-soft mt-2 block text-sm leading-relaxed">
                {idea.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={shuffle}
          className="btn btn-ghost !min-h-10 !px-4 !py-1.5 text-sm"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Kasi aku random
        </button>
        <p className="text-ink-soft text-sm font-bold" aria-live="polite">
          {picked
            ? `Ok, dalam lesson ni kita panggil dia "${picked}". Tukar bila-bila pun boleh.`
            : "Tekan mana-mana satu. Ni demo je — nama pun tak affect ape-ape."}
        </p>
      </div>
    </div>
  );
}
