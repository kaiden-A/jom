import { useCallback, useRef, useState } from "react";
import { Eye, Lock } from "lucide-react";
import VisitorView from "./gallery/VisitorView";
import AdminView from "./gallery/AdminView";
import Lightbox from "./gallery/Lightbox";
import {
  UNCATEGORIZED,
  initialFolders,
  initialPhotos,
} from "./gallery/data";
import type { DemoMode, Photo } from "./gallery/types";

let nextId = 100;

interface NewPhoto {
  title: string;
  folder: string;
  seed: string;
  grad: string;
}

export default function GalleryDemo() {
  const [mode, setMode] = useState<DemoMode>("visitor");
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [folders, setFolders] = useState<string[]>(initialFolders);
  const [activeFolder, setActiveFolder] = useState("Semua");
  const [openId, setOpenId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const openPhoto = photos.find((p) => p.id === openId) ?? null;

  function notify(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  const closeLightbox = useCallback(() => setOpenId(null), []);

  const toggleLike = useCallback((id: number) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p,
      ),
    );
  }, []);

  const addComment = useCallback((id: number, text: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: nextId++, author: "Kau", text, time: "baru je" },
              ],
            }
          : p,
      ),
    );
  }, []);

  function addPhoto(data: NewPhoto) {
    setPhotos((prev) => [
      ...prev,
      { id: nextId++, ...data, likes: 0, liked: false, comments: [] },
    ]);
    notify("Gambar dah masuk! Tekan Visitor untuk tengok.");
  }

  function deletePhoto(id: number) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    notify("Gambar dah dipadam (demo je).");
  }

  function addFolder(name: string): boolean {
    const clean = name.trim();
    const exists = folders.some(
      (f) => f.toLowerCase() === clean.toLowerCase(),
    );
    if (!clean || exists || clean === "Semua" || clean === UNCATEGORIZED) {
      return false;
    }
    setFolders((prev) => [...prev, clean]);
    notify(`Folder "${clean}" dah dicipta.`);
    return true;
  }

  function deleteFolder(name: string) {
    setFolders((prev) => {
      const next = prev.filter((f) => f !== name);
      if (!next.includes(UNCATEGORIZED)) next.push(UNCATEGORIZED);
      return next;
    });
    setPhotos((prev) =>
      prev.map((p) => (p.folder === name ? { ...p, folder: UNCATEGORIZED } : p)),
    );
    if (activeFolder === name) setActiveFolder("Semua");
    notify(`Folder "${name}" dipadam. Gambar pindah ke "${UNCATEGORIZED}".`);
  }

  function reset() {
    setPhotos(initialPhotos.map((p) => ({ ...p, comments: [...p.comments] })));
    setFolders([...initialFolders]);
    setActiveFolder("Semua");
    setOpenId(null);
    notify("Demo dah reset. Bersih macam baru.");
  }

  return (
    <div className="clay not-prose relative my-8 overflow-hidden">
      <div className="border-line bg-ink flex items-center gap-3 border-b px-3 py-3 sm:px-4">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="bg-rose size-3 rounded-full"></span>
          <span className="bg-sun size-3 rounded-full"></span>
          <span className="bg-mint size-3 rounded-full"></span>
        </div>
        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="mx-auto max-w-sm truncate rounded-full bg-white/10 px-4 py-1.5 text-center font-mono text-xs text-white/70">
            {mode === "visitor" ? "galeri-kito.my" : "galeri-kito.my/admin"}
          </p>
        </div>
        <div
          className="ml-auto flex shrink-0 rounded-full bg-white/10 p-1"
          role="tablist"
          aria-label="Pilih pandangan demo"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "visitor"}
            onClick={() => {
              setMode("visitor");
              setOpenId(null);
            }}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${
              mode === "visitor"
                ? "bg-white text-ink"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            Visitor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "admin"}
            onClick={() => {
              setMode("admin");
              setOpenId(null);
            }}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${
              mode === "admin"
                ? "bg-white text-ink"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Lock className="size-3.5" aria-hidden="true" />
            Admin
          </button>
        </div>
      </div>

      {mode === "visitor" ? (
        <VisitorView
          photos={photos}
          folders={folders}
          activeFolder={activeFolder}
          onFolderChange={setActiveFolder}
          onOpen={setOpenId}
          onGoAdmin={() => setMode("admin")}
        />
      ) : (
        <AdminView
          photos={photos}
          folders={folders}
          onAddPhoto={addPhoto}
          onDeletePhoto={deletePhoto}
          onAddFolder={addFolder}
          onDeleteFolder={deleteFolder}
          onGoVisitor={() => {
            setMode("visitor");
            setActiveFolder("Semua");
          }}
          onReset={reset}
        />
      )}

      {toast && (
        <div
          role="status"
          className="bg-ink pop-in pointer-events-none absolute bottom-4 left-1/2 z-40 w-max max-w-[90%] -translate-x-1/2 rounded-full px-4 py-2 text-center text-sm font-bold text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {openPhoto && (
        <Lightbox
          photo={openPhoto}
          onClose={closeLightbox}
          onToggleLike={toggleLike}
          onAddComment={addComment}
        />
      )}
    </div>
  );
}
