import { Heart, Images } from "lucide-react";
import PhotoImg from "./PhotoImg";
import type { Photo } from "./types";

interface Props {
  photos: Photo[];
  folders: string[];
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  onOpen: (id: number) => void;
  onGoAdmin: () => void;
}

export default function VisitorView({
  photos,
  folders,
  activeFolder,
  onFolderChange,
  onOpen,
  onGoAdmin,
}: Props) {
  const allFolders = ["All", ...folders];
  const visible =
    activeFolder === "All"
      ? photos
      : photos.filter((p) => p.folder === activeFolder);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Filter by folder"
        >
          {allFolders.map((folder) => {
            const isActive = activeFolder === folder;
            const count =
              folder === "All"
                ? photos.length
                : photos.filter((p) => p.folder === folder).length;
            return (
              <button
                key={folder}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onFolderChange(folder)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-bold transition-colors ${
                  isActive
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink-soft hover:border-ink/40 hover:text-ink bg-white"
                }`}
              >
                {folder}
                <span
                  className={`text-[11px] ${isActive ? "text-white/70" : "text-ink-soft/70"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-ink-soft text-xs font-bold">
          This is what visitors see. Want to upload?{" "}
          <button
            type="button"
            onClick={onGoAdmin}
            className="text-brand hover:text-brand-deep font-bold underline underline-offset-2"
          >
            Switch to Admin
          </button>
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="border-line mt-5 grid place-items-center rounded-2xl border-2 border-dashed bg-white/60 px-6 py-14 text-center">
          <Images className="text-ink-soft/50 size-8" aria-hidden="true" />
          <p className="font-display mt-3 text-base font-semibold">
            No photos in this folder yet
          </p>
          <p className="text-ink-soft mt-1 max-w-xs text-sm font-bold">
            Go to Admin, upload one. Then hit Visitor again.
          </p>
          <button
            type="button"
            onClick={onGoAdmin}
            className="btn btn-primary mt-5 !min-h-10 !px-4 !py-1.5 text-sm"
          >
            Go to Admin
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpen(photo.id)}
              className="group border-line hover:border-brand/50 hover:shadow-clay-sm relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-200 hover:-translate-y-1"
            >
              <PhotoImg
                photo={photo}
                className="aspect-4/3 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="from-ink/75 pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent p-3 pt-9">
                <span className="font-display block truncate text-sm font-semibold text-white">
                  {photo.title}
                </span>
                <span className="block text-[11px] font-bold text-white/80">
                  {photo.folder}
                </span>
              </span>
              <span className="text-ink absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold backdrop-blur-sm">
                <Heart
                  className="size-3"
                  fill={photo.liked ? "#fb7185" : "none"}
                  stroke={photo.liked ? "#fb7185" : "currentColor"}
                  aria-hidden="true"
                />
                {photo.likes}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
