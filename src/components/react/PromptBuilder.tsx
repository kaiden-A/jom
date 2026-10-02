import { useMemo, useState } from "react";
import {
  Check,
  ClipboardCheck,
  Copy,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  buildPrompt,
  palettes,
  presets,
  vibes,
} from "./prompt-builder/data";

type Lang = "en";

export default function PromptBuilder() {
  const [presetId, setPresetId] = useState(presets[0]!.id);
  const preset = presets.find((p) => p.id === presetId) ?? presets[0]!;
  const [name, setName] = useState(preset.name);
  const [selected, setSelected] = useState<string[]>(preset.defaultFeatures);
  const [paletteId, setPaletteId] = useState(preset.defaultPalette);
  const [vibeId, setVibeId] = useState(preset.defaultVibe);
  const [lang, setLang] = useState<Lang>("en");
  const [copied, setCopied] = useState(false);

  const palette = palettes.find((p) => p.id === paletteId) ?? palettes[0]!;
  const vibe = vibes.find((v) => v.id === vibeId) ?? vibes[0]!;

  const prompt = useMemo(
    () =>
      buildPrompt({
        lang,
        projectName: name.trim() || preset.name,
        what: preset.what,
        features: preset.features.filter((f) => selected.includes(f.bm)),
        palette,
        vibe,
      }),
    [lang, name, preset, selected, palette, vibe],
  );

  function applyPreset(id: string) {
    const next = presets.find((p) => p.id === id);
    if (!next) return;
    setPresetId(id);
    setName(next.name);
    setSelected(next.defaultFeatures);
    setPaletteId(next.defaultPalette);
    setVibeId(next.defaultVibe);
  }

  function toggleFeature(bm: string) {
    setSelected((prev) =>
      prev.includes(bm) ? prev.filter((x) => x !== bm) : [...prev, bm],
    );
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand grid size-9 place-items-center rounded-xl text-white">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display leading-tight font-semibold">
              Prompt Builder
            </p>
            <p className="text-ink-soft text-xs font-bold">
              Choose, copy and paste inside opencode
            </p>
          </div>
        </div>
        <div
          className="border-line flex rounded-full border bg-white p-1"
          role="group"
          aria-label="Bahasa prompt"
        >
          {(["en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`font-display min-h-9 rounded-full px-4 text-xs font-semibold transition-colors ${
                lang === l ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {"English"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="space-y-6 p-4 sm:p-5">
          <fieldset>
            <legend className="font-display text-sm font-semibold">
              1 · What do you want to build?
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {presets.map((p) => {
                const active = presetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    aria-pressed={active}
                    className={`min-h-11 rounded-2xl border-2 px-3.5 py-2.5 text-left text-sm font-bold transition-all duration-150 ${
                      active
                        ? "border-brand bg-brand-soft text-brand-deep"
                        : "border-line hover:border-brand/40 bg-white"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
            <label className="mt-3 block">
              <span className="text-xs font-bold tracking-wide uppercase">
                Projects Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-line focus:border-brand mt-1.5 min-h-11 w-full rounded-xl border-2 bg-white px-3 text-sm font-bold outline-none"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend className="font-display text-sm font-semibold">
              2 · What feature you want?
            </legend>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {preset.features.map((feature) => {
                const active = selected.includes(feature.bm);
                return (
                  <button
                    key={feature.bm}
                    type="button"
                    onClick={() => toggleFeature(feature.bm)}
                    aria-pressed={active}
                    className={`flex min-h-11 items-center gap-2.5 rounded-xl border-2 px-3 text-left text-sm font-bold transition-colors ${
                      active
                        ? "border-brand bg-brand-soft/60 text-ink"
                        : "border-line hover:border-brand/40 bg-white text-ink-soft"
                    }`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-white text-transparent"
                      }`}
                    >
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {feature.bm}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-sm font-semibold">
              3 · Warna
            </legend>
            <div className="mt-3 grid gap-2">
              {palettes.map((p) => {
                const active = paletteId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaletteId(p.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition-all duration-150 ${
                      active
                        ? "border-brand bg-brand-soft/60"
                        : "border-line hover:border-brand/40 bg-white"
                    }`}
                  >
                    <span className="flex shrink-0 -space-x-1.5">
                      {p.colors.map((c) => (
                        <span
                          key={c.hex}
                          className="size-5 rounded-full border-2 border-white"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{p.name}</span>
                      <span className="text-ink-soft/70 block truncate font-mono text-[10px]">
                        {p.colors.map((c) => c.hex).join(" ")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-sm font-semibold">
              4 · Design
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {vibes.map((v) => {
                const active = vibeId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVibeId(v.id)}
                    aria-pressed={active}
                    className={`font-display min-h-10 rounded-full border-2 px-4 text-sm font-semibold transition-colors ${
                      active
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink-soft hover:border-ink/40 hover:text-ink bg-white"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
            <p className="text-ink-soft mt-2 text-xs font-bold">{vibe.desc}</p>
          </fieldset>
        </div>

        <div className="bg-ink flex flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-sm font-semibold text-white">
              Prompt kau
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset(presetId)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-xs font-bold text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Reset
              </button>
              <button
                type="button"
                onClick={copyPrompt}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors ${
                  copied
                    ? "bg-mint text-ink"
                    : "bg-accent text-ink hover:bg-[#fb8a3c]"
                }`}
              >
                {copied ? (
                  <ClipboardCheck className="size-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy prompt"}
              </button>
            </div>
          </div>
          <pre className="mt-3 max-h-[420px] flex-1 overflow-auto rounded-2xl bg-white/5 p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-white/90 lg:max-h-none">
            {prompt}
          </pre>
          <p className="mt-3 text-xs font-bold text-white/50">
            Paste prompt ni dalam opencode. Lepas tu iterate — tukar sikit-sikit,
            bukan sekali jadi.
          </p>
        </div>
      </div>
    </div>
  );
}
