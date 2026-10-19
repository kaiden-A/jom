import { useState } from "react";
import {
  Cog,
  Database,
  FlaskConical,
  FolderInput,
  LayoutTemplate,
  Plug,
  Route,
  type LucideIcon,
} from "lucide-react";

type Tab = "files" | "migration";

interface FileStep {
  n: number;
  icon: LucideIcon;
  file: string;
  title: string;
  detail: string;
}

const files: FileStep[] = [
  {
    n: 1,
    icon: Database,
    file: "src/db/schema/photos.ts",
    title: "The table",
    detail:
      "uuid primary key, timestamps with timezone, imageKey as text — the R2 object key, never a URL. Defined on appSchema so every query is schema-qualified.",
  },
  {
    n: 2,
    icon: Cog,
    file: "src/services/photo_services.ts",
    title: "The service",
    detail:
      "Holds the zod schema (with human error messages), the public view projection, and the writes. Domain rules throw HttpError here — routes stay thin.",
  },
  {
    n: 3,
    icon: Route,
    file: "src/routes/photos.ts",
    title: "The router",
    detail:
      'requireAuth guards the whole router. GET lists, POST creates (safeParse → 422 on bad input), POST /:id/delete deletes. A malformed uuid is just a 404.',
  },
  {
    n: 4,
    icon: LayoutTemplate,
    file: "views/photos.ejs",
    title: "The view",
    detail:
      "A list, a create form, a delete form per row with data-confirm. Escaped output everywhere — <%= %> for data, <%- %> only for includes.",
  },
  {
    n: 5,
    icon: Plug,
    file: "src/app.ts",
    title: "The wiring",
    detail:
      'One line: app.use("/photos", photosRouter(deps)). Mounted — done. Every resource plugs into the same seam.',
  },
  {
    n: 6,
    icon: FlaskConical,
    file: "test/photos.test.ts",
    title: "The test",
    detail:
      "Validation failure re-renders (422), create redirects (303), delete redirects, anonymous access bounces to /login. Four tests, every resource.",
  },
];

const migrationSteps = [
  {
    title: "Edit the schema",
    body: "Add a table or a field in src/db/schema/*.ts. That's the only source of truth.",
    code: "src/db/schema/photos.ts",
  },
  {
    title: "Generate the SQL",
    body: "drizzle-kit writes a numbered .sql file. Nobody has run it yet — it's just a proposal.",
    code: "npm run db:generate",
  },
  {
    title: "Read it by hand",
    body: "Every line. The generator is good at adding — it can misread a rename as a drop + add.",
    code: "drizzle/0007_*.sql",
  },
  {
    title: "Apply it, deliberately",
    body: "Locally now, in production by hand later. Deploys never run migrations.",
    code: "npm run db:migrate",
  },
];

