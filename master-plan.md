# master-plan.md — Bootstrap blueprint: single Express server + Neon + Cloudflare R2

This file is written for a coding agent starting a **new application**. Feed it
to the agent before the first line of code is written. It is a single-user
system built as **one Express app**: it renders its own pages, handles its own
forms, and talks to Neon and R2. There is no separate client project.

The core this document reproduces:

- **Server**: one Express 5 + TypeScript app. Pages are server-rendered with
  EJS; forms are plain HTML; one tiny vanilla JS file handles the direct-to-R2
  image upload.
- **Identity**: one email + one password from env vars. Login sets a signed,
  HttpOnly session cookie. No users table, no sessions table, no IdP.
- **Persistence**: Neon Postgres through Drizzle ORM + `pg`, explicit schema,
  SQL migrations reviewed by hand.
- **Images**: Cloudflare R2 bucket. The browser uploads straight to R2 with a
  short-lived presigned URL; the database stores only the object key.

App-specific things (this app's domain resources, email, paid APIs) are
**extensions**. They plug into fixed seams; they never change the core.

---

## 0. How the agent must use this document

### 0.1 Read first, build in order

1. Read this whole file once before writing code.
2. Collect the facts in §0.2 from the user. Do not invent them.
3. Build §3's phases **in order**. Each phase ends with a verification step;
   do not start the next phase until the current one passes.
4. Keep every rule in §4. If a requirement seems to conflict with an
   invariant, stop and ask the user instead of breaking the invariant.
5. App-specific features are built with the §6 playbook, after phase 6.

### 0.2 Facts to collect from the user before phase 1

| Fact | Used for |
| --- | --- |
| App name and one-line purpose | `APP_NAME`, package name, page copy |
| Production domain | `PUBLIC_BASE_URL`, R2 bucket CORS |
| The owner's login email and a password (12+ chars) | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| Neon `DATABASE_URL` (pooled host) and a second Neon branch for tests | `DATABASE_URL`, `TEST_DATABASE_URL` |
| Cloudflare account id, bucket name, R2 API token (access key id + secret) | `R2_*` |
| Whether images are private (signed reads) or public (custom domain) | `R2_PUBLIC_BASE_URL` |
| Any app-specific extras (email, paid APIs) | §6 extension playbook |

### 0.3 Scope discipline

- **Core files** (this document's appendix) are copied, renamed to the app, and
  then left alone except for deliberate decisions. Do not "improve" them
  opportunistically.
- **A new dependency** not listed in §1 requires asking the user. The stack is
  deliberately small: no front-end framework, no CSS framework, no bundler for
  the browser.
- Every new setting goes into `.env.example` **and** `.env` (documented, never
  committed with real values).
- Prefer boring, explicit code over abstraction. There is no service-layer
  framework, no repository pattern, no DI container. The one seam is a plain
  `deps` object (`{ settings, db, storage }`) passed to `createApp()`.

---

## 1. Stack and why

| Layer | Choice | Why (do not substitute casually) |
| --- | --- | --- |
| Server | Node 22, Express 5, TypeScript strict, ESM, `zod` | Express 5 forwards async errors to the error handler natively. zod validates form bodies and env. |
| Pages | EJS templates in `views/`, plain CSS in `public/css/` | Server-rendered HTML with automatic escaping (`<%= %>`). No build step for the front end. |
| Forms | Standard HTML forms, **post/redirect/get** | Success → `303` redirect; validation failure → re-render the page with the user's input and a 4xx status. |
| Browser JS | Two small files in `public/js/` (no framework) | Only what a form can't do: the R2 upload (`upload.js`) and confirm prompts (`app.js`). |
| Security headers | A small middleware with a strict CSP | Pages are HTML now, so CSP is a real defense. It also forces the "no inline scripts" rule. |
| Dev/build | `tsx` (dev), `tsup` (build), `vitest` + `supertest` (tests) | Extensionless imports work everywhere (tsc, tsx, tsup, drizzle-kit). |
| DB driver | `pg` (node-postgres) Pool against Neon's **pooled** host | Plain, boring, works through Neon's transaction-mode pooler. Never set a named prepared statement. |
| ORM + schema | Drizzle ORM, `casing: "snake_case"`, explicit `pgSchema("public")` on every table | Transaction-mode pooling can reassign connections between statements, so `search_path` cannot be trusted. Never rely on session state. |
| Migrations | `drizzle-kit generate` → review the SQL → apply with a migrate script | Generated SQL is reviewed by hand. Deploys do not run migrations. |
| Auth | `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars, HMAC-signed session cookie | One user, no credential store to attack. Rotating `APP_SECRET` logs everything out. |
| Image storage | Cloudflare R2 via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | R2 speaks the S3 API. Browser uploads with a 5-minute presigned PUT; the server verifies with `HeadObject`. |
| Hosting (reference) | Cloud Run, one container | One process, one origin, no CORS. |
| Tests | vitest against a **separate Neon branch** (`TEST_DATABASE_URL`) | No offline mode; truncate after each test; a connection reset is a flaky failure, rerun it. |

Runtime dependencies: `express`, `ejs`, `zod`, `cookie-parser`,
`express-rate-limit`, `pg`, `drizzle-orm`, `@aws-sdk/client-s3`,
`@aws-sdk/s3-request-presigner`.
Dev dependencies: `typescript`, `tsx`, `tsup`, `drizzle-kit`, `vitest`,
`supertest`, `@types/express`, `@types/cookie-parser`, `@types/pg`,
`@types/supertest`, `@types/node`.
Install with `npm install` (latest) and **commit the lockfile**.

---

## 2. Target repo layout

One project at the repo root. There is no `client/` and no `server/`.

```
<app>/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── Dockerfile
├── .dockerignore                 # node_modules, dist, .env*, .git
├── .gitignore                    # node_modules/, dist/, .env, .env.* (keep .env.example)
├── .env / .env.example           # real file local; example documents every setting
├── AGENTS.md                     # per-repo agent rules (write one; see §8.1)
├── master-plan.md                # this file
├── .github/workflows/cd.yml
├── drizzle/                      # generated SQL migrations (committed)
├── public/                       # served as-is at /
│   ├── css/app.css
│   └── js/
│       ├── app.js                # [data-confirm] prompts
│       └── upload.js             # direct-to-R2 image upload
├── views/                        # EJS templates
│   ├── partials/                 # head.ejs (+ header), foot.ejs
│   ├── login.ejs
│   ├── home.ejs
│   ├── items.ejs                 # pattern: list + create form + delete buttons
│   └── error.ejs
├── src/
│   ├── index.ts                  # load settings, build deps, listen, graceful shutdown
│   ├── app.ts                    # createApp(deps): middleware order, routers, 404, errors
│   ├── config.ts                 # zod-parsed env → Settings; DB URL normalization
│   ├── db/
│   │   ├── client.ts             # Pool + drizzle()
│   │   └── schema/               # _schema.ts, items.ts, index.ts
│   ├── lib/                      # security.ts, errors.ts, utils.ts
│   ├── middleware/               # auth.ts, same-origin.ts, security-headers.ts
│   ├── routes/                   # health, auth, home, uploads, items...
│   ├── services/                 # business logic; routers call it
│   │   ├── storage.ts            # Storage interface + R2Storage + disabled stub
│   │   ├── image_services.ts     # key generation + upload verification
│   │   └── item_services.ts      # pattern (also holds the zod input schema)
│   └── scripts/                  # migrate.ts, sweep-orphans.ts
└── test/
    ├── setup.ts                  # truncate after each test, safety guard
    ├── helpers.ts                # testSettings, FakeStorage, loggedInAgent
    ├── auth.test.ts
    ├── items.test.ts
    └── uploads.test.ts
```

Authoritative-file map: cookie/signing rules → `src/lib/security.ts` and
`src/middleware/auth.ts`; error handling and middleware order → `src/lib/errors.ts`
and `src/app.ts`; CSP → `src/middleware/security-headers.ts`; R2 behavior →
`src/services/storage.ts`; test isolation → `test/setup.ts`.

---

## 3. Build order

### Phase 1 — Project scaffold

`package.json`:

```json
{
  "name": "<app>",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "tsx watch --env-file=.env src/index.ts",
    "build": "tsup src/index.ts src/scripts/migrate.ts --format esm --target node22 --out-dir dist --clean",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "node --env-file=.env ./node_modules/vitest/vitest.mjs run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx --env-file=.env src/scripts/migrate.ts"
  }
}
```

`tsconfig.json`: `strict`, `target: ES2022`, `module: ESNext`,
`moduleResolution: Bundler`, `noEmit: true`, `skipLibCheck`,
`verbatimModuleSyntax`, `types: ["node"]`, `include: ["src", "test",
"drizzle.config.ts"]`. Imports are extensionless.

`.gitignore`: `node_modules/`, `dist/`, `*.log`, `.env`, `.env.*`, with
`!.env.example`.

Verify: `npm install`, then `npm run typecheck` (after phase 2).

### Phase 2 — Server skeleton

Build, in this order: `config.ts` → `db/client.ts` → `lib/errors.ts` →
`middleware/security-headers.ts` → `app.ts` → `routes/health.ts` →
`views/error.ejs` + `partials/` → `index.ts`.

- `config.ts` (appendix A.1): a zod schema over `process.env`;
  `loadSettings(env = process.env)` so tests can pass their own env. The app
  **refuses to boot** with a missing/short `APP_SECRET`, a missing
  `ADMIN_EMAIL`/`ADMIN_PASSWORD`, or a weak password (under 12 chars). Also
  exports `normalizeDatabaseUrl()`.
- `db/client.ts` (appendix A.2): `Pool` (`max: 5`, idle and connect timeouts),
  `drizzle(pool, { schema, casing: "snake_case" })`. libpq-only URL params
  (`sslmode`, `channel_binding`, …) are stripped and `ssl: true` is set
  explicitly when `sslmode` required it.
- `app.ts` (appendix A.5): `createApp(deps)` sets the EJS view engine, applies
  security headers, serves `public/`, parses bodies and cookies, runs the
  same-origin check, mounts routers, then a 404, then the error handler
  **last**.
- `lib/errors.ts`: `HttpError(status, message)` and the error handler:
  **pages** render `views/error.ejs`; **JSON endpoints** (anything under
  `/uploads`, or a client that doesn't accept HTML) get `{"error": "..."}`.
- Health: `GET /health` runs `select 1` and returns `{"status":"ok"}`.

Verify: `npm run dev`, then `curl http://localhost:8000/health`, and a request
to an unknown path renders the error page with a 404.

### Phase 3 — Auth (env email + password, signed cookie)

The whole auth model is small on purpose:

1. **`lib/security.ts`** (appendix A.3): `safeEqual` (compare SHA-256 digests
   with `timingSafeEqual`, so length never leaks), `signPayload` /
   `unsignPayload` (base64url body + HMAC-SHA256 signature).
2. **`middleware/auth.ts`** (appendix A.4): `issueSession`, `clearSession`,
   `sessionRemaining`, and `requireAuth(settings, mode)`. The cookie value is a
   signed `{sub: email, iat, exp}`. A session is valid only if the signature
   verifies, `exp` is in the future, **and** `sub` still equals `ADMIN_EMAIL`.
   When less than half the TTL remains, `requireAuth` re-issues the cookie
   (rolling session). `mode: "page"` redirects an anonymous visitor to
   `/login?next=<original url>` (GET only); `mode: "json"` throws a 401.
   `requireAuth` also sets `res.locals.email` for the templates.
3. **`routes/auth.ts`** (appendix A.4):
   - `GET /login` renders the form (`next` carried in a hidden field; an
     already-signed-in visitor is redirected on).
   - `POST /login` (form body `email`, `password`, `next`): on success sets
     the cookie and `303`-redirects to `localPath(next)`; on failure
     re-renders the form with **401** and `"Wrong email or password."`, keeping
     the email but never the password. Both comparisons always run (no
     short-circuit) and the message never says which one failed. Rate-limited
     to 10 failed attempts per 15 minutes per IP; the limiter re-renders the
     form with 429.
   - `POST /logout` clears the cookie and `303`-redirects to `/login`.
4. **`middleware/same-origin.ts`** (appendix A.4): any request that is not
   GET/HEAD/OPTIONS and carries an `Origin` header must equal
   `PUBLIC_BASE_URL`'s origin. Together with `SameSite=Lax` this is the CSRF
   defense for every form.
5. **Tests** (`test/auth.test.ts`): wrong password → 401 and no cookie; wrong
   email → 401; success sets an HttpOnly cookie and redirects; protected page
   redirects anonymous GET to `/login?next=…`; signed-in GET works; logout
   clears the cookie; tampered cookie → redirect; expired cookie → redirect;
   cookie for a different email → redirect; 11th failed attempt → 429;
   cross-origin POST → 403; `next=//evil.com` redirects to `/`.

There is **no** users table, **no** sessions table, no OIDC, no signup route,
and no password reset. To change the credentials, change the env vars and
redeploy. Changing `APP_SECRET` or `ADMIN_EMAIL` signs the owner out.

Verify: `npm test -- auth`, then in a browser: `/` redirects to
`/login?next=%2F`, a wrong password shows the error, the right one lands on `/`.

### Phase 4 — Views and layout

1. `views/partials/head.ejs` — doctype, `<title><%= title %> · <%= appName %></title>`,
   the stylesheet, `<script src="/js/app.js" defer>`, and the header (brand
   link, plus the owner email and a **Sign out** `POST` form when `email` is
   set). `views/partials/foot.ejs` closes the document.
2. Every page starts with `<%- include("partials/head", { title: "..." }) %>`
   and ends with `<%- include("partials/foot") %>`.
3. `views/login.ejs` — the form (appendix A.7). `views/home.ejs` — the
   protected landing page (replace per app). `views/error.ejs` — status and
   message.
4. `public/css/app.css` — hand-written, small, no framework.
5. `public/js/app.js` — a delegated `submit` handler: a form with
   `data-confirm="…"` asks before submitting.

Template rules (also §4): data is always output with `<%= %>` (escaped);
`<%- %>` is for `include()` only; no inline `<script>`, `<style>`, or `on*=`
attributes (the CSP blocks them); state-changing buttons are always `POST`
forms, never links.

Verify: pages render in a browser with no CSP errors in the console; Sign out
works.

### Phase 5 — Domain resources

Every resource follows the same six-file shape. Use this as the template for
anything app-specific. There is one owner, so there is **no `owner_id`** and
no per-row ownership check: `requireAuth` on the router is the whole gate.

| Step | File | Rules |
| --- | --- | --- |
| 1. Table | `src/db/schema/<resource>.ts` | `uuid().primaryKey().defaultRandom()`, `createdAt`/`updatedAt` as `timestamp({ withTimezone: true })`, defined on `appSchema.table(...)`, exported from `schema/index.ts`. Images are stored as `imageKey text` (the R2 object key), never a URL. |
| 2. Service | `src/services/<resource>_services.ts` | Holds the zod `*In` schema (with human error messages), the view projection (`xPublic`), and the writes. Takes `db` (+ `storage` when images are involved). Domain violations throw `HttpError`. |
| 3. Router | `src/routes/<resource>.ts` | `router.use(requireAuth(settings, "page"))`; `GET /` lists, `POST /` creates, `POST /:id/delete` deletes. Create uses `safeParse`: on failure re-render with **422** and the input; on success **303** redirect. A malformed uuid is a 404. |
| 4. View | `views/<resource>.ejs` | A list, a create form, a delete form per row with `data-confirm`. |
| 5. Mount | `src/app.ts` | `app.use("/<resource>", <resource>Router(deps))`. |
| 6. Tests | `test/<resource>.test.ts` | Validation failure re-renders (422), create redirects (303), delete redirects, anonymous access redirects to login. |

Then: `npm run db:generate`, **read the generated SQL by hand**, apply it with
`npm run db:migrate`.

### Phase 6 — Image storage (Cloudflare R2)

One service module, one fake, one flow. The browser **never** gets a
long-lived credential and the server never proxies image bytes.

**One-time Cloudflare setup (tell the user to do this):**

1. Create an R2 bucket (private by default). Note the **Account ID**.
2. R2 → Manage API tokens → create a token with *Object Read & Write*
   **scoped to that one bucket**. Copy the Access Key ID and Secret.
3. Bucket → Settings → CORS policy (dev origin is the app itself):

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:8000", "https://<production-domain>"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Optional, only for public images: connect a custom domain to the bucket and
   set `R2_PUBLIC_BASE_URL`. Presigned URLs only work against the S3 endpoint
   `https://<account>.r2.cloudflarestorage.com`, never the custom domain.

**The flow:**

1. The form page has `<input type="file" data-image-input>` and a hidden
   `<input name="imageKey" data-image-key>`. `public/js/upload.js` runs when a
   file is chosen.
2. It calls `POST /uploads/sign` with JSON `{contentType, size}` (same origin,
   cookie auth). The server checks the type against an allowlist (`jpeg`,
   `png`, `webp`, `gif`, `avif` — **never SVG**) and `size <= IMAGE_MAX_BYTES`,
   mints a key `images/<yyyy>/<uuid>.<ext>`, and returns
   `{key, uploadUrl, expiresIn: 300}`.
3. The script `PUT`s the file to `uploadUrl` with the **same** `Content-Type`.
   This request goes straight to R2: no cookies.
4. The script writes `key` into the hidden field; the user submits the normal
   form (the submit button is disabled while the upload runs).
5. The service calls `assertUploadedImage()` first: the key must match the
   minted pattern, `HeadObject` must find it, its size must be within the cap
   and its content type on the allowlist. A bad object is deleted and the form
   re-renders with an error. Only then is the key written to the database.
6. Reads: views get `imageUrl` — `R2_PUBLIC_BASE_URL/<key>` when set, otherwise
   a signed GET valid for one hour (each page render signs fresh URLs).
7. Replacing or deleting a row deletes the old object **after** the database
   write succeeds. A failed R2 delete is logged, not surfaced; the optional
   `scripts/sweep-orphans.ts` (dry-run by default) lists `images/` objects
   older than 24 h that no row references and deletes them with `--apply`.

The CSP (appendix A.4) already allows `connect-src` and `img-src` for
`https://*.r2.cloudflarestorage.com` (and the public R2 origin if set), plus
`blob:` images for previews. Code: appendix A.6 (storage + uploads route) and
A.7 (`upload.js`). Tests use `FakeStorage` (in-memory, records calls); no test
touches real R2.

Verify: with real R2 credentials in `.env`, upload through the UI, confirm the
object appears in the bucket, the item shows the image, and deleting the item
removes the object.

### Phase 7 — Tests

`test/setup.ts` and `test/helpers.ts` are the whole strategy:

- Tests run against a **separate Neon branch**: `TEST_DATABASE_URL`. A global
  guard throws if it is empty or equal to `DATABASE_URL`. Migrations are
  applied to it before the run (`migrate()` from
  `drizzle-orm/node-postgres/migrator`).
- Every table is truncated after each test (`TRUNCATE ... RESTART IDENTITY
  CASCADE`).
- `testSettings(overrides)` calls `loadSettings()` with a fixed fake env
  (`APP_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `COOKIE_SECURE=false`);
  `createApp({ settings, db, storage: new FakeStorage() })` builds the app;
  `supertest` drives it.
- `loggedInAgent(app)` returns a supertest agent that has already logged in
  (form login), so cookies persist across calls.
- `FakeStorage` implements the `Storage` interface in memory and exposes the
  stored objects so tests can assert on upload verification and deletion.

Commands (also the CI gates):

```bash
npm test                 # all tests
npm test -- auth         # one file
npm run typecheck
```

A `pg` `ECONNRESET` or timeout against Neon is a flaky failure — rerun, do
not "fix" code for it.

### Phase 8 — Deploy (reference shape)

1. **Dockerfile** (appendix A.8): one image; build stage runs `tsup` and prunes
   dev dependencies; the runtime stage is `node:22-slim`, runs as the non-root
   `node` user, and copies `dist/`, `node_modules/`, `views/`, `public/`, and
   `drizzle/`. Views and static files are resolved relative to the working
   directory (`/app`), so they **must** be in the image.
2. **CI/CD** (appendix A.8): GitHub Actions on push to the default branch with
   a `paths` filter — build/push a commit-SHA-tagged image, authenticate to
   GCP, `deploy-cloudrun`. Verify the `branches` filter rather than trusting
   this file.
3. **Settings.** `NODE_ENV=production` (enables the view cache),
   `COOKIE_SECURE=true`, `PUBLIC_BASE_URL` = the public origin, and
   `TRUST_PROXY=1` (Cloud Run is one hop) or the login rate limiter will see
   every request as the same IP. Add the production origin to the R2 CORS
   policy.
4. **If you put another edge in front** (e.g. Firebase Hosting rewrites),
   check what it does to cookies: Firebase strips every cookie except
   `__session` on Cloud Run rewrites, so set `SESSION_COOKIE_NAME=__session`.
   Otherwise leave the default.
5. **Migrations are manual:**
   `docker run --rm -e DATABASE_URL=... <image> node dist/scripts/migrate.js`
   (or `npm run db:migrate` locally). Deploys never run migrations.
6. **Secrets** (`ADMIN_PASSWORD`, `APP_SECRET`, `R2_SECRET_ACCESS_KEY`,
   `DATABASE_URL`) live in the platform's secret store, never in the image or
   the repo.

---

## 4. Hard invariants

**Auth / sessions**

1. Credentials exist only as env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). They
   are never stored in the database, never logged, never rendered into a page,
   and never committed. The app refuses to boot without them.
2. Credential comparisons use `safeEqual` (SHA-256 digests +
   `timingSafeEqual`). Login always evaluates both email and password and
   returns one generic message.
3. The session cookie is `{sub, iat, exp}` signed with HMAC-SHA256 using
   `APP_SECRET`. It is HttpOnly, `SameSite=Lax`, path `/`, `secure` per
   config. A session is valid only if the signature verifies, it is unexpired,
   and `sub === ADMIN_EMAIL`. Every protected route goes through
   `requireAuth`; never trust a cookie's mere presence.
4. Sessions roll: `requireAuth` re-issues the cookie when less than half the
   TTL remains. There is no server-side session store, so the only revocation
   is rotating `APP_SECRET` (or changing `ADMIN_EMAIL`), which signs everyone
   out.
5. Login is rate-limited (10 failures / 15 min / IP). `TRUST_PROXY` must match
   the real proxy depth in production.
6. Every redirect target taken from user input (`next`) goes through
   `localPath()` — same-site paths only (`/...`, never `//...`).
7. Any non-GET/HEAD/OPTIONS request with an `Origin` header must match
   `PUBLIC_BASE_URL`. State changes are `POST` only; never a `GET` that
   mutates.

**Database**

8. Drizzle + `pg` against Neon's pooled host. No named prepared statements, no
   `SET search_path`, no unqualified raw SQL.
9. Every table is on `appSchema` (`pgSchema("public")`), so every query is
   schema-qualified.
10. Timezone-aware timestamps in the DB; views and JSON receive integer
    **milliseconds** or formatted strings from the service projection
    (`toMs`/`fromMs` in `lib/utils.ts`) — never raw `Date` objects in
    templates.
11. snake_case DB columns (`casing: "snake_case"`), camelCase in code. The
    mapping lives in the schema/projection layer.
12. Migrations are generated, **reviewed by hand**, and applied manually.
    Deploys do not apply them.

**Pages / HTTP**

13. Post/redirect/get: a successful form `POST` answers `303` and redirects; a
    validation failure re-renders the same page with a 4xx status and the
    user's input (never the password). Never render in response to a
    successful `POST`.
14. Routers are thin: parse the form (`safeParse`), call a service, render or
    redirect. Business logic and writes live in `services/*`.
15. Auth is opt-in per router (`router.use(requireAuth(settings, "page"))`) or
    per route; there is no global auth middleware. Public: `/health`,
    `GET/POST /login`, `POST /logout`, and `public/`. JSON endpoints
    (`/uploads/*`) use `requireAuth(settings, "json")`.
16. Errors: pages render `views/error.ejs`; JSON endpoints return
    `{"error": "sentence"}`. Never leak stack traces or raw exception text.
17. Templates: output data with `<%= %>` only; `<%- %>` is for `include()`.
    No inline `<script>`, `<style>`, or `on*=` handlers — the CSP
    (`script-src 'self'`, `style-src 'self'`) blocks them. Page behavior lives
    in `public/js/`.

**Images / R2**

18. Browsers get only a presigned URL that expires in 5 minutes and is scoped
    to one key, one method, one content type. R2 credentials never leave the
    server.
19. The database stores only the object key. Keys are server-minted
    (`images/<yyyy>/<uuid>.<ext>`); a key from a form is accepted only if it
    matches that pattern **and** `HeadObject` confirms the object.
20. Upload type allowlist is raster images only (never SVG); size is capped by
    `IMAGE_MAX_BYTES` and re-verified after upload.
21. Database first, R2 second: a failed object delete never fails the user's
    request; orphans are swept by script.
22. The R2 token is scoped to one bucket with Object Read & Write only.

**Secrets**

23. Direct-to-R2 `PUT`s send no cookies and never go to our own server.
24. `.env` is never committed; `.env.example` documents every setting with
    purpose and generation command. Nothing secret is ever put in a template or
    a public file.

---

## 5. Environment variables (master table)

(`.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | `production` in deploys (enables the EJS view cache). |
| `PORT` | `8000` | Listen port (Cloud Run injects `8080`). |
| `APP_NAME` | `My App` | Shown in the page title and header. |
| `DATABASE_URL` | — (required) | Neon pooled connection string; libpq params are stripped, SSL set explicitly. |
| `TEST_DATABASE_URL` | empty | Separate Neon branch for tests; must differ from `DATABASE_URL`. |
| `APP_SECRET` | — (required, 32+ chars) | HMAC key for the session cookie. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. |
| `ADMIN_EMAIL` | — (required) | The one login email (compared case-insensitively). |
| `ADMIN_PASSWORD` | — (required, 12+ chars) | The one login password. |
| `SESSION_COOKIE_NAME` | `app_session` | `__session` only if Firebase Hosting fronts Cloud Run. |
| `SESSION_TTL_DAYS` | `30` | Rolling session lifetime. |
| `COOKIE_SECURE` | `false` | `true` in any HTTPS deployment. |
| `PUBLIC_BASE_URL` | `http://localhost:8000` | The browser-facing origin; used by the same-origin check. |
| `TRUST_PROXY` | `0` | Number of proxy hops; `1` on Cloud Run. |
| `R2_ACCOUNT_ID` | empty | Cloudflare account id. Empty R2 settings disable image upload (503). |
| `R2_ACCESS_KEY_ID` | empty | R2 API token key id. |
| `R2_SECRET_ACCESS_KEY` | empty | R2 API token secret. |
| `R2_BUCKET` | empty | Bucket name. |
| `R2_PUBLIC_BASE_URL` | empty | If set, reads are unsigned `<url>/<key>`; empty → signed GET URLs (1 h). |
| `IMAGE_MAX_BYTES` | `10485760` | Per-image size cap (10 MB). |

There is no browser-side configuration. Nothing in `public/` or `views/`
contains a secret.

---

## 6. Extension playbook (app-specific features)

**A new domain resource** — follow the six-file table in phase 5, then:

- add the link to the header/home page,
- add tests for validation and the happy path,
- if it has an image, use `imageKey` + `assertUploadedImage()` exactly as in
  phase 6,
- update `AGENTS.md` with anything surprising about this resource.

**External API integration:**

1. Wrap the API in a small class in `services/<vendor>.ts` with a `configured`
   flag (empty key disables it), typed results, and vendor errors translated to
   one `HttpError`/domain error.
2. Add it to the `deps` object in `createApp` so tests can inject a fake.
3. Add a `Fake<Vendor>` to `test/helpers.ts` that records calls and serves
   canned results.
4. Cache quota-expensive responses in a table with TTLs; respect vendor terms
   and keep a soft daily cap below the real quota.
5. Keep the key server-side.

**Email**: a `services/email.ts` with a `configured` flag and a `send()` that
logs in dev, plus a fake in tests. Outbound sends triggered by requests are
best-effort: never let a failed email fail the user's request unless the user
asked for exactly that.

**Scheduled/background work**: one service function, exposed as a CLI under
`src/scripts/` (idempotent, dry-run by default, counts in the output). If a
scheduler must call it over HTTP, add a secret-header endpoint compared with
`safeEqual`, 403 when unset/wrong — never an unauthenticated route.
`sweep-orphans.ts` for R2 is the model.

**A JSON endpoint for in-page behavior** (like `/uploads/sign`): put it in its
own router, protect it with `requireAuth(settings, "json")`, validate with zod,
return `{error}` on failure, and call it from a file in `public/js/` with
`fetch` (same origin, cookie auth).

---

## 7. Definition of done

A new app built from this document is done when all of these pass:

1. `npm install` then `npm run dev` runs the single server.
2. `npm test` is green (with the occasional Neon flake rerun);
   `npm run typecheck` is clean.
3. In the browser: `/` redirects to `/login` with `next`, a wrong password
   shows an error, the right one lands on `next`, reload stays signed in,
   Sign out signs out and a protected page redirects again. No CSP violations
   appear in the console.
4. `curl /health` → `{"status":"ok"}`; an unauthenticated `POST /uploads/sign`
   → 401 `{"error":"Not signed in."}`; a cross-origin `POST` → 403.
5. An image uploads from the browser straight to R2, the item shows it,
   deleting the item removes the object, and a non-image or oversized file is
   rejected before and after upload.
6. The reviewed migration brings a fresh Neon database to the current schema
   (`npm run db:migrate`) and contains no surprises.
7. `docker build .` runs; the container serves pages, static files, and
   `/health` on one port.
8. Secrets exist only in `.env` / the deploy environment; `.env.example`
   documents every one.

---

## 8. Footguns and anti-patterns

| Symptom | Cause | Fix |
| --- | --- | --- |
| Login works locally, bounces back to `/login` in production | `COOKIE_SECURE=true` over plain HTTP, or an edge stripping the cookie | Serve HTTPS; if Firebase Hosting fronts Cloud Run, `SESSION_COOKIE_NAME=__session`. |
| Login returns 429 for everyone behind a proxy | `trust proxy` unset, so every request appears from the proxy's IP | `TRUST_PROXY=1` (match the real hop count). |
| Owner signed out after a deploy | `APP_SECRET` or `ADMIN_EMAIL` changed | Intended. Keep `APP_SECRET` stable. |
| App won't start | Missing/short `APP_SECRET`, missing `ADMIN_*`, or password under 12 chars | Fix the env; the zod error names the variable. |
| Redirect after login goes to an external site | `next` used unsanitized | Always `localPath()`, on both `GET` and `POST /login`. |
| After login you land on a 404 | Session expired on a `POST`, and `next` pointed at a POST-only URL | `requireAuth` only sets `next` for `GET` requests. |
| Form `POST` returns 403 "Cross-site request blocked." | `PUBLIC_BASE_URL` doesn't match the browser's origin (port, scheme, host) | Set it to exactly what the browser shows. |
| Inline script or style silently does nothing | The CSP blocks inline code | Move it to `public/js` / `public/css`. |
| R2 upload blocked in the console (CSP) | `connect-src` missing the R2 host | Keep `https://*.r2.cloudflarestorage.com` in `connect-src`. |
| Image preview or image from R2 doesn't render | `img-src` missing `blob:`, the R2 host, or the public R2 origin | Update `security-headers.ts`. |
| Pages 500 with "Failed to lookup view" in Docker | `views/` (or `public/`) not copied into the image, or wrong working dir | Copy them to `/app`; the app resolves them from the working directory. |
| Page works in dev, user HTML shows up unescaped | `<%- %>` used for data | `<%= %>` for data; `<%- %>` only for `include()`. |
| Deleting by link is triggered by prefetch/crawlers | Mutation on `GET` | Always a `POST` form. |
| Async route error hangs the request | Express 4 habits | Use Express 5; errors reach `errorHandler`. Wildcard routes need names (`/*splat`). |
| R2 `PUT` → 403 `SignatureDoesNotMatch` | `Content-Type` at upload differs from the one signed | Send exactly `file.type` that was passed to `/uploads/sign`. |
| R2 `PUT` rejected over unsupported checksum params | Newer AWS SDK adds default CRC checksums R2 doesn't accept in presigned URLs | `new S3Client({ requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED", ... })`. |
| Browser blocks the R2 upload (CORS) | Bucket CORS missing the origin, `PUT`, or `Content-Type` header | Update the bucket CORS policy (phase 6); include dev and production origins. |
| Presigned URL fails on the custom domain | Signed URLs only work on `<account>.r2.cloudflarestorage.com` | Sign against the S3 endpoint; use the custom domain only for unsigned public reads. |
| Images 403 after the page sat open for an hour | Signed GET URL expired | Reload the page, or use `R2_PUBLIC_BASE_URL` for public images. |
| Stored XSS via an uploaded image | SVG (or HTML) allowed | Raster allowlist only; `HeadObject` re-check after upload. |
| Orphaned objects pile up | Upload minted but never attached, or an R2 delete failed | `sweep-orphans.ts` on a schedule (dry-run first). |
| "Relation does not exist" after deploy | Migration never applied, or an unqualified table | Run `db:migrate`; every table lives on `appSchema`. |
| Migration contains surprising drops | Schema renames/changes drizzle-kit can't infer | Read every generated `.sql`; hand-fix before applying. |
| Random DB disconnects | Stale pooled connection or Neon cold start | Small `pg` pool with timeouts; rerun flaky tests; don't paper over it in code. |
| Test run wipes real data | Tests pointed at the live database | `TEST_DATABASE_URL` is a separate branch; the global guard throws if it equals `DATABASE_URL`. |
| A secret ends up in logs | Settings object logged | Never log `settings`; log named, non-secret fields only. |

### 8.1 Write an `AGENTS.md` for the new repo

Keep it short and factual; it is the first thing the next agent reads. Include:
commands (setup, dev server, tests, typecheck, migrations), server invariants
(driver, schema, error handling), page invariants (PRG, `<%= %>` only, no
inline scripts, CSP), auth invariants (env credentials, signed cookie, rate
limit, `localPath`), R2 invariants (presign flow, key pattern, no SVG, DB-first
deletes), and deploy notes (one origin, `TRUST_PROXY`, manual migrations,
`views/` and `public/` shipped in the image).

---

## Appendix A — Key code (near-verbatim reference skeletons)

Adapt names (`<app>`, table names, env values). Do not restructure the parts
that look unusual: each oddity exists for a documented reason. Imports are
extensionless (`moduleResolution: Bundler`).

### A.1 `src/config.ts`

```ts
import { z } from "zod";

const bool = z
  .enum(["true", "false"])
  .default("false")
  .transform((v) => v === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(8000),
  APP_NAME: z.string().default("My App"),

  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().default(""),

  // No defaults for secrets: the app refuses to boot without them.
  APP_SECRET: z.string().min(32, "APP_SECRET must be at least 32 characters"),
  ADMIN_EMAIL: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  ADMIN_PASSWORD: z.string().min(12, "ADMIN_PASSWORD must be at least 12 characters"),

  SESSION_COOKIE_NAME: z.string().default("app_session"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECURE: bool,
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:8000"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),

  R2_ACCOUNT_ID: z.string().default(""),
  R2_ACCESS_KEY_ID: z.string().default(""),
  R2_SECRET_ACCESS_KEY: z.string().default(""),
  R2_BUCKET: z.string().default(""),
  R2_PUBLIC_BASE_URL: z.string().default(""),
  IMAGE_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
});

export type Settings = z.infer<typeof schema>;

export function loadSettings(env: NodeJS.ProcessEnv = process.env): Settings {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment:\n  ${problems.join("\n  ")}`);
  }
  return parsed.data;
}

