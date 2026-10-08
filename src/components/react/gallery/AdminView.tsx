import { useEffect, useState, type SubmitEvent } from "react";
import {
  Check,
  FolderOpen,
  FolderPlus,
  Heart,
  Images,
  LayoutDashboard,
  MessageCircle,
  RotateCcw,
  Settings,
  Trash2,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import PhotoImg from "./PhotoImg";
import { uploadGrads, uploadSeeds } from "./data";
import type { AdminTab, Photo } from "./types";

interface NewPhoto {
  title: string;
  folder: string;
  seed: string;
  grad: string;
}

interface Props {
  photos: Photo[];
  folders: string[];
  onAddPhoto: (photo: NewPhoto) => void;
  onDeletePhoto: (id: number) => void;
  onAddFolder: (name: string) => boolean;
  onDeleteFolder: (name: string) => void;
  onGoVisitor: () => void;
  onReset: () => void;
}

const tabs: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "photos", label: "Photos", icon: Images },
  { id: "folder", label: "Folders", icon: FolderOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="border-line rounded-2xl border-2 bg-white p-4">
      <span className="bg-brand-soft text-brand-deep grid size-9 place-items-center rounded-xl">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="font-display mt-3 text-2xl font-semibold">{value}</p>
      <p className="text-ink-soft text-xs font-bold">{label}</p>
    </div>
  );
}

