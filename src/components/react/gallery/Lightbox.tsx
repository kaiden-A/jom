import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { Heart, Send, X } from "lucide-react";
import PhotoImg from "./PhotoImg";
import type { Photo } from "./types";

interface Props {
  photo: Photo;
  onClose: () => void;
  onToggleLike: (id: number) => void;
  onAddComment: (id: number, text: string) => void;
}

export default function Lightbox({
  photo,
  onClose,
  onToggleLike,
  onAddComment,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [text, setText] = useState("");
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, []);

  function handleLike() {
    onToggleLike(photo.id);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 450);
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onAddComment(photo.id, value);
    setText("");
  }

  return (
    <div
      className="bg-ink/70 fixed inset-0 z-50 grid place-items-center p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={photo.title}
        onClick={(e) => e.stopPropagation()}
        className="clay pop-in grid max-h-[92dvh] w-full max-w-4xl overflow-y-auto md:grid-cols-[1.25fr_1fr] md:overflow-hidden"
      >
        <div className="bg-ink/10 relative">
          <PhotoImg
            photo={photo}
            className="h-56 w-full object-cover sm:h-72 md:h-full md:min-h-[440px]"
          />
          <span className="text-ink absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            {photo.folder}
          </span>
        </div>

        <div className="flex min-h-0 flex-col md:max-h-[80dvh]">
          <div className="border-line flex items-start justify-between gap-3 border-b px-5 py-4">
            <h3 className="font-display text-xl leading-snug font-semibold">
              {photo.title}
            </h3>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="border-line text-ink-soft hover:text-ink hover:border-ink grid size-11 shrink-0 place-items-center rounded-full border-2 bg-white transition-colors"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="border-line flex items-center justify-between border-b px-5 py-3">
            <button
              type="button"
              onClick={handleLike}
              aria-pressed={photo.liked}
              aria-label={photo.liked ? "Unlike" : "Like"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition-colors ${
                photo.liked
                  ? "border-rose bg-rose/15 text-rose"
                  : "border-line text-ink-soft hover:border-rose/50 hover:text-rose bg-white"
              }`}
            >
              <Heart
                className={`size-4 ${burst ? "like-pop" : ""}`}
                fill={photo.liked ? "currentColor" : "none"}
                aria-hidden="true"
              />
              {photo.likes}
            </button>
            <span className="text-ink-soft text-sm font-bold">
              {photo.comments.length} komen
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {photo.comments.length === 0 && (
              <p className="text-ink-soft py-6 text-center text-sm font-bold">
                Belum ada komen. Jadi orang pertama.
              </p>
            )}
            {photo.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <span className="bg-brand-soft text-brand-deep font-display grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold">
                  {c.author.charAt(0)}
                </span>
                <div className="bg-paper/80 min-w-0 flex-1 rounded-2xl px-3.5 py-2.5">
                  <p className="flex items-baseline gap-2">
                    <span className="text-sm font-bold">{c.author}</span>
                    <span className="text-ink-soft/70 text-xs font-bold">
                      {c.time}
                    </span>
                  </p>
                  <p className="text-ink-soft mt-0.5 text-sm leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-line flex items-center gap-2 border-t px-4 py-3"
          >
            <label htmlFor="comment-input" className="sr-only">
              Tulis komen
            </label>
            <input
              id="comment-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis komen sebagai 'Kau'..."
              className="border-line focus:border-brand min-h-11 min-w-0 flex-1 rounded-full border-2 bg-white px-4 text-sm font-bold outline-none"
            />
            <button
              type="submit"
              aria-label="Hantar komen"
              className="bg-brand hover:bg-brand-deep grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