export default function ResourceFactory() {
  const [tab, setTab] = useState<Tab>("files");
  const [open, setOpen] = useState(1);

  return (
    <div className="clay not-prose my-8 overflow-hidden">
      <div className="border-line bg-paper/70 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Choose a view of the resource pattern"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "files"}
            onClick={() => setTab("files")}
            className={`font-display inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-all duration-150 ${
              tab === "files"
                ? "border-mint-deep bg-mint-deep text-white"
                : "border-line text-ink-soft hover:border-brand/40 hover:text-ink bg-white"
            }`}
          >
            <FolderInput className="size-4" aria-hidden="true" />
            The six files
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "migration"}
            onClick={() => setTab("migration")}
            className={`font-display inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-all duration-150 ${
              tab === "migration"
                ? "border-brand bg-brand text-white"
                : "border-line text-ink-soft hover:border-brand/40 hover:text-ink bg-white"
            }`}
          >
            <Database className="size-4" aria-hidden="true" />
            The migration lane
          </button>
        </div>
        <p className="text-ink-soft text-xs font-bold">
          Every resource follows the same shape
        </p>
      </div>

      {tab === "files" && (
        <ol className="pop-in p-4 sm:p-6">
          {files.map((f, i) => {
            const Icon = f.icon;
            const isOpen = open === f.n;
            const isLast = i === files.length - 1;
            return (
              <li key={f.file} className="relative">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="border-line absolute top-12 left-[21px] h-[calc(100%-2.25rem)] border-l-2 border-dashed"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? 0 : f.n)}
                  aria-expanded={isOpen}
                  className={`relative z-10 w-full rounded-2xl border-2 p-3 text-left transition-all duration-150 ${
                    isOpen
                      ? "shadow-clay-xs border-mint-deep/50 bg-white"
                      : "border-transparent hover:bg-paper/70"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`font-display grid size-11 shrink-0 place-items-center rounded-2xl font-semibold ${
                        isOpen
                          ? "bg-mint-deep text-white"
                          : "bg-line text-ink-soft"
                      }`}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-display block text-base font-semibold">
                        {f.n}. {f.title}
                      </span>
                      <code className="font-mono text-brand-deep mt-0.5 block truncate text-xs font-bold">
                        {f.file}
                      </code>
                    </span>
                  </span>
                </button>
                {isOpen && (
                  <div className="pop-in border-mint-deep/30 relative z-10 mr-1 ml-[57px] rounded-2xl border-2 border-dashed px-4 py-3">
                    <p className="text-ink-soft text-sm leading-relaxed font-bold">
                      {f.detail}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {tab === "migration" && (
        <div className="pop-in space-y-5 p-4 sm:p-6">
          <ol className="grid gap-3 sm:grid-cols-2">
            {migrationSteps.map((step, i) => (
              <li
                key={step.title}
                className="border-line rounded-2xl border-2 bg-white p-4"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-display bg-brand-soft text-brand-deep grid size-8 shrink-0 place-items-center rounded-xl text-sm font-semibold">
                    {i + 1}
                  </span>
                  <p className="font-display text-sm font-semibold">
                    {step.title}
                  </p>
                </div>
                <p className="text-ink-soft mt-2 text-sm leading-relaxed font-bold">
                  {step.body}
                </p>
                <code className="font-mono text-brand-deep mt-2 block text-xs font-bold">
                  {step.code}
                </code>
              </li>
            ))}
          </ol>

          <div className="border-line border-t-2 border-dashed pt-5">
            <p className="font-display text-sm font-semibold">
              The five minutes that save your data
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="border-rose/40 bg-rose/10 rounded-2xl border-2 p-4">
                <p className="text-xs font-bold tracking-widest text-[#be123c] uppercase">
                  What the generator guessed
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-[#1e1938] px-4 py-3 font-mono text-xs leading-relaxed text-[#e9e6f7]">
                  <code>{`ALTER TABLE photos DROP COLUMN folder;
ALTER TABLE photos ADD COLUMN folder_id uuid;`}</code>
                </pre>
                <p className="text-ink-soft mt-2 text-xs font-bold">
                  Two statements, zero rows moved. That DROP would eat everyone's
                  folders.
                </p>
              </div>
              <div className="border-mint-deep/40 bg-mint/15 rounded-2xl border-2 p-4">
                <p className="text-mint-deep text-xs font-bold tracking-widest uppercase">
                  What you sign off instead
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-[#1e1938] px-4 py-3 font-mono text-xs leading-relaxed text-[#e9e6f7]">
                  <code>{`ALTER TABLE photos RENAME COLUMN folder TO folder_id;`}</code>
                </pre>
                <p className="text-ink-soft mt-2 text-xs font-bold">
                  The generator can't read your mind about renames. You reviewed
                  the diff — that's the job.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="border-line bg-brand-soft/50 border-t px-4 py-3 text-sm font-bold sm:px-5">
        {tab === "files"
          ? "Once you see the shape, every resource is the same six moves — photos today, folders and comments later."
          : "Generated, reviewed, applied — in that order. The robot writes the SQL; the human signs off."}
      </p>
    </div>
  );
}