export default function AdminView({
  photos,
  folders,
  onAddPhoto,
  onDeletePhoto,
  onAddFolder,
  onDeleteFolder,
  onGoVisitor,
  onReset,
}: Props) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [title, setTitle] = useState("");
  const [folder, setFolder] = useState(folders[0] ?? "");
  const [seedIndex, setSeedIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);

  useEffect(() => {
    if (!folders.includes(folder)) {
      setFolder(folders[0] ?? "");
    }
  }, [folders, folder]);

  const totalLikes = photos.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = photos.reduce((sum, p) => sum + p.comments.length, 0);
  const recent = [...photos].reverse().slice(0, 3);

  function handleUpload(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploading) return;
    const value = title.trim();
    if (!value) {
      setError("Fill in the title first, then you can upload.");
      return;
    }
    if (!folder) {
      setError("Pick a folder first. If there isn't one, create some.");
      return;
    }
    setError(null);
    const captured: NewPhoto = {
      title: value,
      folder,
      seed: uploadSeeds[seedIndex] ?? uploadSeeds[0],
      grad: uploadGrads[seedIndex] ?? uploadGrads[0],
    };
    setUploading(true);
    setProgress(0);
    let p = 0;
    const interval = window.setInterval(() => {
      p += 14;
      if (p >= 100) {
        window.clearInterval(interval);
        setProgress(100);
        onAddPhoto(captured);
        window.setTimeout(() => {
          setUploading(false);
          setProgress(0);
          setTitle("");
        }, 400);
      } else {
        setProgress(p);
      }
    }, 90);
  }

  function handleAddFolder(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = newFolder.trim();
    if (!value) {
      setFolderError("Give the folder a name.");
      return;
    }
    const ok = onAddFolder(value);
    if (!ok) {
      setFolderError(`"${value}" already exists. Try another name.`);
      return;
    }
    setFolderError(null);
    setNewFolder("");
  }

  return (
    <div className="grid md:grid-cols-[190px_minmax(0,1fr)]">
      <div className="border-line bg-ink/95 flex gap-1 overflow-x-auto border-b p-3 md:flex-col md:border-r md:border-b-0 md:p-3">
        <p className="font-display hidden px-2 pt-2 pb-1 text-xs font-semibold tracking-widest text-white/50 uppercase md:block">
          Admin panel
        </p>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm font-bold transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-paper/50 min-h-[420px] p-4 sm:p-6">
        {tab === "dashboard" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Welcome back
                </h3>
                <p className="text-ink-soft text-sm font-bold">
                  This is what you see after logging in.
                </p>
              </div>
              <button
                type="button"
                onClick={onGoVisitor}
                className="btn btn-ghost !min-h-10 !px-4 !py-1.5 text-sm"
              >
                View public page
              </button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <StatCard icon={Images} label="Photos" value={photos.length} />
              <StatCard icon={Heart} label="Likes" value={totalLikes} />
              <StatCard
                icon={MessageCircle}
                label="Comments"
                value={totalComments}
              />
            </div>
            <div className="mt-6">
              <p className="font-display text-sm font-semibold">
                Recent
              </p>
              <ul className="mt-3 space-y-2">
                {recent.length === 0 && (
                  <li className="text-ink-soft text-sm font-bold">
                    No photos yet. Head to the Photos tab.
                  </li>
                )}
                {recent.map((p) => (
                  <li
                    key={p.id}
                    className="border-line flex items-center gap-3 rounded-2xl border-2 bg-white p-2.5"
                  >
                    <PhotoImg
                      photo={p}
                      className="size-12 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.title}</p>
                      <p className="text-ink-soft text-xs font-bold">
                        {p.folder} · {p.likes} likes · {p.comments.length} comments
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "photos" && (
          <div>
            <h3 className="font-display text-xl font-semibold">Photos</h3>
            <p className="text-ink-soft text-sm font-bold">
              Upload new photos and manage the ones you have.
            </p>

            <form
              onSubmit={handleUpload}
              className="border-line mt-4 rounded-2xl border-2 bg-white p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="upload-title"
                    className="text-xs font-bold tracking-wide uppercase"
                  >
                    Title
                  </label>
                  <input
                    id="upload-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sunset at the pier"
                    className="border-line focus:border-brand mt-1.5 min-h-11 w-full rounded-xl border-2 px-3 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="upload-folder"
                    className="text-xs font-bold tracking-wide uppercase"
                  >
                    Folder
                  </label>
                  <select
                    id="upload-folder"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="border-line focus:border-brand mt-1.5 min-h-11 w-full rounded-xl border-2 bg-white px-3 text-sm font-bold outline-none"
                  >
                    {folders.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-4 text-xs font-bold tracking-wide uppercase">
                Pick a photo file
              </p>
              <div className="mt-2 flex gap-2">
                {uploadSeeds.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeedIndex(i)}
                    aria-pressed={seedIndex === i}
                    aria-label={`Pick photo file ${i + 1}`}
                    className={`relative size-16 overflow-hidden rounded-xl border-2 transition-all ${
                      seedIndex === i
                        ? "border-brand scale-105"
                        : "border-line opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`https://picsum.photos/seed/${s}/160/160`}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    {seedIndex === i && (
                      <span className="absolute inset-0 grid place-items-center bg-brand/40">
                        <span className="bg-brand grid size-6 place-items-center rounded-full text-white">
                          <Check
                            className="size-3.5"
                            strokeWidth={3}
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-rose mt-3 text-sm font-bold" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UploadCloud className="size-4" aria-hidden="true" />
                  {uploading ? "Uploading..." : "Upload photo"}
                </button>
                {uploading && (
                  <div
                    className="bg-line/60 h-2.5 min-w-40 flex-1 overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Upload progress"
                  >
                    <div
                      className="bg-accent h-full rounded-full transition-[width] duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </form>

            <ul className="mt-5 space-y-2">
              {photos.length === 0 && (
                <li className="text-ink-soft text-sm font-bold">
                  No photos yet.
                </li>
              )}
              {[...photos].reverse().map((p) => (
                <li
                  key={p.id}
                  className="border-line flex items-center gap-3 rounded-2xl border-2 bg-white p-2.5"
                >
                  <PhotoImg
                    photo={p}
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{p.title}</p>
                    <p className="text-ink-soft text-xs font-bold">
                      {p.folder} · {p.likes} likes · {p.comments.length} comments
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeletePhoto(p.id)}
                    aria-label={`Delete ${p.title}`}
                    className="text-ink-soft hover:border-rose hover:text-rose grid size-11 shrink-0 place-items-center rounded-xl border-2 border-transparent transition-colors"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "folder" && (
          <div>
            <h3 className="font-display text-xl font-semibold">Folders</h3>
            <p className="text-ink-soft text-sm font-bold">
              Arrange photos by category.
            </p>

            <form onSubmit={handleAddFolder} className="mt-4 flex gap-2">
              <label htmlFor="new-folder" className="sr-only">
                New folder name
              </label>
              <input
                id="new-folder"
                type="text"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="e.g. Flowers"
                className="border-line focus:border-brand min-h-11 min-w-0 flex-1 rounded-xl border-2 bg-white px-3 text-sm font-bold outline-none"
              />
              <button type="submit" className="btn btn-primary !px-4">
                <FolderPlus className="size-4" aria-hidden="true" />
                Add
              </button>
            </form>
            {folderError && (
              <p className="text-rose mt-2 text-sm font-bold" role="alert">
                {folderError}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {folders.map((f) => {
                const count = photos.filter((p) => p.folder === f).length;
                return (
                  <div
                    key={f}
                    className="border-line flex items-center gap-3 rounded-2xl border-2 bg-white p-4"
                  >
                    <span className="bg-sun/40 grid size-10 place-items-center rounded-xl">
                      <FolderOpen className="text-ink size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{f}</p>
                      <p className="text-ink-soft text-xs font-bold">
                        {count} photos
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteFolder(f)}
                      aria-label={`Delete folder ${f}`}
                      className="text-ink-soft hover:border-rose hover:text-rose grid size-11 shrink-0 place-items-center rounded-xl border-2 border-transparent transition-colors"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-ink-soft mt-3 text-xs font-bold">
              When a folder is deleted, its photos move to “Uncategorised”.
              No photos are lost, don't worry.
            </p>
          </div>
        )}

        {tab === "settings" && (
          <div>
            <h3 className="font-display text-xl font-semibold">Settings</h3>
            <p className="text-ink-soft text-sm font-bold">
              For this demo, there's only one setting.
            </p>
            <div className="border-line mt-4 space-y-3 rounded-2xl border-2 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">Reset demo</p>
                  <p className="text-ink-soft text-sm font-bold">
                    Back to the original 8 photos. All uploads & comments are gone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onReset}
                  className="btn btn-ghost !min-h-10 !px-4 !py-1.5 text-sm"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
            <div className="border-line bg-brand-soft/50 mt-4 rounded-2xl border-2 p-4 text-sm leading-relaxed">
              <p className="font-bold">Real in this demo:</p>
              <p className="text-ink-soft mt-1 font-bold">
                Upload flow, folder filter, likes, comments — they all actually
                work. The data just lives in your browser, so a refresh wipes it.
              </p>
              <p className="mt-3 font-bold">Fake in this demo:</p>
              <p className="text-ink-soft mt-1 font-bold">
                The photos come from picsum.photos, and there's no server behind
                it. In a future lesson, we'll wire it up for real.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
