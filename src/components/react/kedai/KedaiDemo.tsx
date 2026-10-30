import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Link2,
  Lock,
  Mail,
  MessageCircle,
  Package,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Store,
  Tag,
  Truck,
  X,
} from "lucide-react";

type Mode = "shop" | "back";
type ShopView = "shelf" | "item" | "receipt";
type BackTab = "items" | "reservations";
type ItemStatus = "available" | "reserved" | "sold";
type ReservationStatus = "pending" | "confirmed" | "cancelled" | "expired";
type EmailStatus = "not_sent" | "sending" | "sent" | "failed";

interface Item {
  id: number;
  slug: string;
  title: string;
  category: string;
  condition: string;
  priceCents: number;
  photo: string;
  alt: string;
  note: string;
  status: ItemStatus;
}

interface Reservation {
  reference: string;
  itemId: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  note: string;
  fulfilment: "pickup" | "post";
  priceCents: number;
  status: ReservationStatus;
  claimed: boolean;
  emailStatus: EmailStatus;
  expiresInHours: number;
}

const SEED_ITEMS: Item[] = [
  {
    id: 1,
    slug: "oak-stool",
    title: "Oak stool",
    category: "Furniture",
    condition: "Like new",
    priceCents: 18000,
    photo: "/demo/kedai/chair.jpg",
    alt: "A pale oak stool against a soft blue background",
    note: "Bought for a home office that never happened. Solid oak, one small water mark on the seat, otherwise clean. 45cm tall.",
    status: "available",
  },
  {
    id: 2,
    slug: "film-camera",
    title: "Film camera kit",
    category: "Cameras",
    condition: "Well loved",
    priceCents: 68000,
    photo: "/demo/kedai/camera.jpg",
    alt: "A black film camera and three lenses on a dark table",
    note: "The camera that started the whole photography habit. Body, 40mm lens, and two extra lenses. Shutter tested last month.",
    status: "available",
  },
  {
    id: 3,
    slug: "workshop-lamp",
    title: "Workshop lamp",
    category: "Lighting",
    condition: "Good",
    priceCents: 9500,
    photo: "/demo/kedai/lamp.jpg",
    alt: "A dark grey metal workshop floor lamp against a white wall",
    note: "Heavy, adjustable, and impossible to knock over. The paint has a few chips near the base. Bulb included.",
    status: "available",
  },
  {
    id: 4,
    slug: "business-books",
    title: "Box of business books",
    category: "Books",
    condition: "Good",
    priceCents: 12000,
    photo: "/demo/kedai/books.jpg",
    alt: "A stack of business and startup books",
    note: "Eight books from a shelf clear-out. A few have pencil notes in the margins. The stack in the photo is the whole box.",
    status: "available",
  },
  {
    id: 5,
    slug: "stoneware-cup",
    title: "Stoneware coffee cup",
    category: "Kitchen",
    condition: "Like new",
    priceCents: 3500,
    photo: "/demo/kedai/cup.jpg",
    alt: "A white stoneware cup of black coffee on a wooden table",
    note: "A generous 300ml cup with a thick lip. Dishwasher safe. Selling because I bought four and only use one.",
    status: "available",
  },
  {
    id: 6,
    slug: "city-bike",
    title: "City bike",
    category: "Outdoors",
    condition: "Good",
    priceCents: 85000,
    photo: "/demo/kedai/bike.jpg",
    alt: "A white single-speed city bike against a dark wall",
    note: "Light, simple, and serviced in August. New brake pads and chain. Pickup only — it is a big thing to post.",
    status: "available",
  },
];

function money(cents: number): string {
  return `RM ${(cents / 100).toLocaleString("en-MY", {
    maximumFractionDigits: 0,
  })}`;
}

