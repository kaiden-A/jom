import { useState } from "react";
import {
  ArrowRight,
  Check,
  Cloud,
  Download,
  Eye,
  FileImage,
  Globe,
  KeyRound,
  Link2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

const steps = [
  {
    title: "The email link",
    body: "The customer opens /download/<raw token>. The token is random, 256-bit, and only the hash lives in the database.",
    icon: Mail,
  },
  {
    title: "The app checks the token",
    body: "Hash the token, look it up, and confirm it is not revoked and not expired. No order details are revealed if it fails.",
    icon: KeyRound,
  },
  {
    title: "The app checks the order",
    body: "The token points at an order. Is that order actually paid? A pending, cancelled, or refunded order stops here.",
    icon: ShieldCheck,
  },
  {
    title: "A fresh R2 URL is signed",
    body: "Only now does the server ask R2 for a GET URL. It expires in five minutes and points at one object key.",
    icon: Link2,
  },
  {
    title: "The browser downloads",
    body: "The bytes come straight from R2. The original key was never in the page, and the signed URL dies quickly.",
    icon: Download,
  },
] as const;

export default function TrustBoundaries() {
  const [step, setStep] = useState(0);
  const [expired, setExpired] = useState(false);
  const [failed, setFailed] = useState(false);

  const active = steps[step];
  const ActiveIcon = active.icon;
  const isLast = step === steps.length - 1;
  const blocked = expired && failed;

  function next() {
    if (isLast) return;
    if (expired && step === 1) {
      setFailed(true);
      return;
    }
    setStep((current) => current + 1);
  }

  function reset() {
    setStep(0);
    setExpired(false);
    setFailed(false);
  }

  function toggleExpired() {
    setExpired((current) => !current);
    setStep(0);
    setFailed(false);
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[26px] border border-[#d9d1c3] bg-[#f3efe6] text-[#141210] shadow-[0_24px_60px_-30px_rgba(20,18,16,0.35)]">
      <div className="border-b border-[#d9d1c3] px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[9px] tracking-[0.18em] text-[#8b8173] uppercase">
            The two doors
          </p>
          <span className="rounded-full border border-[#c63b2f]/30 bg-[#c63b2f]/5 px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-[#a32e24] uppercase">
            The app is the doorman
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
        <div className="rounded-xl border border-[#d9d1c3] bg-[#fbf9f3] p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full border border-[#d9d1c3] bg-white">
              <Globe className="size-4 text-[#141210]" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#8b8173] uppercase">
                Public
              </p>
              <p
                className="text-lg leading-tight"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                The shop window
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#5f584e]">
            {[
              "Gallery and detail pages anyone can open.",
              "Watermarked, downscaled previews served by the app.",
              "The preview key is public; the original key is not.",
              "No login, no account, no cart.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Eye className="mt-0.5 size-3.5 shrink-0 text-[#8b8173]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#141210] bg-[#141210] p-4 text-[#f3efe6]">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full border border-[#f3efe6]/20 bg-[#f3efe6]/5">
              <Lock className="size-4 text-[#e37a70]" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#f3efe6]/45 uppercase">
                Private
              </p>
              <p
                className="text-lg leading-tight"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                The vault
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#f3efe6]/65">
            {[
              "Originals live in a private R2 bucket.",
              "Only a paid order can ask for a URL.",
              "Every URL is signed, object-scoped, and short-lived.",
              "The admin never sees the raw download token.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <FileImage className="mt-0.5 size-3.5 shrink-0 text-[#f3efe6]/35" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#d9d1c3] bg-[#fbf9f3] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.18em] text-[#8b8173] uppercase">
              Follow the ticket
            </p>
            <p
              className="mt-1 text-lg leading-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              The email link is not the file.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleExpired}
            aria-pressed={expired}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] uppercase transition-colors ${
              expired
                ? "border-[#c63b2f]/50 bg-[#c63b2f]/10 text-[#a32e24]"
                : "border-[#d9d1c3] bg-white text-[#6e675c] hover:border-[#c63b2f]/30"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${expired ? "bg-[#c63b2f]" : "bg-[#8b8173]"}`}
              aria-hidden="true"
            />
            {expired ? "Using expired token" : "Try an expired token"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <ol className="list-none space-y-1.5 p-0">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const done = index < step && !blocked;
              const isActive = index === step && !blocked;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => {
                      if (index <= step && !blocked) setStep(index);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "border-[#c63b2f]/40 bg-[#c63b2f]/5"
                        : done
                          ? "border-[#d9d1c3] bg-white"
                          : "border-transparent bg-transparent"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full border ${
                        done
                          ? "border-[#141210] bg-[#141210] text-[#f3efe6]"
                          : isActive
                            ? "border-[#c63b2f] bg-[#c63b2f] text-white"
                            : "border-[#d9d1c3] bg-white text-[#8b8173]"
                      }`}
                    >
                      {done ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Icon className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] tracking-[0.08em] text-[#141210] uppercase">
                        {item.title}
                      </span>
                      {isActive && (
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-[#6e675c]">
                          {item.body}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <ArrowRight className="size-3.5 shrink-0 text-[#c63b2f]" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="rounded-xl border border-[#141210] bg-[#141210] p-4 text-[#f3efe6]">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[9px] tracking-[0.16em] text-[#f3efe6]/40 uppercase">
                {blocked ? "Access denied" : `Step ${step + 1} of ${steps.length}`}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f3efe6]/15 px-2 py-1 font-mono text-[9px] tracking-[0.08em] text-[#f3efe6]/45 uppercase">
                <Cloud className="size-3" aria-hidden="true" />
                R2 · private
              </span>
            </div>

            <div className="mt-4 min-h-[126px]">
              {blocked ? (
                <div>
                  <span className="grid size-9 place-items-center rounded-full border border-[#c63b2f]/40 bg-[#c63b2f]/15">
                    <X className="size-4 text-[#e37a70]" aria-hidden="true" />
                  </span>
                  <p
                    className="mt-3 text-lg leading-tight"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    The link is expired.
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#f3efe6]/55">
                    The app returns one generic page. It does not reveal the
                    order, the photo, or whether the token ever existed. The
                    studio can issue a fresh link.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f3efe6] px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] text-[#141210] uppercase"
                  >
                    <RefreshCw className="size-3" aria-hidden="true" />
                    Reissue a valid token
                  </button>
                </div>
              ) : (
                <div>
                  <span className="grid size-9 place-items-center rounded-full border border-[#f3efe6]/15 bg-[#f3efe6]/5">
                    <ActiveIcon className="size-4 text-[#e37a70]" aria-hidden="true" />
                  </span>
                  <p
                    className="mt-3 text-lg leading-tight"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {active.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#f3efe6]/55">
                    {active.body}
                  </p>
                  {step === 2 && (
                    <div className="mt-3 rounded-lg border border-[#4f8a68]/30 bg-[#4f8a68]/10 px-3 py-2 font-mono text-[10px] text-[#9ed0b1]">
                      order.status === &quot;paid&quot; ✓
                    </div>
                  )}
                  {step === 3 && (
                    <div className="mt-3 rounded-lg border border-[#f3efe6]/15 bg-[#f3efe6]/5 px-3 py-2 font-mono text-[10px] text-[#f3efe6]/60">
                      GET https://…r2.cloudflarestorage.com/…?X-Amz-Expires=300
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#f3efe6]/10 pt-3">
              <button
                type="button"
                onClick={reset}
                className="font-mono text-[9px] tracking-[0.08em] text-[#f3efe6]/40 uppercase hover:text-[#f3efe6]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={next}
                disabled={isLast || blocked}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#c63b2f] px-3.5 py-2 font-mono text-[9px] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#a32e24] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLast ? "Downloaded" : "Next step"}
                <ArrowRight className="size-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#6e675c]">
          <Link2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            The permanent thing in the email is an <strong>app URL</strong>, not a
            storage URL. When a signed R2 URL expires, the customer can open the
            email again and the app will mint a fresh one.
          </span>
        </p>
      </div>
    </div>
  );
}