export function r2Configured(s: Settings): boolean {
  return Boolean(s.R2_ACCOUNT_ID && s.R2_ACCESS_KEY_ID && s.R2_SECRET_ACCESS_KEY && s.R2_BUCKET);
}

const LIBPQ_ONLY = ["sslmode", "channel_binding", "sslrootcert", "sslcert", "sslkey"];

/** Strips libpq-only params; SSL is set explicitly on the Pool instead. */
export function normalizeDatabaseUrl(raw: string): { url: string; ssl: boolean } {
  const u = new URL(raw.replace(/^postgres:\/\//, "postgresql://"));
  const mode = u.searchParams.get("sslmode") ?? "";
  for (const key of LIBPQ_ONLY) u.searchParams.delete(key);
  return { url: u.toString(), ssl: ["require", "verify-ca", "verify-full"].includes(mode) };
}
```

### A.2 `src/db/client.ts`, schema, and `drizzle.config.ts`

```ts
// src/db/client.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { normalizeDatabaseUrl } from "../config";
import * as schema from "./schema";

export function createDb(databaseUrl: string) {
  const { url, ssl } = normalizeDatabaseUrl(databaseUrl);
  const pool = new Pool({
    connectionString: url,
    ssl: ssl ? true : undefined,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (err) => console.error("pg pool error:", err.message));
  const db = drizzle(pool, { schema, casing: "snake_case" });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
```

```ts
// src/db/schema/_schema.ts
import { pgSchema } from "drizzle-orm/pg-core";

// Explicit schema on every table: a transaction-mode pooler can route
// consecutive statements to different connections, so search_path is unreliable.
export const appSchema = pgSchema("public");
```

```ts
// src/db/schema/items.ts  (pattern for any resource)
import { index, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { appSchema } from "./_schema";

export const items = appSchema.table(
  "items",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    body: text().notNull().default(""),
    imageKey: text(), // R2 object key, never a URL
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.createdAt)],
);

export type Item = typeof items.$inferSelect;
```

```ts
// src/db/schema/index.ts
export * from "./_schema";
export * from "./items";
```

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
```

`pgSchema("public")` exists to force schema-qualified SQL. If you ever choose
a non-`public` schema, drizzle-kit will emit `CREATE SCHEMA`; review it.

```ts
// src/scripts/migrate.ts  (also compiled into the Docker image)
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { normalizeDatabaseUrl } from "../config";

const raw = process.env.DATABASE_URL;
if (!raw) throw new Error("DATABASE_URL is required");
const { url, ssl } = normalizeDatabaseUrl(raw);
const pool = new Pool({ connectionString: url, ssl: ssl ? true : undefined });
await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
await pool.end();
console.log("Migrations applied.");
```

### A.3 `src/lib/security.ts`, `errors.ts`, `utils.ts`

```ts
// src/lib/security.ts
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Constant-time string compare; hashing first makes the lengths equal. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function signPayload(payload: Record<string, unknown>, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function unsignPayload(value: string | undefined, secret: string): Record<string, unknown> | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [body, sig] = parts;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload: unknown = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
```

```ts
// src/lib/errors.ts
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Pages render views/error.ejs; JSON endpoints get {"error": "..."}. */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  let status = 500;
  let message = "Something went wrong.";
  if (err instanceof ZodError) {
    status = 422;
    message = "Check the details you sent.";
  } else if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else if (err?.type === "entity.parse.failed") {
    status = 400;
    message = "That request wasn't valid.";
  } else {
    console.error(err);
  }

  const wantsJson = req.path.startsWith("/uploads") || req.accepts(["html", "json"]) === "json";
  if (wantsJson) {
    res.status(status).json({ error: message });
    return;
  }
  res.status(status).render("error", { status, message });
};
```

```ts
// src/lib/utils.ts
import { z } from "zod";
import { HttpError } from "./errors";

export const toMs = (d: Date): number => d.getTime();
export const fromMs = (ms: number): Date => new Date(ms);

/** A malformed id is just "not found". */
export function parseId(value: unknown): string {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) throw new HttpError(404, "Not found.");
  return parsed.data;
}

/** Same-site paths only: "/x" is fine, "//evil.com" and "/\evil.com" are not. */
export function localPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
```

### A.4 Auth and headers: `middleware/*`, `routes/auth.ts`

```ts
// src/middleware/auth.ts
import type { Request, RequestHandler, Response } from "express";
import type { Settings } from "../config";
import { HttpError } from "../lib/errors";
import { safeEqual, signPayload, unsignPayload } from "../lib/security";

const now = () => Math.floor(Date.now() / 1000);

function cookieOptions(settings: Settings) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: settings.COOKIE_SECURE,
    path: "/",
  };
}

export function issueSession(res: Response, settings: Settings): void {
  const ttl = settings.SESSION_TTL_DAYS * 86_400;
  const iat = now();
  const token = signPayload({ sub: settings.ADMIN_EMAIL, iat, exp: iat + ttl }, settings.APP_SECRET);
  res.cookie(settings.SESSION_COOKIE_NAME, token, { ...cookieOptions(settings), maxAge: ttl * 1000 });
}

export function clearSession(res: Response, settings: Settings): void {
  res.clearCookie(settings.SESSION_COOKIE_NAME, cookieOptions(settings));
}

/** Seconds remaining, or null when the cookie is not a valid session. */
export function sessionRemaining(req: Request, settings: Settings): number | null {
  const payload = unsignPayload(req.cookies?.[settings.SESSION_COOKIE_NAME], settings.APP_SECRET);
  if (!payload) return null;
  const { sub, exp } = payload;
  if (typeof sub !== "string" || typeof exp !== "number") return null;
  if (!safeEqual(sub, settings.ADMIN_EMAIL)) return null;
  const remaining = exp - now();
  return remaining > 0 ? remaining : null;
}

/** "page": redirect anonymous visitors to /login. "json": throw a 401. */
export function requireAuth(settings: Settings, mode: "page" | "json" = "page"): RequestHandler {
  const ttl = settings.SESSION_TTL_DAYS * 86_400;
  return (req, res, next) => {
    const remaining = sessionRemaining(req, settings);
    if (remaining === null) {
      if (mode === "json") throw new HttpError(401, "Not signed in.");
      // Only GETs can be replayed after login; a POST just goes to the form.
      const next_ = req.method === "GET" ? `?next=${encodeURIComponent(req.originalUrl)}` : "";
      res.redirect(`/login${next_}`);
      return;
    }
    if (remaining < ttl / 2) issueSession(res, settings); // rolling refresh
    res.locals.email = settings.ADMIN_EMAIL;
    next();
  };
}
```

```ts
// src/middleware/same-origin.ts
import type { RequestHandler } from "express";
import type { Settings } from "../config";
import { HttpError } from "../lib/errors";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export function sameOriginOnly(settings: Settings): RequestHandler {
  const allowed = new URL(settings.PUBLIC_BASE_URL).origin;
  return (req, _res, next) => {
    const origin = req.get("origin");
    if (!SAFE.has(req.method) && origin && origin !== allowed) {
      throw new HttpError(403, "Cross-site request blocked.");
    }
    next();
  };
}
```

```ts
// src/middleware/security-headers.ts
import type { RequestHandler } from "express";
import type { Settings } from "../config";

export function securityHeaders(settings: Settings): RequestHandler {
  const r2 = "https://*.r2.cloudflarestorage.com";
  const publicR2 = settings.R2_PUBLIC_BASE_URL ? new URL(settings.R2_PUBLIC_BASE_URL).origin : "";
  const csp = [
    "default-src 'self'",
    "script-src 'self'", // no inline scripts: page JS lives in public/js
    "style-src 'self'", // no inline styles
    `img-src 'self' blob: ${r2} ${publicR2}`.trim(),
    `connect-src 'self' ${r2}`, // the browser's direct PUT to R2
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join("; ");
  return (_req, res, next) => {
    res.setHeader("Content-Security-Policy", csp);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    next();
  };
}
```

```ts
// src/routes/auth.ts
import { Router, type Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { Settings } from "../config";
import { safeEqual } from "../lib/security";
import { localPath } from "../lib/utils";
import { clearSession, issueSession, sessionRemaining } from "../middleware/auth";

const LoginIn = z.object({
  email: z.string().max(320),
  password: z.string().max(1024),
  next: z.string().max(2048).optional(),
});

function renderLogin(
  res: Response,
  status: number,
  opts: { next: string; error?: string; prefill?: string },
) {
  res.status(status).render("login", { error: opts.error ?? null, next: opts.next, prefill: opts.prefill ?? "" });
}

export function authRouter(settings: Settings): Router {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true, // only failed attempts count
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
      renderLogin(res, 429, { error: "Too many attempts. Try again later.", next: localPath(req.body?.next) });
    },
  });

  router.get("/login", (req, res) => {
    const next = localPath(req.query.next);
    if (sessionRemaining(req, settings) !== null) {
      res.redirect(next);
      return;
    }
    renderLogin(res, 200, { next });
  });

  router.post("/login", limiter, (req, res) => {
    const { email, password, next } = LoginIn.parse(req.body);
    const target = localPath(next);
    // Evaluate both so timing never reveals which one was wrong.
    const emailOk = safeEqual(email.trim().toLowerCase(), settings.ADMIN_EMAIL);
    const passwordOk = safeEqual(password, settings.ADMIN_PASSWORD);
    if (!(emailOk && passwordOk)) {
      renderLogin(res, 401, { error: "Wrong email or password.", next: target, prefill: email });
      return;
    }
    issueSession(res, settings);
    res.redirect(303, target);
  });

  router.post("/logout", (_req, res) => {
    clearSession(res, settings);
    res.redirect(303, "/login");
  });

  return router;
}
```

### A.5 `src/app.ts`, `index.ts`, health, home

```ts
// src/app.ts
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import path from "node:path";
import type { Settings } from "./config";
import type { Db } from "./db/client";
import { errorHandler, HttpError } from "./lib/errors";
import { sameOriginOnly } from "./middleware/same-origin";
import { securityHeaders } from "./middleware/security-headers";
import { authRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";
import { homeRouter } from "./routes/home";
import { itemsRouter } from "./routes/items";
import { uploadsRouter } from "./routes/uploads";
import type { Storage } from "./services/storage";

export interface Deps {
  settings: Settings;
  db: Db;
  storage: Storage;
}

export function createApp(deps: Deps): Express {
  const { settings } = deps;
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", settings.TRUST_PROXY);

  // Views and static files resolve from the working directory (repo root / /app).
  app.set("view engine", "ejs");
  app.set("views", path.resolve("views"));

  app.use(securityHeaders(settings));
  app.use(
    express.static(path.resolve("public"), {
      maxAge: settings.NODE_ENV === "production" ? "1h" : 0,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser());
  app.use(sameOriginOnly(settings));

  // Template defaults; requireAuth sets `email` for signed-in pages.
  app.use((_req, res, next) => {
    res.locals.appName = settings.APP_NAME;
    res.locals.email = null;
    next();
  });

  app.use("/health", healthRouter(deps));
  app.use("/", authRouter(settings));
  app.use("/", homeRouter(deps));
  app.use("/uploads", uploadsRouter(deps));
  app.use("/items", itemsRouter(deps)); // + domain routers

  app.use(() => {
    throw new HttpError(404, "Page not found.");
  });
  app.use(errorHandler); // always last
  return app;
}
```

```ts
// src/routes/health.ts
import { sql } from "drizzle-orm";
import { Router } from "express";
import type { Deps } from "../app";

export function healthRouter({ db }: Deps): Router {
  const router = Router();
  router.get("/", async (_req, res) => {
    await db.execute(sql`select 1`);
    res.json({ status: "ok" });
  });
  return router;
}
```

```ts
// src/routes/home.ts
import { Router } from "express";
import type { Deps } from "../app";
import { requireAuth } from "../middleware/auth";

export function homeRouter({ settings }: Deps): Router {
  const router = Router();
  // Per route, not router.use: this router is mounted at "/" and must not
  // intercept other paths.
  router.get("/", requireAuth(settings, "page"), (_req, res) => {
    res.render("home");
  });
  return router;
}
```

```ts
// src/index.ts
import { createApp } from "./app";
import { loadSettings } from "./config";
import { createDb } from "./db/client";
import { createStorage } from "./services/storage";

const settings = loadSettings();
const { db, pool } = createDb(settings.DATABASE_URL);
const app = createApp({ settings, db, storage: createStorage(settings) });

const server = app.listen(settings.PORT, "0.0.0.0", () => {
  console.log(`Listening on :${settings.PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    server.close(() => void pool.end().then(() => process.exit(0)));
  });
}
```

### A.6 R2 and the items pattern

```ts
// src/services/storage.ts
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Configured, type Settings } from "../config";
import { HttpError } from "../lib/errors";