function randomReference(): string {
  return `KD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 1)}***@${domain}`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function ItemStatusPill({ status }: { status: ItemStatus }) {
  const map: Record<ItemStatus, string> = {
    available: "border-[#2f6b4f]/35 bg-[#e6efe8] text-[#24543d]",
    reserved: "border-[#b7791f]/40 bg-[#f6edda] text-[#8a5a12]",
    sold: "border-[#d94a2b]/40 bg-[#f9e3dd] text-[#a83a21]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.08em] uppercase ${map[status]}`}
    >
      {status === "available" ? (
        <Check className="size-2.5" aria-hidden="true" />
      ) : status === "reserved" ? (
        <Clock className="size-2.5" aria-hidden="true" />
      ) : (
        <Tag className="size-2.5" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}

function ReservationStatusPill({ status }: { status: ReservationStatus }) {
  const map: Record<ReservationStatus, string> = {
    pending: "border-[#b7791f]/40 bg-[#f6edda] text-[#8a5a12]",
    confirmed: "border-[#2f6b4f]/35 bg-[#e6efe8] text-[#24543d]",
    cancelled: "border-[#c9bca8] bg-[#f1e9d8] text-[#5f5142]",
    expired: "border-[#c9bca8] bg-[#f1e9d8] text-[#5f5142]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[8px] font-bold tracking-[0.08em] uppercase ${map[status]}`}
    >
      {status === "confirmed" ? (
        <CheckCircle2 className="size-2.5" aria-hidden="true" />
      ) : status === "pending" ? (
        <Clock className="size-2.5" aria-hidden="true" />
      ) : (
        <X className="size-2.5" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}

function EmailStatusPill({
  status,
  dark = false,
}: {
  status: EmailStatus;
  dark?: boolean;
}) {
  const label =
    status === "not_sent"
      ? "not sent"
      : status === "sending"
        ? "sending"
        : status === "sent"
          ? "sent"
          : "failed";
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.06em] uppercase ${
        dark ? "text-[#f6f0e2]/65" : "text-[#5f5142]"
      }`}
    >
      {status === "sent" ? (
        <CheckCircle2
          className={`size-3 ${dark ? "text-[#8fbfa5]" : "text-[#2f6b4f]"}`}
          aria-hidden="true"
        />
      ) : status === "failed" ? (
        <AlertTriangle
          className="size-3 text-[#d94a2b]"
          aria-hidden="true"
        />
      ) : status === "sending" ? (
        <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
      ) : (
        <Mail className="size-3" aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

function WhatsAppPreview({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-[#d8cbb4] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#5f5142] uppercase">
          <MessageCircle className="size-3.5" aria-hidden="true" />
          WhatsApp handoff
        </span>
        <button
          type="button"
          onClick={onClose}
          className="grid size-6 place-items-center rounded-full text-[#5f5142] hover:bg-[#f1e9d8]"
          aria-label="Close WhatsApp preview"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 rounded-lg rounded-tl-none bg-[#e7f6e9] p-3 text-sm leading-relaxed whitespace-pre-line text-[#1f3323]">
        {message}
      </div>
      <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[#5f5142]">
        <Copy className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
        <span>
          In the real app this opens <span className="font-mono">wa.me</span>{" "}
          with the message filled in. The reservation is still{" "}
          <strong className="text-[#2b1d14]">pending</strong>.
        </span>
      </div>
    </div>
  );
}

export default function KedaiDemo() {
  const [mode, setMode] = useState<Mode>("shop");
  const [view, setView] = useState<ShopView>("shelf");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>(SEED_ITEMS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [backTab, setBackTab] = useState<BackTab>("reservations");
  const [notice, setNotice] = useState<string | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [raceLost, setRaceLost] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    note: "",
    fulfilment: "pickup" as "pickup" | "post",
  });
  const flashTimer = useRef<number | undefined>(undefined);
  const emailTimers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      window.clearTimeout(flashTimer.current);
      emailTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const active = useMemo(
    () => reservations.find((reservation) => reservation.reference === activeRef) ?? null,
    [reservations, activeRef],
  );
  const activeItem = useMemo(
    () => items.find((item) => item.id === active?.itemId) ?? null,
    [items, active],
  );

  const available = items.filter((item) => item.status === "available").length;
  const reserved = items.filter((item) => item.status === "reserved").length;
  const sold = items.filter((item) => item.status === "sold").length;
  const pending = reservations.filter(
    (reservation) => reservation.status === "pending",
  ).length;

  function flash(message: string) {
    setNotice(message);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setNotice(null), 4200);
  }

  function openItem(id: number) {
    setSelectedId(id);
    setView("item");
    setShowWhatsApp(false);
    setRaceLost(false);
    setFormError("");
  }

  function openReceipt(reference: string) {
    setActiveRef(reference);
    setMode("shop");
    setView("receipt");
    setShowWhatsApp(false);
  }

  function reserve(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!selected || selected.status !== "available") return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name) {
      setFormError("A name, please — the shop needs to know who is collecting.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("A real email address, please — the receipt goes there.");
      return;
    }

    const reference = randomReference();
    const reservation: Reservation = {
      reference,
      itemId: selected.id,
      buyerName: name,
      buyerEmail: email,
      buyerPhone: form.phone.trim(),
      note: form.note.trim(),
      fulfilment: form.fulfilment,
      priceCents: selected.priceCents,
      status: "pending",
      claimed: false,
      emailStatus: "sending",
      expiresInHours: 24,
    };

    setReservations((current) => [...current, reservation]);
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id ? { ...item, status: "reserved" } : item,
      ),
    );
    setActiveRef(reference);
    setView("receipt");
    setShowWhatsApp(false);
    setFormError("");
    flash("Reserved for 24 hours. The price is locked to the item.");

    const timer = window.setTimeout(() => {
      setReservations((current) =>
        current.map((entry) =>
          entry.reference === reference
            ? { ...entry, emailStatus: "sent" }
            : entry,
        ),
      );
    }, 900);
    emailTimers.current.push(timer);
  }

  function simulateRace() {
    if (!selected || selected.status !== "available") return;
    const reference = randomReference();
    const rival: Reservation = {
      reference,
      itemId: selected.id,
      buyerName: "Another buyer",
      buyerEmail: "another@example.com",
      buyerPhone: "",
      note: "Clicked first in the demo.",
      fulfilment: "pickup",
      priceCents: selected.priceCents,
      status: "pending",
      claimed: false,
      emailStatus: "sent",
      expiresInHours: 24,
    };
    setReservations((current) => [...current, rival]);
    setItems((current) =>
      current.map((item) =>
        item.id === selected.id ? { ...item, status: "reserved" } : item,
      ),
    );
    setRaceLost(true);
    flash("Another buyer got there first. The item is reserved.");
  }

  function claimPaid() {
    if (!active || active.status !== "pending") return;
    setReservations((current) =>
      current.map((entry) =>
        entry.reference === active.reference
          ? { ...entry, claimed: true }
          : entry,
      ),
    );
    flash("Claim recorded. The shop still has to confirm the payment.");
  }

  function confirmSale(reference: string) {
    const reservation = reservations.find((entry) => entry.reference === reference);
    if (!reservation || reservation.status !== "pending") return;
    setReservations((current) =>
      current.map((entry) =>
        entry.reference === reference
          ? { ...entry, status: "confirmed" }
          : entry,
      ),
    );
    setItems((current) =>
      current.map((item) =>
        item.id === reservation.itemId ? { ...item, status: "sold" } : item,
      ),
    );
    flash("Sale confirmed. The item is sold. The receipt is live.");
  }

  function cancelReservation(reference: string) {
    const reservation = reservations.find((entry) => entry.reference === reference);
    if (!reservation || reservation.status !== "pending") return;
    setReservations((current) =>
      current.map((entry) =>
        entry.reference === reference
          ? { ...entry, status: "cancelled" }
          : entry,
      ),
    );
    setItems((current) =>
      current.map((item) =>
        item.id === reservation.itemId
          ? { ...item, status: "available" }
          : item,
      ),
    );
    flash("Reservation cancelled. The item is back on the shelf.");
  }

  function extendReservation(reference: string) {
    const reservation = reservations.find((entry) => entry.reference === reference);
    if (!reservation || reservation.status !== "pending") return;
    setReservations((current) =>
      current.map((entry) =>
        entry.reference === reference
          ? { ...entry, expiresInHours: entry.expiresInHours + 24 }
          : entry,
      ),
    );
    flash("Reservation extended by 24 hours. Time is a state, not a note.");
  }

  function simulateExpiry() {
    const reservation = reservations.find((entry) => entry.status === "pending");
    if (!reservation) {
      flash("No pending reservation to expire.");
      return;
    }
    setReservations((current) =>
      current.map((entry) =>
        entry.reference === reservation.reference
          ? { ...entry, status: "expired" }
          : entry,
      ),
    );
    setItems((current) =>
      current.map((item) =>
        item.id === reservation.itemId
          ? { ...item, status: "available" }
          : item,
      ),
    );
    flash("24 hours passed. The reservation expired and the item is available again.");
  }

  function reset() {
    window.clearTimeout(flashTimer.current);
    emailTimers.current.forEach((timer) => window.clearTimeout(timer));
    emailTimers.current = [];
    setMode("shop");
    setView("shelf");
    setSelectedId(null);
    setActiveRef(null);
    setItems(SEED_ITEMS);
    setReservations([]);
    setBackTab("reservations");
    setNotice(null);
    setShowWhatsApp(false);
    setRaceLost(false);
    setFormError("");
    setForm({ name: "", email: "", phone: "", note: "", fulfilment: "pickup" });
  }

  function copyText(text: string, message: string) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    flash(message);
  }

  const activeMessage = active && activeItem
    ? `Hi Kedai, I'd like to collect "${activeItem.title}".

Reference: ${active.reference}
Price: ${money(active.priceCents)}
Handover: ${active.fulfilment === "pickup" ? "Pickup" : "Post"}

I've reserved it for 24 hours.`
    : "";

  return (
    <div
      id="kedai-demo"
      className="not-prose my-8 scroll-mt-24 overflow-hidden rounded-[26px] border border-[#d8cbb4] bg-[#f6f0e2] text-[#2b1d14] shadow-[0_24px_60px_-30px_rgba(43,29,20,0.45)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#2b1d14] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-[#f2b441]/45 bg-[#f2b441]/15">
            <Store className="size-4 text-[#f2b441]" aria-hidden="true" />
          </span>
          <div>
            <p
              className="text-xl leading-none tracking-[0.18em] text-[#f6f0e2] uppercase"
              style={{
                fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
              }}
            >
              Kedai
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.16em] text-[#f6f0e2]/60 uppercase">
              One seller. One-of-one things.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-[#f6f0e2]/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] text-[#f6f0e2]/65 uppercase sm:inline-flex">
            Demo · no real payments
          </span>
          <div
            className="flex rounded-full border border-[#f6f0e2]/15 p-1"
            role="tablist"
            aria-label="Choose demo mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "shop"}
              onClick={() => setMode("shop")}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors ${
                mode === "shop"
                  ? "bg-[#f6f0e2] text-[#2b1d14]"
                  : "text-[#f6f0e2]/65 hover:text-[#f6f0e2]"
              }`}
            >
              Shop
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "back"}
              onClick={() => setMode("back")}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors ${
                mode === "back"
                  ? "bg-[#b83a1f] text-white"
                  : "text-[#f6f0e2]/65 hover:text-[#f6f0e2]"
              }`}
            >
              Back room
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="flex items-start gap-2 border-b border-[#d8cbb4] bg-[#f2b441]/20 px-4 py-2.5 text-xs font-bold text-[#6e4b12] sm:px-5">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {mode === "shop" ? (
        <div>
          {view === "shelf" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.18em] text-[#6f5e4b] uppercase">
                    The public shelf · one of each
                  </p>
                  <h3
                    className="mt-1 text-2xl leading-tight sm:text-3xl"
                    style={{
                      fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
                    }}
                  >
                    Things looking for a second life.
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed font-bold text-[#5f5142]">
                    Reserve one for 24 hours. Pay and collect on WhatsApp. When
                    it&apos;s gone, it&apos;s gone.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "https://kedai.example/shop",
                        "Shop link copied (demo). In the real app this is the seller's public URL.",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#d8cbb4] bg-white px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] text-[#6e5e4c] uppercase transition-colors hover:border-[#d94a2b]/40 hover:text-[#d94a2b]"
                  >
                    <Link2 className="size-3" aria-hidden="true" />
                    Copy shop link
                  </button>
                  <span className="rounded-full bg-[#2b1d14] px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] text-[#f6f0e2] uppercase">
                    {items.length} items
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item.id)}
                    className="group overflow-hidden rounded-xl border border-[#d8cbb4] bg-[#fbf7ec] text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[#b9a88e] hover:shadow-[0_16px_30px_-22px_rgba(43,29,20,0.45)]"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-[#e8decb]">
                      <img
                        src={item.photo}
                        alt={item.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading={index < 2 ? "eager" : "lazy"}
                      />
                      <span className="absolute top-2 left-2">
                        <ItemStatusPill status={item.status} />
                      </span>
                      <span className="absolute bottom-2 left-2 rounded bg-[#2b1d14]/75 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.08em] text-[#f6f0e2] uppercase">
                        {item.category}
                      </span>
                      {item.status === "sold" && (
                        <span className="absolute top-2 right-2 -rotate-6 border-2 border-[#d94a2b] bg-[#f6f0e2]/85 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.12em] text-[#d94a2b] uppercase">
                          Sold
                        </span>
                      )}
                    </span>
                    <span className="block p-3">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm leading-snug font-bold">
                          {item.title}
                        </span>
                        <span className="shrink-0 font-mono text-sm font-bold">
                          {money(item.priceCents)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] font-bold text-[#6f5e4b]">
                        {item.condition} · one only
                      </span>
                      <span className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[8px] tracking-[0.08em] text-[#a83a21] uppercase">
                          {item.status === "available"
                            ? "Ready to reserve"
                            : item.status === "reserved"
                              ? "On hold"
                              : "Found a home"}
                        </span>
                        <ArrowRight
                          className="size-3.5 text-[#6f5e4b] transition-transform duration-150 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#f1e9d8] px-3 py-2.5 text-[11px] leading-relaxed font-bold text-[#5f5142]">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  A personal shop, not a multi-vendor marketplace. One seller,
                  one shelf, one of each. No accounts, no cart, no online
                  payment.
                </span>
              </div>
            </div>
          )}

          {view === "item" && selected && (
            <div className="p-4 sm:p-6">
              <button
                type="button"
                onClick={() => setView("shelf")}
                className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.08em] text-[#5f5142] uppercase transition-colors hover:text-[#d94a2b]"
              >
                <ArrowLeft className="size-3" aria-hidden="true" />
                Back to the shelf
              </button>

              <div className="mt-3 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <div className="overflow-hidden rounded-xl border border-[#d8cbb4] bg-[#e8decb]">
                    <img
                      src={selected.photo}
                      alt={selected.alt}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ItemStatusPill status={selected.status} />
                    <span className="rounded-full border border-[#d8cbb4] bg-white px-2.5 py-1 font-mono text-[8px] tracking-[0.08em] text-[#6e5e4c] uppercase">
                      {selected.condition}
                    </span>
                    <span className="rounded-full border border-[#d8cbb4] bg-white px-2.5 py-1 font-mono text-[8px] tracking-[0.08em] text-[#6e5e4c] uppercase">
                      {selected.category}
                    </span>
                  </div>
                  <div className="mt-3 rounded-xl border border-[#d8cbb4] bg-[#fbf7ec] p-3">
                    <p className="font-mono text-[8px] tracking-[0.1em] text-[#6f5e4b] uppercase">
                      One photo, one item
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed font-bold text-[#5f5142]">
                      No stock count. No variants. Ask on WhatsApp if you need
                      another angle before you reserve.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[9px] tracking-[0.18em] text-[#6f5e4b] uppercase">
                    Item KD-{String(selected.id).padStart(2, "0")} · one only
                  </p>
                  <h3
                    className="mt-1 text-2xl leading-tight sm:text-3xl"
                    style={{
                      fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
                    }}
                  >
                    {selected.title}
                  </h3>
                  <p className="mt-1 font-mono text-lg font-bold">
                    {money(selected.priceCents)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed font-bold text-[#6e5e4c]">
                    {selected.note}
                  </p>

                  <div className="mt-4 rounded-xl border border-[#d8cbb4] bg-[#fbf7ec] p-3">
                    <p className="font-mono text-[9px] tracking-[0.14em] text-[#6f5e4b] uppercase">
                      The seller
                    </p>
                    <p className="mt-1 text-sm font-bold">Kedai · Aina</p>
                    <p className="mt-1 text-[11px] leading-relaxed font-bold text-[#5f5142]">
                      Pickup in Petaling Jaya. Postage can be arranged on
                      WhatsApp. Every item is one of one.
                    </p>
                  </div>

                  {selected.status === "available" && !raceLost ? (
                    <form
                      onSubmit={reserve}
                      className="mt-4 rounded-xl border border-[#d8cbb4] bg-[#fbf7ec] p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-[9px] tracking-[0.14em] text-[#a83a21] uppercase">
                          Reserve for 24 hours
                        </p>
                        <span className="inline-flex items-center gap-1 font-mono text-[8px] tracking-[0.06em] text-[#5f5142] uppercase">
                          <Lock className="size-2.5" aria-hidden="true" />
                          No payment now
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block font-mono text-[8px] tracking-[0.08em] text-[#5f5142] uppercase">
                            Your name
                          </span>
                          <input
                            value={form.name}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            placeholder="Aina"
                            className="w-full rounded-lg border border-[#d8cbb4] bg-white px-3 py-2 text-sm outline-none focus:border-[#d94a2b]"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block font-mono text-[8px] tracking-[0.08em] text-[#5f5142] uppercase">
                            Email for the receipt
                          </span>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                email: event.target.value,
                              }))
                            }
                            placeholder="you@example.com"
                            className="w-full rounded-lg border border-[#d8cbb4] bg-white px-3 py-2 text-sm outline-none focus:border-[#d94a2b]"
                          />
                        </label>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block font-mono text-[8px] tracking-[0.08em] text-[#5f5142] uppercase">
                            Phone (optional)
                          </span>
                          <input
                            value={form.phone}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                phone: event.target.value,
                              }))
                            }
                            placeholder="012 345 6789"
                            className="w-full rounded-lg border border-[#d8cbb4] bg-white px-3 py-2 text-sm outline-none focus:border-[#d94a2b]"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block font-mono text-[8px] tracking-[0.08em] text-[#5f5142] uppercase">
                            Handover
                          </span>
                          <select
                            value={form.fulfilment}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                fulfilment: event.target.value as
                                  | "pickup"
                                  | "post",
                              }))
                            }
                            className="w-full rounded-lg border border-[#d8cbb4] bg-white px-3 py-2 text-sm outline-none focus:border-[#d94a2b]"
                          >
                            <option value="pickup">Pickup</option>
                            <option value="post">Post</option>
                          </select>
                        </label>
                      </div>

                      <label className="mt-2 block">
                        <span className="mb-1 block font-mono text-[8px] tracking-[0.08em] text-[#5f5142] uppercase">
                          Note (optional)
                        </span>
                        <textarea
                          value={form.note}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              note: event.target.value,
                            }))
                          }
                          placeholder="Can collect this weekend."
                          rows={2}
                          className="w-full resize-none rounded-lg border border-[#d8cbb4] bg-white px-3 py-2 text-sm outline-none focus:border-[#d94a2b]"
                        />
                      </label>

                      {formError && (
                        <p className="mt-2 flex items-start gap-1.5 text-[11px] font-bold text-[#a83a21]">
                          <AlertTriangle
                            className="mt-0.5 size-3 shrink-0"
                            aria-hidden="true"
                          />
                          {formError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#b83a1f] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#9e3019]"
                      >
                        Reserve this item
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </button>
                      <p className="mt-2 text-[10px] leading-relaxed font-bold text-[#6f5e4b]">
                        The server reads the price. The browser never sends an
                        amount. The shop confirms the sale after payment.
                      </p>
                    </form>
                  ) : (
                    <div className="mt-4 rounded-xl border-2 border-dashed border-[#d8cbb4] bg-[#fbf7ec] p-4">
                      <p className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-[#a83a21] uppercase">
                        <Lock className="size-3" aria-hidden="true" />
                        {selected.status === "reserved"
                          ? "On hold by another buyer"
                          : "This one found a home"}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed font-bold text-[#6e5e4c]">
                        {selected.status === "reserved"
                          ? "A pending reservation is holding this item. If it expires, the item comes back to the shelf."
                          : "The shop confirmed the sale. The item is sold, and the receipt keeps its history."}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("back");
                          setBackTab("reservations");
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#d8cbb4] bg-white px-3 py-1.5 font-mono text-[8px] tracking-[0.08em] text-[#6e5e4c] uppercase transition-colors hover:border-[#d94a2b]/40 hover:text-[#d94a2b]"
                      >
                        See the back room
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  {raceLost && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#d94a2b]/35 bg-[#d94a2b]/5 p-3 text-[11px] leading-relaxed font-bold text-[#6e4b12]">
                      <AlertTriangle
                        className="mt-0.5 size-3.5 shrink-0 text-[#d94a2b]"
                        aria-hidden="true"
                      />
                      Another buyer got there first. The item is reserved, and
                      the database would refuse a second pending reservation.
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          `https://kedai.example/items/${selected.slug}`,
                          "Item link copied (demo). Each item has a shareable public URL.",
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#d8cbb4] bg-white px-3 py-1.5 font-mono text-[8px] tracking-[0.08em] text-[#6e5e4c] uppercase transition-colors hover:border-[#2f6b4f]/40 hover:text-[#2f6b4f]"
                    >
                      <Link2 className="size-3" aria-hidden="true" />
                      Copy item link
                    </button>
                    <a
                      href={`https://wa.me/60123456789?text=${encodeURIComponent(
                        `Hi Kedai, I have a question about "${selected.title}".`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#2f6b4f]/35 bg-[#2f6b4f]/5 px-3 py-1.5 font-mono text-[8px] tracking-[0.08em] text-[#24543d] uppercase transition-colors hover:bg-[#2f6b4f]/10"
                    >
                      <MessageCircle className="size-3" aria-hidden="true" />
                      Ask on WhatsApp
                    </a>
                  </div>

                  {selected.status === "available" && !raceLost && (
                    <button
                      type="button"
                      onClick={simulateRace}
                      className="mt-3 text-left font-mono text-[8px] tracking-[0.06em] text-[#6f5e4b] uppercase underline decoration-dotted underline-offset-2 hover:text-[#d94a2b]"
                    >
                      Demo: let another buyer click first
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "receipt" && active && activeItem && (
            <div className="p-4 sm:p-6">
              <button
                type="button"
                onClick={() => setView("shelf")}
                className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.08em] text-[#5f5142] uppercase transition-colors hover:text-[#d94a2b]"
              >
                <ArrowLeft className="size-3" aria-hidden="true" />
                Back to the shelf
              </button>

              <div className="mx-auto mt-3 max-w-2xl">
                <div className="overflow-hidden rounded-xl border border-[#d8cbb4] bg-[#fbf7ec] shadow-[0_18px_40px_-30px_rgba(43,29,20,0.4)]">
                  <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#d8cbb4] p-4 sm:p-5">
                    <div>
                      <p className="font-mono text-[9px] tracking-[0.18em] text-[#6f5e4b] uppercase">
                        Kedai · reservation receipt
                      </p>
                      <p
                        className="mt-1 text-2xl leading-tight"
                        style={{
                          fontFamily:
                            'Fraunces, Georgia, "Times New Roman", serif',
                        }}
                      >
                        {active.reference}
                      </p>
                    </div>
                    <ReservationStatusPill status={active.status} />
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex gap-3">
                      <img
                        src={activeItem.photo}
                        alt={activeItem.alt}
                        className="size-20 shrink-0 rounded-lg border border-[#d8cbb4] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{activeItem.title}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-[#6f5e4b]">
                          {activeItem.condition} · one only
                        </p>
                        <p className="mt-1 font-mono text-sm font-bold">
                          {money(active.priceCents)}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="font-bold text-[#6f5e4b]">Buyer</dt>
                        <dd className="text-right font-bold">
                          {firstName(active.buyerName)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="font-bold text-[#6f5e4b]">Email</dt>
                        <dd className="truncate text-right font-mono text-[10px]">
                          {maskEmail(active.buyerEmail)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="font-bold text-[#6f5e4b]">Handover</dt>
                        <dd className="flex items-center gap-1.5 text-right font-bold">
                          {active.fulfilment === "pickup" ? (
                            <Package className="size-3" aria-hidden="true" />
                          ) : (
                            <Truck className="size-3" aria-hidden="true" />
                          )}
                          {active.fulfilment === "pickup" ? "Pickup" : "Post"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="font-bold text-[#6f5e4b]">
                          {active.status === "pending" ? "Held for" : "Window"}
                        </dt>
                        <dd className="text-right font-bold">
                          {active.status === "pending"
                            ? `${active.expiresInHours} hours`
                            : active.status === "confirmed"
                              ? "Confirmed"
                              : "Closed"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="font-bold text-[#6f5e4b]">
                          Receipt email
                        </dt>
                        <dd>
                          <EmailStatusPill status={active.emailStatus} />
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 rounded-lg border border-[#d8cbb4] bg-[#f1e9d8] p-3">
                      <p className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.1em] text-[#6f5e4b] uppercase">
                        <Mail className="size-3" aria-hidden="true" />
                        What happens now
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed font-bold text-[#6e5e4c]">
                        {active.status === "pending"
                          ? active.claimed
                            ? "Your payment claim is recorded. The shop still has to check the money and mark the item sold."
                            : "The shop is holding the item for 24 hours. Continue on WhatsApp to arrange payment and handover."
                          : active.status === "confirmed"
                            ? "The shop confirmed the sale. The item is sold and the receipt keeps its history."
                            : "This reservation is closed. The item went back to the shelf when the hold ended."}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowWhatsApp((current) => !current)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2f6b4f] px-3 py-2 font-mono text-[9px] font-bold tracking-[0.06em] text-white uppercase transition-colors hover:bg-[#24543d]"
                      >
                        <MessageCircle className="size-3.5" aria-hidden="true" />
                        Continue on WhatsApp
                      </button>

                      {active.status === "pending" && !active.claimed && (
                        <button
                          type="button"
                          onClick={claimPaid}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#b7791f]/45 bg-[#f2b441]/20 px-3 py-2 font-mono text-[9px] font-bold tracking-[0.06em] text-[#8a5a12] uppercase transition-colors hover:bg-[#f2b441]/30"
                        >
                          <Check className="size-3.5" aria-hidden="true" />
                          I&apos;ve paid
                        </button>
                      )}

                      {active.claimed && active.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#b7791f]/35 bg-[#f2b441]/20 px-2.5 py-1 font-mono text-[8px] tracking-[0.08em] text-[#8a5a12] uppercase">
                          <Clock className="size-2.5" aria-hidden="true" />
                          Claim recorded
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            active.reference,
                            "Reference copied. The receipt page is the link the email carries.",
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8cbb4] bg-white px-3 py-2 font-mono text-[9px] font-bold tracking-[0.06em] text-[#6e5e4c] uppercase transition-colors hover:border-[#d94a2b]/40 hover:text-[#d94a2b]"
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                        Copy reference
                      </button>
                    </div>

                    <p className="mt-3 text-[10px] leading-relaxed font-bold text-[#6f5e4b]">
                      A claim is not a confirmation. Only the shop can mark this
                      sold. The receipt is a view of the database, not a
                      separate source of truth.
                    </p>
                  </div>
                </div>

                {showWhatsApp && (
                  <WhatsAppPreview
                    message={activeMessage}
                    onClose={() => setShowWhatsApp(false)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#211710] p-4 text-[#f6f0e2] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] text-[#f2b441]/75 uppercase">
                The back room · admin only
              </p>
              <h3
                className="mt-1 text-2xl leading-tight sm:text-3xl"
                style={{
                  fontFamily: 'Fraunces, Georgia, "Times New Roman", serif',
                }}
              >
                The ledger.
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed font-bold text-[#f6f0e2]/65">
                Signed in as the shop. Every action here is a conditional update,
                not a hidden button.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={simulateExpiry}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f6f0e2]/20 px-3 py-1.5 font-mono text-[8px] tracking-[0.08em] text-[#f6f0e2]/70 uppercase transition-colors hover:border-[#f2b441]/50 hover:text-[#f2b441]"
              >
                <Clock className="size-3" aria-hidden="true" />
                Simulate 24 hours
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f6f0e2]/20 px-3 py-1.5 font-mono text-[8px] tracking-[0.08em] text-[#f6f0e2]/70 uppercase transition-colors hover:border-[#d94a2b]/50 hover:text-[#d94a2b]"
              >
                <RotateCcw className="size-3" aria-hidden="true" />
                Reset demo
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Available", value: available, tone: "#2f6b4f" },
              { label: "Reserved", value: reserved, tone: "#b7791f" },
              { label: "Sold", value: sold, tone: "#d94a2b" },
              { label: "Pending holds", value: pending, tone: "#f2b441" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#f6f0e2]/12 bg-[#f6f0e2]/5 p-3"
              >
                <p className="font-mono text-[8px] tracking-[0.1em] text-[#f6f0e2]/60 uppercase">
                  {stat.label}
                </p>
                <p
                  className="mt-1 text-2xl leading-none font-bold"
                  style={{ color: stat.tone }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setBackTab("items")}
              aria-pressed={backTab === "items"}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[9px] tracking-[0.08em] uppercase transition-colors ${
                backTab === "items"
                  ? "bg-[#f6f0e2] text-[#2b1d14]"
                  : "border border-[#f6f0e2]/20 text-[#f6f0e2]/60 hover:text-[#f6f0e2]"
              }`}
            >
              Items
            </button>
            <button
              type="button"
              onClick={() => setBackTab("reservations")}
              aria-pressed={backTab === "reservations"}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[9px] tracking-[0.08em] uppercase transition-colors ${
                backTab === "reservations"
                  ? "bg-[#f6f0e2] text-[#2b1d14]"
                  : "border border-[#f6f0e2]/20 text-[#f6f0e2]/60 hover:text-[#f6f0e2]"
              }`}
            >
              Reservations
            </button>
          </div>

          {backTab === "items" ? (
            <div className="mt-3 grid grid-cols-1 gap-2">
              {items.map((item) => {
                const hold = reservations.find(
                  (reservation) =>
                    reservation.itemId === item.id &&
                    reservation.status === "pending",
                );
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-[#f6f0e2]/10 bg-[#f6f0e2]/5 p-3"
                  >
                    <img
                      src={item.photo}
                      alt={item.alt}
                      className="size-12 shrink-0 rounded-lg border border-[#f6f0e2]/10 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.title}</p>
                      <p className="mt-0.5 font-mono text-[9px] text-[#f6f0e2]/60">
                        {money(item.priceCents)} · {item.condition}
                      </p>
                    </div>
                    <ItemStatusPill status={item.status} />
                    {hold ? (
                      <button
                        type="button"
                        onClick={() => openReceipt(hold.reference)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#f6f0e2]/20 px-2.5 py-1 font-mono text-[8px] tracking-[0.06em] text-[#f6f0e2]/70 uppercase hover:border-[#f2b441]/50 hover:text-[#f2b441]"
                      >
                        {hold.reference}
                        <ArrowRight className="size-2.5" aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="font-mono text-[8px] tracking-[0.06em] text-[#f6f0e2]/50 uppercase">
                        No active hold
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-3">
              {reservations.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-[#f6f0e2]/15 p-6 text-center">
                  <Store
                    className="mx-auto size-6 text-[#f6f0e2]/50"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-bold text-[#f6f0e2]/70">
                    No reservations yet.
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-[#f6f0e2]/55">
                    Go to the shop, reserve something, then come back.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {[...reservations].reverse().map((reservation) => {
                    const item = items.find(
                      (entry) => entry.id === reservation.itemId,
                    );
                    if (!item) return null;
                    return (
                      <div
                        key={reservation.reference}
                        className="rounded-xl border border-[#f6f0e2]/10 bg-[#f6f0e2]/5 p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.08em] text-[#f2b441]">
                              {reservation.reference}
                            </p>
                            <p className="mt-1 text-sm font-bold">
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-[11px] font-bold text-[#f6f0e2]/50">
                              {reservation.buyerName} ·{" "}
                              {reservation.buyerEmail}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <ReservationStatusPill
                              status={reservation.status}
                            />
                            {reservation.claimed &&
                              reservation.status === "pending" && (
                                <span className="rounded-full border border-[#f2b441]/35 bg-[#f2b441]/15 px-2 py-0.5 font-mono text-[8px] tracking-[0.06em] text-[#f2b441] uppercase">
                                  Claimed paid
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] text-[#f6f0e2]/60">
                          <span>{money(reservation.priceCents)}</span>
                          <span>
                            {reservation.fulfilment === "pickup"
                              ? "Pickup"
                              : "Post"}
                          </span>
                          <span>
                            {reservation.status === "pending"
                              ? `${reservation.expiresInHours}h left`
                              : reservation.status}
                          </span>
                          <span className="flex items-center gap-1">
                            Email:{" "}
                            <EmailStatusPill
                              status={reservation.emailStatus}
                              dark
                            />
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {reservation.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  confirmSale(reservation.reference)
                                }
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#2f6b4f] px-3 py-1.5 font-mono text-[8px] font-bold tracking-[0.06em] text-white uppercase transition-colors hover:bg-[#24543d]"
                              >
                                <CheckCircle2
                                  className="size-3"
                                  aria-hidden="true"
                                />
                                Confirm sale
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  extendReservation(reservation.reference)
                                }
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#f6f0e2]/20 px-3 py-1.5 font-mono text-[8px] tracking-[0.06em] text-[#f6f0e2]/70 uppercase transition-colors hover:border-[#f2b441]/50 hover:text-[#f2b441]"
                              >
                                <Clock className="size-3" aria-hidden="true" />
                                +24h
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  cancelReservation(reservation.reference)
                                }
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#f6f0e2]/20 px-3 py-1.5 font-mono text-[8px] tracking-[0.06em] text-[#f6f0e2]/70 uppercase transition-colors hover:border-[#d94a2b]/50 hover:text-[#d94a2b]"
                              >
                                <X className="size-3" aria-hidden="true" />
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => openReceipt(reservation.reference)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#f6f0e2]/20 px-3 py-1.5 font-mono text-[8px] tracking-[0.06em] text-[#f6f0e2]/70 uppercase transition-colors hover:border-[#f6f0e2]/40 hover:text-[#f6f0e2]"
                          >
                            Open receipt
                            <ArrowRight className="size-3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#f6f0e2]/10 bg-[#f6f0e2]/5 px-3 py-2.5 text-[11px] leading-relaxed font-bold text-[#f6f0e2]/50">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              The demo skips the real login. It never lets a buyer confirm a
              sale, never allows two pending reservations for one item, and
              never lets the email status change the reservation status. Those
              refusals are the project.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#d8cbb4] bg-[#f1e9d8] px-4 py-2.5 sm:px-5">
        <p className="font-mono text-[8px] tracking-[0.1em] text-[#6f5e4b] uppercase">
          Demo only · no real payments, no real email
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 font-mono text-[8px] tracking-[0.08em] text-[#6f5e4b] uppercase hover:text-[#d94a2b]"
        >
          <RotateCcw className="size-2.5" aria-hidden="true" />
          Start over
        </button>
      </div>
    </div>
  );
}
