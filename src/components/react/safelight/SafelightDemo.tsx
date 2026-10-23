import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  FileImage,
  KeyRound,
  Lock,
  Mail,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

type Mode = "visitor" | "studio";
type VisitorView = "gallery" | "detail" | "receipt" | "download";
type OrderStatus = "pending_payment" | "paid" | "cancelled" | "refunded";
type EmailStatus = "not_sent" | "sending" | "sent" | "failed";

interface Photo {
  id: number;
  title: string;
  place: string;
  year: string;
  priceCents: number;
  seed: string;
  tone: string;
  note: string;
}

interface Order {
  reference: string;
  photoId: number;
  email: string;
  priceCents: number;
  status: OrderStatus;
  emailStatus: EmailStatus;
  claimed: boolean;
  downloaded: boolean;
}

const PHOTOS: Photo[] = [
  {
    id: 1,
    title: "Morning, Tanjung Rhu",
    place: "Langkawi",
    year: "2025",
    priceCents: 18000,
    seed: "safelight-tanjung-rhu",
    tone: "from-[#9fb8b1] to-[#e7dcc8]",
    note: "The tide had just turned. Ten minutes later the sand was gone.",
  },
  {
    id: 2,
    title: "The last light",
    place: "Perhentian",
    year: "2024",
    priceCents: 24000,
    seed: "safelight-last-light",
    tone: "from-[#c98b63] to-[#404a54]",
    note: "A storm was coming from the mainland. The horizon held for exactly one frame.",
  },
  {
    id: 3,
    title: "Monsoon window",
    place: "Kuala Lumpur",
    year: "2025",
    priceCents: 15000,
    seed: "safelight-monsoon",
    tone: "from-[#8e9aa3] to-[#d8d2c5]",
    note: "Shot through the glass of a kopitiam while the rain made its own long exposure.",
  },
  {
    id: 4,
    title: "Salt & stone",
    place: "Pantai Cenang",
    year: "2023",
    priceCents: 21000,
    seed: "safelight-salt-stone",
    tone: "from-[#b7aa95] to-[#69746f]",
    note: "A study in textures: limestone, salt, and the last shallow inch of water.",
  },
  {
    id: 5,
    title: "Quiet after rain",
    place: "Cameron Highlands",
    year: "2024",
    priceCents: 19000,
    seed: "safelight-quiet-rain",
    tone: "from-[#788b78] to-[#d6d0bd]",
    note: "The tea slopes were still steaming. I waited for the clouds to sit down.",
  },
  {
    id: 6,
    title: "Red chair, blue hour",
    place: "George Town",
    year: "2025",
    priceCents: 16000,
    seed: "safelight-red-chair",
    tone: "from-[#7c4a43] to-[#3f4b59]",
    note: "One chair outside a closed shop. The street was doing the rest.",
  },
];

const money = (cents: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(cents / 100);

const WATERMARK_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240">
  <text x="180" y="120" fill="#ffffff" fill-opacity="0.55" font-family="Arial, sans-serif" font-size="18" letter-spacing="4" text-anchor="middle" transform="rotate(-28 180 120)">SAFELIGHT · PREVIEW</text>
</svg>`);

function DemoImage({
  photo,
  className,
  watermarked = true,
}: {
  photo: Photo;
  className?: string;
  watermarked?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {failed ? (
        <div
          className={`grid h-full w-full place-items-center bg-linear-to-br ${photo.tone}`}
        >
          <Camera className="size-8 text-white/70" aria-hidden="true" />
        </div>
      ) : (
        <img
          src={`https://picsum.photos/seed/${photo.seed}/1200/900`}
          alt={photo.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
      {watermarked && (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage: `url("data:image/svg+xml,${WATERMARK_SVG}")`,
              backgroundRepeat: "repeat",
            }}
            aria-hidden="true"
          />
          <span className="absolute right-2 bottom-2 rounded-sm bg-black/55 px-2 py-1 font-mono text-[9px] tracking-[0.16em] text-white/90 uppercase backdrop-blur-sm">
            Preview
          </span>
        </>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    pending_payment: "border-[#d9a441]/50 bg-[#d9a441]/10 text-[#8a641e]",
    paid: "border-[#4f8a68]/50 bg-[#4f8a68]/10 text-[#2f6b49]",
    cancelled: "border-[#8b8173]/50 bg-[#8b8173]/10 text-[#5f584e]",
    refunded: "border-[#8b8173]/50 bg-[#8b8173]/10 text-[#5f584e]",
  };
  const labels: Record<OrderStatus, string> = {
    pending_payment: "Pending payment",
    paid: "Paid",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] uppercase ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[status]}
    </span>
  );
}