export interface StoredObject {
  size: number;
  contentType: string;
}

export interface Storage {
  readonly configured: boolean;
  /** Presigned PUT valid for 5 minutes, bound to this key + content type. */
  createUploadUrl(key: string, contentType: string): Promise<string>;
  head(key: string): Promise<StoredObject | null>;
  /** Public URL if R2_PUBLIC_BASE_URL is set, otherwise a signed GET (1 h). */
  readUrl(key: string): Promise<string>;
  remove(key: string): Promise<void>;
}

const UPLOAD_TTL_SECONDS = 300;
const READ_TTL_SECONDS = 3600;

export class R2Storage implements Storage {
  readonly configured = true;
  private client: S3Client;

  constructor(private s: Settings) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${s.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: s.R2_ACCESS_KEY_ID, secretAccessKey: s.R2_SECRET_ACCESS_KEY },
      // Newer AWS SDKs add CRC checksum params that R2 presigned URLs reject.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  createUploadUrl(key: string, contentType: string) {
    const cmd = new PutObjectCommand({ Bucket: this.s.R2_BUCKET, Key: key, ContentType: contentType });
    return getSignedUrl(this.client, cmd, { expiresIn: UPLOAD_TTL_SECONDS });
  }

  async head(key: string): Promise<StoredObject | null> {
    try {
      const out = await this.client.send(new HeadObjectCommand({ Bucket: this.s.R2_BUCKET, Key: key }));
      return { size: out.ContentLength ?? 0, contentType: out.ContentType ?? "" };
    } catch (err) {
      const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) return null;
      throw err;
    }
  }

  async readUrl(key: string) {
    if (this.s.R2_PUBLIC_BASE_URL) return `${this.s.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
    const cmd = new GetObjectCommand({ Bucket: this.s.R2_BUCKET, Key: key });
    return getSignedUrl(this.client, cmd, { expiresIn: READ_TTL_SECONDS });
  }

  async remove(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.s.R2_BUCKET, Key: key }));
  }
}

/** Empty R2 settings disable image upload instead of crashing the app. */
const disabled: Storage = {
  configured: false,
  createUploadUrl: () => Promise.reject(new HttpError(503, "Image storage is not configured.")),
  head: () => Promise.reject(new HttpError(503, "Image storage is not configured.")),
  readUrl: () => Promise.reject(new HttpError(503, "Image storage is not configured.")),
  remove: () => Promise.resolve(),
};

export function createStorage(settings: Settings): Storage {
  return r2Configured(settings) ? new R2Storage(settings) : disabled;
}
```

```ts
// src/services/image_services.ts
import { randomUUID } from "node:crypto";
import { HttpError } from "../lib/errors";
import type { Storage } from "./storage";

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}; // raster only: never SVG

const KEY_PATTERN = /^images\/\d{4}\/[0-9a-f-]{36}\.(jpg|png|webp|gif|avif)$/;

export function newImageKey(ext: string): string {
  return `images/${new Date().getUTCFullYear()}/${randomUUID()}.${ext}`;
}

/** Call before writing an image key to the database. */
export async function assertUploadedImage(storage: Storage, key: string, maxBytes: number): Promise<void> {
  if (!KEY_PATTERN.test(key)) throw new HttpError(400, "That image isn't valid. Choose it again.");
  const object = await storage.head(key);
  if (!object) throw new HttpError(400, "The image didn't finish uploading. Try again.");
  if (object.size > maxBytes || !(object.contentType in ALLOWED_TYPES)) {
    await storage.remove(key).catch(() => undefined);
    throw new HttpError(400, "That file isn't an allowed image.");
  }
}
```

```ts
// src/routes/uploads.ts  (the one JSON endpoint; called by public/js/upload.js)
import { Router } from "express";
import { z } from "zod";
import type { Deps } from "../app";
import { HttpError } from "../lib/errors";
import { requireAuth } from "../middleware/auth";
import { ALLOWED_TYPES, newImageKey } from "../services/image_services";

const SignIn = z.object({ contentType: z.string(), size: z.number().int().positive() });

export function uploadsRouter({ settings, storage }: Deps): Router {
  const router = Router();
  router.use(requireAuth(settings, "json"));

  router.post("/sign", async (req, res) => {
    if (!storage.configured) throw new HttpError(503, "Image storage is not configured.");
    const { contentType, size } = SignIn.parse(req.body);
    const ext = ALLOWED_TYPES[contentType];
    if (!ext) throw new HttpError(400, "Use a JPEG, PNG, WebP, GIF or AVIF image.");
    if (size > settings.IMAGE_MAX_BYTES) throw new HttpError(400, "That image is too large.");
    const key = newImageKey(ext);
    const uploadUrl = await storage.createUploadUrl(key, contentType);
    res.status(201).json({ key, uploadUrl, expiresIn: 300 });
  });

  return router;
}
```

Resource pattern (service + router) with the image flow:

```ts
// src/services/item_services.ts
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/client";
import { items, type Item } from "../db/schema";
import { HttpError } from "../lib/errors";
import { toMs } from "../lib/utils";
import { assertUploadedImage } from "./image_services";
import type { Storage } from "./storage";

export const ItemIn = z.object({
  title: z.string().trim().min(1, "Give it a title.").max(200, "Keep the title under 200 characters."),
  body: z.string().max(10_000, "That's too long.").default(""),
  imageKey: z.string().nullable().default(null),
});
export type ItemInput = z.infer<typeof ItemIn>;

export async function itemView(storage: Storage, row: Item) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.imageKey ? await storage.readUrl(row.imageKey) : null,
    createdAt: toMs(row.createdAt),
  };
}

export async function listItems(db: Db, storage: Storage) {
  const rows = await db.select().from(items).orderBy(desc(items.createdAt));
  return Promise.all(rows.map((r) => itemView(storage, r)));
}

export async function createItem(db: Db, storage: Storage, maxBytes: number, input: ItemInput) {
  if (input.imageKey) await assertUploadedImage(storage, input.imageKey, maxBytes);
  const [row] = await db.insert(items).values(input).returning();
  return itemView(storage, row!);
}

export async function deleteItem(db: Db, storage: Storage, id: string) {
  const [row] = await db.delete(items).where(eq(items.id, id)).returning();
  if (!row) throw new HttpError(404, "Not found.");
  if (row.imageKey) {
    // DB first, R2 second: a failed object delete never fails the request.
    await storage.remove(row.imageKey).catch((e) => console.warn("R2 delete failed:", row.imageKey, e));
  }
}
```

```ts
// src/routes/items.ts
import { Router, type Response } from "express";
import type { Deps } from "../app";
import { HttpError } from "../lib/errors";
import { parseId } from "../lib/utils";
import { requireAuth } from "../middleware/auth";
import { createItem, deleteItem, ItemIn, listItems } from "../services/item_services";

export function itemsRouter({ settings, db, storage }: Deps): Router {
  const router = Router();
  router.use(requireAuth(settings, "page"));

  async function renderList(res: Response, status: number, form: Record<string, unknown>, error: string | null) {
    res.status(status).render("items", { items: await listItems(db, storage), form, error });
  }

  router.get("/", async (_req, res) => {
    await renderList(res, 200, {}, null);
  });

  router.post("/", async (req, res) => {
    const form = { ...req.body, imageKey: req.body?.imageKey || null };
    const parsed = ItemIn.safeParse(form);
    if (!parsed.success) {
      await renderList(res, 422, form, parsed.error.issues[0]?.message ?? "Check the details.");
      return;
    }
    try {
      await createItem(db, storage, settings.IMAGE_MAX_BYTES, parsed.data);
    } catch (err) {
      if (err instanceof HttpError && err.status === 400) {
        await renderList(res, 400, form, err.message);
        return;
      }
      throw err;
    }
    res.redirect(303, "/items");
  });

  router.post("/:id/delete", async (req, res) => {
    await deleteItem(db, storage, parseId(req.params.id));
    res.redirect(303, "/items");
  });

  return router;
}
```

### A.7 Views and browser JS

`views/partials/head.ejs`:

```ejs
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><%= title %> · <%= appName %></title>
  <link rel="stylesheet" href="/css/app.css">
  <script src="/js/app.js" defer></script>
</head>
<body>
<header class="bar">
  <a class="brand" href="/"><%= appName %></a>
  <% if (email) { %>
    <form class="inline" method="post" action="/logout">
      <span><%= email %></span>
      <button type="submit">Sign out</button>
    </form>
  <% } %>
</header>
```

`views/partials/foot.ejs`:

```ejs
</body>
</html>
```

`views/login.ejs`:

```ejs
<%- include("partials/head", { title: "Sign in" }) %>
<main class="narrow">
  <h1>Sign in</h1>
  <% if (error) { %><p class="error" role="alert"><%= error %></p><% } %>
  <form method="post" action="/login">
    <input type="hidden" name="next" value="<%= next %>">
    <label>Email
      <input name="email" type="email" autocomplete="username" value="<%= prefill %>" required autofocus>
    </label>
    <label>Password
      <input name="password" type="password" autocomplete="current-password" required>
    </label>
    <button type="submit">Sign in</button>
  </form>
</main>
<%- include("partials/foot") %>
```

`views/error.ejs`:

```ejs
<%- include("partials/head", { title: String(status) }) %>
<main class="narrow">
  <h1><%= status %></h1>
  <p><%= message %></p>
  <p><a href="/">Back home</a></p>
</main>
<%- include("partials/foot") %>
```

`views/items.ejs`:

```ejs
<%- include("partials/head", { title: "Items" }) %>
<main>
  <h1>Items</h1>

  <form method="post" action="/items">
    <% if (error) { %><p class="error" role="alert"><%= error %></p><% } %>
    <label>Title <input name="title" value="<%= form.title || '' %>" required></label>
    <label>Notes <textarea name="body"><%= form.body || '' %></textarea></label>
    <label>Image
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" data-image-input>
    </label>
    <input type="hidden" name="imageKey" data-image-key>
    <p data-image-status aria-live="polite"></p>
    <button type="submit">Add</button>
  </form>

  <ul class="list">
    <% items.forEach((item) => { %>
      <li>
        <% if (item.imageUrl) { %><img src="<%= item.imageUrl %>" alt="" width="96" height="96"><% } %>
        <div>
          <strong><%= item.title %></strong>
          <p><%= item.body %></p>
        </div>
        <form method="post" action="/items/<%= item.id %>/delete" data-confirm="Delete this item?">
          <button type="submit">Delete</button>
        </form>
      </li>
    <% }) %>
  </ul>
</main>
<script src="/js/upload.js" defer></script>
<%- include("partials/foot") %>
```

`public/js/app.js`:

```js
// Confirm prompts without inline handlers (the CSP forbids them).
document.addEventListener("submit", (event) => {
  const message = event.target.dataset?.confirm;
  if (message && !window.confirm(message)) event.preventDefault();
});
```

`public/js/upload.js`:

```js
// Direct-to-R2 upload: sign (our server) → PUT (R2) → fill the hidden key field.
const input = document.querySelector("[data-image-input]");
if (input) {
  const keyField = document.querySelector("[data-image-key]");
  const status = document.querySelector("[data-image-status]");
  const submit = input.form.querySelector("button[type=submit]");

  input.addEventListener("change", async () => {
    const file = input.files[0];
    keyField.value = "";
    status.textContent = "";
    if (!file) return;

    submit.disabled = true;
    status.textContent = "Uploading…";
    try {
      const signRes = await fetch("/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      if (signRes.status === 401) {
        window.location.href = "/login";
        return;
      }
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Couldn't start the upload.");

      // Straight to R2: no cookies, and the same Content-Type that was signed.
      const put = await fetch(sign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("The image upload failed. Try again.");

      keyField.value = sign.key;
      status.textContent = "Image ready.";
    } catch (err) {
      input.value = "";
      status.textContent = err.message;
    } finally {
      submit.disabled = false;
    }
  });
}
```

### A.8 Tests, Dockerfile, CD

`test/helpers.ts` (shape):

```ts
import request from "supertest";
import { createApp } from "../src/app";
import { loadSettings, type Settings } from "../src/config";
import { createDb } from "../src/db/client";
import type { Storage, StoredObject } from "../src/services/storage";

export const testEnv = {
  DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
  APP_SECRET: "test-secret-test-secret-test-secret-123456",
  ADMIN_EMAIL: "owner@example.com",
  ADMIN_PASSWORD: "correct-horse-battery",
  COOKIE_SECURE: "false",
};

export const testSettings = (overrides: Record<string, string> = {}): Settings =>
  loadSettings({ ...testEnv, ...overrides });

export class FakeStorage implements Storage {
  readonly configured = true;
  objects = new Map<string, StoredObject>();
  removed: string[] = [];
  async createUploadUrl(key: string) {
    return `https://r2.test/upload/${key}`;
  }
  async head(key: string) {
    return this.objects.get(key) ?? null;
  }
  async readUrl(key: string) {
    return `https://r2.test/read/${key}`;
  }
  async remove(key: string) {
    this.removed.push(key);
    this.objects.delete(key);
  }
}

