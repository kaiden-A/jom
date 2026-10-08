import { useState } from "react";
import { PenLine, Plus, Trash2, Search, type LucideIcon } from "lucide-react";

interface Method {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  tagline: string;
  desc: string;
  endpoint: string;
  status: string;
  request: string;
  response: string;
}

const methods: Method[] = [
  {
    id: "get",
    name: "GET",
    icon: Search,
    color: "#4f46e5",
    tagline: "Read data",
    desc: "You're asking for something, not changing anything. No body — just a URL.",
    endpoint: "GET /api/users",
    status: "200 OK · 404 Not Found",
    request: "GET /api/users",
    response: `[
  { "id": 1, "name": "Aiman", "email": "aiman@mail.com" },
  { "id": 2, "name": "Siti", "email": "siti@mail.com" }
]`,
  },
  {
    id: "post",
    name: "POST",
    icon: Plus,
    color: "#ea580c",
    tagline: "Create something new",
    desc: "You send data in the body, the server creates a record and gives you its id back.",
    endpoint: "POST /api/users",
    status: "201 Created · 400 Bad Request",
    request: `POST /api/users
Content-Type: application/json

{ "name": "Hafiz", "email": "hafiz@mail.com" }`,
    response: `{ "id": 3, "name": "Hafiz", "email": "hafiz@mail.com" }`,
  },
  {
    id: "put",
    name: "PUT",
    icon: PenLine,
    color: "#047857",
    tagline: "Update what exists",
    desc: "You send the record you want it to become. The id in the URL says which one.",
    endpoint: "PUT /api/users/:id",
    status: "200 OK · 404 Not Found",
    request: `PUT /api/users/3
Content-Type: application/json

{ "name": "Hafiz Roslan", "email": "hafiz@mail.com" }`,
    response: `{ "message": "User updated successfully" }`,
  },
  {
    id: "delete",
    name: "DELETE",
    icon: Trash2,
    color: "#e11d48",
    tagline: "Remove something",
    desc: "No body needed — the URL says it all. The server removes the record.",
    endpoint: "DELETE /api/users/:id",
    status: "200 OK · 404 Not Found",
    request: "DELETE /api/users/3",
    response: `{ "message": "User deleted successfully" }`,
  },
];

const naming = [
  { method: "GET", path: "/api/users", meaning: "Get all users" },
  { method: "GET", path: "/api/users/:id", meaning: "Get one user by id" },
  { method: "POST", path: "/api/users", meaning: "Create a new user" },
  { method: "PUT", path: "/api/users/:id", meaning: "Update one user by id" },
  { method: "DELETE", path: "/api/users/:id", meaning: "Delete one user by id" },
];

function chipStyle(name: string): string {
  const method = methods.find((m) => m.name === name);
  return method ? method.color : "#221c46";
}

export default function ApiMethods() {
  const [activeId, setActiveId] = useState("get");
  const active = methods.find((m) => m.id === activeId) ?? methods[0]!;

  return (
    <div className="not-prose my-8 space-y-5">
      <div className="clay overflow-hidden">
        <div
          className="border-line bg-paper/70 grid grid-cols-2 gap-2 border-b p-4 sm:grid-cols-4"
          role="tablist"
          aria-label="Choose an HTTP method"
        >
          {methods.map((m) => {
            const Icon = m.icon;
            const isActive = activeId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(m.id)}
                className={`flex min-h-11 flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition-all duration-150 ${
                  isActive
                    ? ""
                    : "border-line hover:border-brand/40 bg-white"
                }`}
                style={
                  isActive
                    ? { backgroundColor: m.color, borderColor: m.color }
                    : {}
                }
              >
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-sm font-bold ${
                    isActive ? "text-white" : "text-ink"
                  }`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {m.name}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    isActive ? "text-white/80" : "text-ink-soft"
                  }`}
                >
                  {m.tagline}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="font-display text-lg font-semibold">{active.tagline}</p>
            <p className="text-ink-soft mt-2 text-sm leading-relaxed font-bold">
              {active.desc}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className="font-mono rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: active.color }}
              >
                {active.endpoint}
              </span>
              <span className="border-line text-ink-soft rounded-full border bg-white px-3 py-1 text-xs font-bold">
                {active.status}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
                Request
              </p>
              <pre className="mt-1.5 overflow-x-auto rounded-xl bg-[#1e1938] px-4 py-3 font-mono text-xs leading-relaxed text-[#e9e6f7]">
                <code>{active.request}</code>
              </pre>
            </div>
            <div>
              <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
                Response
              </p>
              <pre className="mt-1.5 overflow-x-auto rounded-xl bg-[#1e1938] px-4 py-3 font-mono text-xs leading-relaxed text-[#e9e6f7]">
                <code>{active.response}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="clay overflow-hidden">
        <div className="border-line bg-paper/70 border-b p-4 sm:px-5">
          <p className="font-display text-sm font-semibold">
            How endpoints are usually named
          </p>
          <p className="text-ink-soft mt-0.5 text-xs font-bold">
            Same URL, different method — different meaning.
          </p>
        </div>
        <ul className="divide-line divide-y">
          {naming.map((row) => (
            <li
              key={`${row.method}-${row.path}`}
              className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
            >
              <span
                className="font-mono w-16 shrink-0 rounded-full px-2.5 py-1 text-center text-[11px] font-bold text-white"
                style={{ backgroundColor: chipStyle(row.method) }}
              >
                {row.method}
              </span>
              <code className="font-mono text-brand-deep text-sm font-bold">
                {row.path}
              </code>
              <span className="text-ink-soft ml-auto text-xs font-bold">
                {row.meaning}
              </span>
            </li>
          ))}
        </ul>
        <p className="border-line bg-brand-soft/50 border-t px-4 py-3 text-sm font-bold sm:px-5">
          The pattern: <code className="font-mono text-brand-deep">/api/</code> + the
          thing (plural) + optional id. The URL names the thing; the method says
          what to do with it.
        </p>
      </div>
    </div>
  );
}