function FlowRail({ step }: { step: number }) {
  const steps = ["Browse", "Order", "WhatsApp", "Verify", "Email", "Download"];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-[#d9d1c3] bg-[#fbf9f3] px-4 py-3 sm:px-5">
      <span className="mr-1 font-mono text-[9px] tracking-[0.16em] text-[#6e675c] uppercase">
        The flow
      </span>
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <span key={label} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[9px] tracking-[0.08em] uppercase ${
                done
                  ? "bg-[#141210] text-[#f3efe6]"
                  : active
                    ? "bg-[#c63b2f] text-white"
                    : "border border-[#d9d1c3] text-[#8b8173]"
              }`}
            >
              {done && <Check className="size-2.5" aria-hidden="true" />}
              {label}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight
                className="size-2.5 text-[#b3a99a]"
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function WhatsAppPreview({
  order,
  photo,
  onClose,
}: {
  order: Order;
  photo: Photo;
  onClose: () => void;
}) {
  const message = `Hi Safelight, I'd like to buy "${photo.title}".
Order: ${order.reference}
Price: ${money(order.priceCents)}
Please send payment instructions.`;

  return (
    <div className="mt-4 rounded-xl border border-[#d9d1c3] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#6e675c] uppercase">
          <MessageCircle className="size-3.5" aria-hidden="true" />
          WhatsApp handoff
        </span>
        <button
          type="button"
          onClick={onClose}
          className="grid size-6 place-items-center rounded-full text-[#6e675c] hover:bg-[#f3efe6]"
          aria-label="Close WhatsApp preview"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 rounded-lg rounded-tl-none bg-[#e7f6e9] p-3 text-sm leading-relaxed text-[#1f3323] whitespace-pre-line">
        {message}
      </div>
      <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[#6e675c]">
        <Copy className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
        <span>
          In the real app this opens <span className="font-mono">wa.me</span>{" "}
          with the message already filled in. The order stays{" "}
          <strong className="text-[#141210]">pending payment</strong>.
        </span>
      </div>
    </div>
  );
}

export default function SafelightDemo() {
  const [mode, setMode] = useState<Mode>("visitor");
  const [view, setView] = useState<VisitorView>("gallery");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const selected = useMemo(
    () => PHOTOS.find((photo) => photo.id === selectedId) ?? null,
    [selectedId],
  );
  const orderPhoto = useMemo(
    () => PHOTOS.find((photo) => photo.id === order?.photoId) ?? null,
    [order],
  );

  function flash(message: string) {
    setNotice(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), 3600);
  }

  function openPhoto(id: number) {
    setSelectedId(id);
    setView("detail");
    setShowWhatsApp(false);
    setSigned(false);
  }

  function startOrder(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!selected) return;
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setEmailError("A real email address, please — this is where the download link goes.");
      return;
    }
    setEmailError("");
    setOrder({
      reference: `SF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      photoId: selected.id,
      email: clean,
      priceCents: selected.priceCents,
      status: "pending_payment",
      emailStatus: "not_sent",
      claimed: false,
      downloaded: false,
    });
    setView("receipt");
    flash("Order created. Price is locked to the server's snapshot.");
  }

  function claimPayment() {
    if (!order) return;
    setOrder({ ...order, claimed: true });
    flash("Claim recorded. The order is still pending until the studio verifies it.");
  }

  function markPaid() {
    if (!order || order.status !== "pending_payment") return;
    setOrder({ ...order, status: "paid", emailStatus: "sending" });
    flash("Payment confirmed. Sending the download email…");
    window.setTimeout(() => {
      setOrder((current) =>
        current ? { ...current, emailStatus: "sent" } : current,
      );
    }, 1000);
  }

  function cancelOrder() {
    if (!order || order.status !== "pending_payment") return;
    setOrder({ ...order, status: "cancelled" });
    flash("Order cancelled. No email was sent.");
  }

  function refundOrder() {
    if (!order || order.status !== "paid") return;
    setOrder({ ...order, status: "refunded", downloaded: false });
    flash("Refunded. The download token is revoked.");
  }

  function reset() {
    window.clearTimeout(timer.current);
    setMode("visitor");
    setView("gallery");
    setSelectedId(null);
    setOrder(null);
    setEmail("");
    setEmailError("");
    setShowWhatsApp(false);
    setNotice(null);
    setSigned(false);
  }

  const flowStep = !order
    ? 0
    : order.status === "cancelled" || order.status === "refunded"
      ? 2
      : order.status === "pending_payment"
        ? order.claimed
          ? 3
          : 2
        : order.emailStatus !== "sent"
          ? 4
          : order.downloaded
            ? 6
            : 5;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[26px] border border-[#d9d1c3] bg-[#f3efe6] text-[#141210] shadow-[0_24px_60px_-30px_rgba(20,18,16,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141210] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full border border-[#c63b2f]/60 bg-[#c63b2f]/15">
            <span className="size-2.5 rounded-full bg-[#c63b2f] shadow-[0_0_12px_#c63b2f]" />
          </span>
          <div>
            <p
              className="text-lg leading-none tracking-[0.16em] text-[#f3efe6] uppercase"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Safelight
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.18em] text-[#f3efe6]/45 uppercase">
              See the preview. Own the original.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-[#f3efe6]/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] text-[#f3efe6]/55 uppercase sm:inline-flex">
            Demo · no real payments
          </span>
          <div
            className="flex rounded-full border border-[#f3efe6]/15 p-1"
            role="tablist"
            aria-label="Choose demo mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "visitor"}
              onClick={() => setMode("visitor")}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors ${
                mode === "visitor"
                  ? "bg-[#f3efe6] text-[#141210]"
                  : "text-[#f3efe6]/55 hover:text-[#f3efe6]"
              }`}
            >
              Visitor
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "studio"}
              onClick={() => setMode("studio")}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors ${
                mode === "studio"
                  ? "bg-[#c63b2f] text-white"
                  : "text-[#f3efe6]/55 hover:text-[#f3efe6]"
              }`}
            >
              Studio
            </button>
          </div>
        </div>
      </div>

      {mode === "visitor" ? (
        <div>
          {view === "gallery" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.18em] text-[#8b8173] uppercase">
                    The public door · watermarked previews
                  </p>
                  <h3
                    className="mt-1 text-2xl leading-tight sm:text-3xl"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    Six photographs. Six originals in the vault.
                  </h3>
                </div>
                <p className="max-w-xs text-xs leading-relaxed text-[#6e675c]">
                  Every image here is a preview. The full-quality file is never in
                  this page&apos;s HTML.
                </p>
              </div>

              {order && orderPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setView("receipt");
                    setSelectedId(order.photoId);
                  }}
                  className="mt-4 flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-[#c63b2f]/30 bg-[#c63b2f]/5 px-4 py-3 text-left transition-colors hover:bg-[#c63b2f]/10"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-[#c63b2f]" aria-hidden="true" />
                    <span>
                      You have an order:{" "}
                      <span className="font-mono text-xs">{order.reference}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] text-[#c63b2f] uppercase">
                    View receipt <ArrowRight className="size-3" aria-hidden="true" />
                  </span>
                </button>
              )}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PHOTOS.map((photo, index) => (
                  <button
                    type="button"
                    key={photo.id}
                    onClick={() => openPhoto(photo.id)}
                    className="group overflow-hidden rounded-xl border border-[#d9d1c3] bg-[#fbf9f3] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c63b2f]/40 hover:shadow-[0_14px_30px_-22px_rgba(20,18,16,0.6)]"
                  >
                    <div className="relative">
                      <DemoImage
                        photo={photo}
                        className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <span className="absolute top-2 left-2 rounded-sm bg-[#141210]/65 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-[#f3efe6]">
                        PLATE {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className="text-base leading-tight"
                            style={{
                              fontFamily: 'Georgia, "Times New Roman", serif',
                            }}
                          >
                            {photo.title}
                          </p>
                          <p className="mt-1 font-mono text-[9px] tracking-[0.1em] text-[#8b8173] uppercase">
                            {photo.place} · {photo.year}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-[#c63b2f]">
                          {money(photo.priceCents)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "detail" && selected && (
            <div className="p-4 sm:p-6">
              <button
                type="button"
                onClick={() => {
                  setView("gallery");
                  setShowWhatsApp(false);
                }}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[#6e675c] uppercase hover:text-[#141210]"
              >
                <ArrowLeft className="size-3" aria-hidden="true" />
                Back to the gallery
              </button>

              <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <DemoImage
                    photo={selected}
                    className="aspect-[4/3] rounded-xl border border-[#d9d1c3]"
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] tracking-[0.12em] text-[#8b8173] uppercase">
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-3" aria-hidden="true" />
                      Watermarked preview · no original URL
                    </span>
                    <span>© Safelight</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="font-mono text-[9px] tracking-[0.18em] text-[#c63b2f] uppercase">
                    Photograph
                  </p>
                  <h3
                    className="mt-1 text-3xl leading-[1.05]"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {selected.title}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-[#8b8173] uppercase">
                    {selected.place} · {selected.year}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#5f584e]">
                    {selected.note}
                  </p>

                  <div className="mt-5 border-y border-[#d9d1c3] py-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.16em] text-[#8b8173] uppercase">
                          Price · personal licence
                        </p>
                        <p className="mt-1 font-mono text-2xl text-[#141210]">
                          {money(selected.priceCents)}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#4f8a68]/40 bg-[#4f8a68]/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-[#2f6b49] uppercase">
                        Original included
                      </span>
                    </div>
                  </div>

                  {order ? (
                    <div className="mt-5 rounded-xl border border-[#d9a441]/40 bg-[#d9a441]/10 p-4">
                      <p className="text-sm font-bold text-[#141210]">
                        You already have an order in this demo.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#6e675c]">
                        One order is enough to show the full flow. Reset the demo
                        below to start again.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(order.photoId);
                          setView("receipt");
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#141210] px-3.5 py-2 font-mono text-[10px] tracking-[0.08em] text-[#f3efe6] uppercase"
                      >
                        View order <ArrowRight className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={startOrder} className="mt-5">
                      <label
                        htmlFor="safelight-email"
                        className="font-mono text-[9px] tracking-[0.16em] text-[#6e675c] uppercase"
                      >
                        Your email · no account needed
                      </label>
                      <input
                        id="safelight-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="mt-2 w-full rounded-lg border border-[#d9d1c3] bg-[#fbf9f3] px-3 py-2.5 text-sm text-[#141210] outline-none transition-colors placeholder:text-[#b3a99a] focus:border-[#c63b2f]"
                      />
                      {emailError && (
                        <p className="mt-1.5 text-xs text-[#a32e24]">{emailError}</p>
                      )}
                      <button
                        type="submit"
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c63b2f] px-4 py-3 font-mono text-[10px] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-[#a32e24]"
                      >
                        Buy this photograph
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </button>
                      <p className="mt-2 text-center font-mono text-[9px] tracking-[0.06em] text-[#8b8173]">
                        Price comes from the database. The browser never sends an
                        amount.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "receipt" && order && orderPhoto && (
            <div className="p-4 sm:p-6">
              <div className="mx-auto max-w-xl">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(order.photoId);
                      setView("detail");
                    }}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[#6e675c] uppercase hover:text-[#141210]"
                  >
                    <ArrowLeft className="size-3" aria-hidden="true" />
                    Back to the photograph
                  </button>
                  <span className="font-mono text-[9px] tracking-[0.12em] text-[#8b8173] uppercase">
                    Order receipt
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-[#d9d1c3] bg-[#fbf9f3]">
                  <div className="border-b border-dashed border-[#d9d1c3] px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.18em] text-[#8b8173] uppercase">
                          Safelight · order
                        </p>
                        <p className="mt-1 font-mono text-lg tracking-[0.08em] text-[#141210]">
                          {order.reference}
                        </p>
                      </div>
                      <StatusPill status={order.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-[84px_1fr] gap-3 px-5 py-4">
                    <DemoImage
                      photo={orderPhoto}
                      className="aspect-square rounded-lg border border-[#d9d1c3]"
                    />
                    <div>
                      <p
                        className="text-lg leading-tight"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                      >
                        {orderPhoto.title}
                      </p>
                      <p className="mt-1 font-mono text-[9px] tracking-[0.1em] text-[#8b8173] uppercase">
                        {orderPhoto.place} · {orderPhoto.year}
                      </p>
                      <p className="mt-2 font-mono text-sm text-[#141210]">
                        {money(order.priceCents)}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8b8173]">
                        {order.email}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-[#d9d1c3] px-5 py-4">
                    {order.status === "pending_payment" && (
                      <>
                        <p className="text-sm leading-relaxed text-[#5f584e]">
                          {order.claimed
                            ? "The studio has your payment claim. It will verify the payment before confirming anything."
                            : "Message the studio on WhatsApp to arrange payment. Your order stays pending until the studio verifies it."}
                        </p>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => setShowWhatsApp((open) => !open)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#c63b2f] px-4 py-3 font-mono text-[10px] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-[#a32e24]"
                          >
                            <MessageCircle className="size-3.5" aria-hidden="true" />
                            Continue on WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={claimPayment}
                            disabled={order.claimed}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#d9d1c3] bg-white px-4 py-3 font-mono text-[10px] font-bold tracking-[0.1em] text-[#141210] uppercase transition-colors hover:border-[#c63b2f]/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            {order.claimed ? "Payment claimed" : "I've paid"}
                          </button>
                        </div>

                        {showWhatsApp && (
                          <WhatsAppPreview
                            order={order}
                            photo={orderPhoto}
                            onClose={() => setShowWhatsApp(false)}
                          />
                        )}

                        {order.claimed && (
                          <p className="mt-3 rounded-lg border border-[#d9a441]/40 bg-[#d9a441]/10 px-3 py-2 text-xs leading-relaxed text-[#8a641e]">
                            <strong>Claim ≠ confirmation.</strong> Only the studio
                            can move this order to paid.
                          </p>
                        )}
                      </>
                    )}

                    {order.status === "paid" && (
                      <>
                        <div className="flex items-start gap-2.5">
                          <ShieldCheck
                            className="mt-0.5 size-4 shrink-0 text-[#2f6b49]"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="text-sm font-bold text-[#141210]">
                              Payment confirmed. The original is unlocked.
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-[#6e675c]">
                              {order.emailStatus === "sending"
                                ? "Sending the download email now…"
                                : `A download link was sent to ${order.email}. The email link is a ticket back to this app, not the file itself.`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setView("download");
                            setSigned(false);
                          }}
                          disabled={order.emailStatus !== "sent"}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#141210] px-4 py-3 font-mono text-[10px] font-bold tracking-[0.1em] text-[#f3efe6] uppercase transition-colors hover:bg-[#2b2621] disabled:cursor-wait disabled:opacity-50"
                        >
                          <Mail className="size-3.5" aria-hidden="true" />
                          Open the download page
                        </button>
                      </>
                    )}

                    {(order.status === "cancelled" ||
                      order.status === "refunded") && (
                      <div className="flex items-start gap-2.5">
                        <Lock
                          className="mt-0.5 size-4 shrink-0 text-[#8b8173]"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-bold text-[#141210]">
                            This order is {order.status}.
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#6e675c]">
                            Downloads are closed. A refund cannot take back a file
                            that was already downloaded — it can only stop future
                            ones.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-center font-mono text-[9px] tracking-[0.06em] text-[#8b8173]">
                  The studio sees this order in the Studio tab.
                </p>
              </div>
            </div>
          )}

          {view === "download" && order && orderPhoto && (
            <div className="p-4 sm:p-6">
              <div className="mx-auto max-w-md text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full border border-[#4f8a68]/40 bg-[#4f8a68]/10">
                  <Download className="size-5 text-[#2f6b49]" aria-hidden="true" />
                </span>
                <p className="mt-4 font-mono text-[9px] tracking-[0.18em] text-[#8b8173] uppercase">
                  App-controlled download page
                </p>
                <h3
                  className="mt-1 text-2xl leading-tight"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {orderPhoto.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#6e675c]">
                  The token was checked, the order is paid, and the link has not
                  expired. The app can now issue a fresh signed URL.
                </p>

                <div className="mt-5 rounded-xl border border-[#d9d1c3] bg-[#fbf9f3] p-4 text-left">
                  <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-[#8b8173] uppercase">
                    <FileImage className="size-3.5" aria-hidden="true" />
                    Original file
                  </div>
                  <p className="mt-2 truncate font-mono text-xs text-[#141210]">
                    safelight-{orderPhoto.seed}-original.jpg
                  </p>
                  <p className="mt-1 text-[10px] text-[#8b8173]">
                    Full quality · unwatermarked · private bucket
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSigned(true);
                    setOrder({ ...order, downloaded: true });
                    flash("Signed URL issued for 5 minutes. This is the last mile.");
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c63b2f] px-4 py-3 font-mono text-[10px] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-[#a32e24]"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  Download original
                </button>

                {signed && (
                  <div className="mt-3 rounded-lg border border-[#4f8a68]/40 bg-[#4f8a68]/10 px-3 py-2 text-left text-xs leading-relaxed text-[#2f6b49]">
                    <strong>Signed URL issued.</strong> It expires in 5 minutes.
                    The permanent link in the email still points at this app, so
                    the customer can come back later for a fresh one.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setView("receipt")}
                  className="mt-4 font-mono text-[9px] tracking-[0.1em] text-[#6e675c] uppercase hover:text-[#141210]"
                >
                  Back to the receipt
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1a1714] p-4 text-[#f3efe6] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] text-[#c63b2f] uppercase">
                The back room · admin only
              </p>
              <h3
                className="mt-1 text-2xl leading-tight sm:text-3xl"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                The ledger
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f3efe6]/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] text-[#f3efe6]/55 uppercase">
              <Lock className="size-3" aria-hidden="true" />
              Signed in as studio@safelight.my
            </span>
          </div>

          {!order ? (
            <div className="mt-6 rounded-xl border border-dashed border-[#f3efe6]/20 px-5 py-10 text-center">
              <p className="text-sm font-bold text-[#f3efe6]">No orders yet.</p>
              <p className="mt-1 text-xs leading-relaxed text-[#f3efe6]/50">
                Go to Visitor mode, open a photograph, and buy it. The order will
                appear here with the customer&apos;s email and the price snapshot.
              </p>
              <button
                type="button"
                onClick={() => setMode("visitor")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#f3efe6] px-3.5 py-2 font-mono text-[10px] tracking-[0.08em] text-[#141210] uppercase"
              >
                Open the shop <ArrowRight className="size-3" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-xl border border-[#f3efe6]/15">
                <div className="flex items-center justify-between gap-3 border-b border-[#f3efe6]/10 px-4 py-3">
                  <span className="font-mono text-[9px] tracking-[0.16em] text-[#f3efe6]/45 uppercase">
                    Orders · all
                  </span>
                  <span className="font-mono text-[9px] text-[#f3efe6]/45">
                    1 order
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("visitor");
                    setSelectedId(order.photoId);
                    setView("receipt");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[#f3efe6]/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs tracking-[0.08em] text-[#f3efe6]">
                        {order.reference}
                      </span>
                      <StatusPill status={order.status} />
                      {order.claimed && order.status === "pending_payment" && (
                        <span className="rounded-full border border-[#c63b2f]/40 bg-[#c63b2f]/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.08em] text-[#e37a70] uppercase">
                          Claimed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-[#f3efe6]/80">
                      {orderPhoto?.title}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-[#f3efe6]/40">
                      {order.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-xs text-[#f3efe6]">
                      {money(order.priceCents)}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-[#f3efe6]/35">
                      {order.emailStatus === "sent"
                        ? "email sent"
                        : order.emailStatus === "sending"
                          ? "sending…"
                          : "email not sent"}
                    </p>
                  </div>
                </button>
              </div>

              <div className="rounded-xl border border-[#f3efe6]/15 p-4">
                <p className="font-mono text-[9px] tracking-[0.16em] text-[#f3efe6]/45 uppercase">
                  Actions
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#f3efe6]/60">
                  The studio verifies the actual payment, then confirms it. The
                  customer&apos;s claim is only a hint.
                </p>

                <div className="mt-4 space-y-2">
                  {order.status === "pending_payment" && (
                    <>
                      <button
                        type="button"
                        onClick={markPaid}
                        disabled={order.emailStatus === "sending"}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c63b2f] px-3 py-2.5 font-mono text-[10px] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#a32e24] disabled:cursor-wait disabled:opacity-60"
                      >
                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                        Mark paid & send email
                      </button>
                      <button
                        type="button"
                        onClick={cancelOrder}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#f3efe6]/15 px-3 py-2.5 font-mono text-[10px] tracking-[0.08em] text-[#f3efe6]/70 uppercase transition-colors hover:border-[#f3efe6]/30 hover:text-[#f3efe6]"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                        Cancel order
                      </button>
                    </>
                  )}

                  {order.status === "paid" && (
                    <>
                      <div className="rounded-lg border border-[#4f8a68]/30 bg-[#4f8a68]/10 px-3 py-2.5 text-xs leading-relaxed text-[#9ed0b1]">
                        <strong>Paid.</strong> Email status:{" "}
                        {order.emailStatus === "sent"
                          ? "sent"
                          : order.emailStatus === "sending"
                            ? "sending…"
                            : "not sent"}
                        .
                      </div>
                      <button
                        type="button"
                        onClick={refundOrder}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#f3efe6]/15 px-3 py-2.5 font-mono text-[10px] tracking-[0.08em] text-[#f3efe6]/70 uppercase transition-colors hover:border-[#c63b2f]/50 hover:text-[#e37a70]"
                      >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Refund & revoke link
                      </button>
                    </>
                  )}

                  {(order.status === "cancelled" ||
                    order.status === "refunded") && (
                    <div className="rounded-lg border border-[#f3efe6]/15 px-3 py-2.5 text-xs leading-relaxed text-[#f3efe6]/55">
                      This order is {order.status}. No further action is available
                      in the demo.
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-[#f3efe6]/10 pt-3">
                  <p className="font-mono text-[9px] tracking-[0.12em] text-[#f3efe6]/35 uppercase">
                    What the customer sees
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("visitor");
                      setSelectedId(order.photoId);
                      setView("receipt");
                    }}
                    className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[#f3efe6]/70 uppercase hover:text-[#f3efe6]"
                  >
                    Open the receipt <ArrowRight className="size-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <FlowRail step={flowStep} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d9d1c3] bg-[#f3efe6] px-4 py-3 sm:px-5">
        <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.08em] text-[#8b8173]">
          <KeyRound className="size-3" aria-hidden="true" />
          Demo state only · refresh or reset to start over
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.08em] text-[#6e675c] uppercase hover:text-[#c63b2f]"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Reset
        </button>
      </div>

      {notice && (
        <div
          className="border-t border-[#d9d1c3] bg-[#141210] px-4 py-2.5 text-center font-mono text-[10px] tracking-[0.04em] text-[#f3efe6]/80 sm:px-5"
          aria-live="polite"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