export function buildTestApp(overrides: Record<string, string> = {}) {
  const settings = testSettings(overrides);
  const { db } = createDb(settings.DATABASE_URL);
  const storage = new FakeStorage();
  return { app: createApp({ settings, db, storage }), settings, db, storage };
}

export async function loggedInAgent(app: Parameters<typeof request.agent>[0]) {
  const agent = request.agent(app);
  await agent
    .post("/login")
    .type("form")
    .send({ email: testEnv.ADMIN_EMAIL, password: testEnv.ADMIN_PASSWORD })
    .expect(303);
  return agent;
}
```

A representative auth test:

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp, testEnv } from "./helpers";

describe("login", () => {
  it("rejects a wrong password and sets no cookie", async () => {
    const { app } = buildTestApp();
    const res = await request(app)
      .post("/login")
      .type("form")
      .send({ email: testEnv.ADMIN_EMAIL, password: "nope-nope-nope" });
    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined();
    expect(res.text).toContain("Wrong email or password.");
  });

  it("ignores an off-site next target", async () => {
    const { app } = buildTestApp();
    const res = await request(app)
      .post("/login")
      .type("form")
      .send({ email: testEnv.ADMIN_EMAIL, password: testEnv.ADMIN_PASSWORD, next: "//evil.com" });
    expect(res.status).toBe(303);
    expect(res.headers.location).toBe("/");
  });

  it("redirects anonymous visitors to the login page", async () => {
    const { app } = buildTestApp();
    const res = await request(app).get("/items");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login?next=%2Fitems");
  });
});
```

`test/setup.ts` (shape): `beforeAll` throws if `TEST_DATABASE_URL` is empty or
equals `DATABASE_URL`, then runs `migrate()` against it; `afterEach` truncates
every table with `TRUNCATE ... RESTART IDENTITY CASCADE`. Register it with
`setupFiles` in `vitest.config.ts`.


---

*Adapted from the `solace-garden` blueprint. This version is a single Express
app with server-rendered EJS pages, one env-configured owner as the only user,
Neon Postgres through Drizzle, and Cloudflare R2 for images.*