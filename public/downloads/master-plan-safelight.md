# master-plan-safelight.md — Bootstrap blueprint: Next.js + Neon + R2 + Resend

This file is written for a coding agent starting **Safelight**, a small digital
photography marketplace. Feed it to the agent before the first line of code is
written. It is a single Next.js application: the public gallery, the admin
ledger, the order state machine, and the download gateway all live in one repo
and one deploy.

The app sells **one photograph at a time**, with **manual payment verification
through WhatsApp**, and delivers the original through a **private R2 bucket**
only after an order is paid.

---

## 0. How to use this document

### 0.1 Read first, build in order

1. Read this whole file once before writing code.
2. Collect the facts in §0.2 from the user. Do not invent values.
3. Build §3's phases **in order**. Each phase ends with a **Verify:** step.
   Do not start the next phase until the current one passes.
4. Keep every rule in §4. If a requirement seems to conflict with an invariant,
   stop and ask the user instead of breaking the invariant.
5. Deploy only after phase 10's checklist passes.

### 0.2 Facts to collect from the user before phase 1

| Fact | Used for |
| --- | --- |
| Shop name, one-line promise, sending domain | `BRAND_NAME`, page copy, `EMAIL_FROM`, Resend domain |
| Production domain | `PUBLIC_BASE_URL`, R2 CORS, email links |
| Shop WhatsApp number in E.164 without `+` | `WHATSAPP_NUMBER` |
| Payment instructions (bank transfer / DuitNow / etc.) | `PAYMENT_INSTRUCTIONS` |
| Admin email and a 12+ character password | `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only) |
| Neon pooled connection string + a second branch for tests | `DATABASE_URL`, `TEST_DATABASE_URL` |
| Cloudflare account id, R2 bucket name, R2 API token | `R2_*` |
| Resend API key | `RESEND_API_KEY` |
| Default currency | `DEFAULT_CURRENCY` (default `MYR`) |

Do not put real secrets in this document. They belong in `.env.local` locally
and in the hosting platform's environment store in production.

### 0.3 Scope discipline

- **One app.** No separate backend service, no client/server split.
- **No customer accounts.** A customer is an email address on an order.
- **No cart.** One photograph per order.
- **No Stripe / payment gateway in v1.** The manual WhatsApp workflow is the
  product. A gateway is a later extension.
- **No component library.** Build the editorial UI by hand.
- A new dependency not listed in §1 requires a reason. Prefer the platform.

---

## 1. Stack and why

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16.4 App Router, TypeScript strict** | Server Components for reads, Server Actions for mutations, Route Handlers for streams and signed URLs. One deploy. |
| Styling | **Tailwind CSS 4 + CSS variables, `next/font`** | Fast to build, but the design tokens keep it from looking templated. |
| Database | **Neon Postgres + Drizzle ORM + `pg`** | Orders need transactions. Neon's pooled connection works on Vercel; Drizzle keeps the schema and SQL explicit. |
| DB connection | `pg` Pool + `@vercel/functions` `attachDatabasePool` | Neon recommends TCP pooling on Vercel Fluid. Use the `-pooler` host. |
| Files | **Cloudflare R2**, one private bucket, two prefixes | `originals/` is private; `previews/` is public-safe but still served by the app. |
| Uploads | Presigned PUT from the browser | The server never handles the image bytes. Five-minute ticket. |
| Image processing | **`sharp`** in a Node Route Handler | Server-side watermark, resize, thumbnail, blur placeholder. Never trust the client. |
| Email | **Resend + React Email** | Transactional email with idempotency keys and a usable dashboard. |
| Auth | **Custom admin sessions**, Argon2id, opaque cookie | One admin, real sessions, revocation, no customer accounts. |
| Validation | **Zod** | Parse env, forms, and API inputs at the boundary. |
| Tests | **Vitest** + a separate Neon branch + fake storage/email | Test the use-cases, not the UI. |
| Hosting | **Vercel Pro** (commercial) + Neon integration | One origin; no CORS between app and API. Hobby is not for commercial use. |

Runtime dependencies: `next`, `react`, `react-dom`, `drizzle-orm`, `pg`,
`@vercel/functions`, `zod`, `@aws-sdk/client-s3`,
`@aws-sdk/s3-request-presigner`, `sharp`, `resend`,
`@react-email/components`, `@node-rs/argon2`, `server-only`.

Dev dependencies: `typescript`, `drizzle-kit`, `vitest`, `@types/node`,
`@types/pg`, `tailwindcss`, `@tailwindcss/postcss`.

---

## 2. Target repo layout

```text
safelight/
├─ src/
│  ├─ app/
│  │  ├─ (site)/
│  │  │  ├─ page.tsx
│  │  │  ├─ photographs/page.tsx
│  │  │  ├─ photographs/[slug]/page.tsx
│  │  │  ├─ order/[reference]/page.tsx
│  │  │  ├─ download/[token]/page.tsx
│  │  │  └─ licence/page.tsx
│  │  ├─ admin/
│  │  │  ├─ login/page.tsx
│  │  │  └─ (protected)/
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ photographs/page.tsx
│  │  │     ├─ photographs/new/page.tsx
│  │  │     ├─ photographs/[id]/page.tsx
│  │  │     ├─ orders/page.tsx
│  │  │     └─ orders/[id]/page.tsx
│  │  ├─ api/
│  │  │  ├─ health/route.ts
│  │  │  ├─ admin/uploads/presign/route.ts
│  │  │  ├─ previews/[...key]/route.ts
│  │  │  ├─ download/[token]/route.ts
│  │  │  └─ webhooks/resend/route.ts       # optional, phase 8+
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ not-found.tsx
│  │  └─ error.tsx
│  ├─ components/
│  │  ├─ site/
│  │  ├─ admin/
│  │  └─ ui/
│  ├─ db/
│  │  ├─ client.ts
│  │  ├─ schema.ts
│  │  ├─ migrations/
│  │  └─ seed.ts
│  ├─ lib/
│  │  ├─ auth/
│  │  ├─ storage/
│  │  ├─ email/
│  │  ├─ orders/
│  │  ├─ photos/
│  │  ├─ validation/
│  │  ├─ config.ts
│  │  ├─ money.ts
│  │  └─ logger.ts
│  ├─ emails/
│  │  └─ download-email.tsx
│  └─ proxy.ts
├─ drizzle.config.ts
├─ next.config.ts
├─ .env.example
├─ .env.local
├─ AGENTS.md
├─ master-plan-safelight.md
└─ tests/
```

Rules:

- `app/` contains routes, layouts, and thin adapters. No business logic.
- `lib/orders/` contains the use-cases. They accept a `deps` object so tests can
  pass a real DB and fake storage/email.
- `db/` contains the schema, client, migrations, and seed script.
- Never import server-only modules into a Client Component.

---

## 3. Build order

### Phase 1 — Scaffold and health

Create the Next.js app, TypeScript strict, Tailwind 4, `src/` directory.

- Add `src/lib/config.ts` with Zod-validated env. Import `server-only`.
  Refuse to boot if `DATABASE_URL`, `PUBLIC_BASE_URL`, `R2_*`, or
  `RESEND_API_KEY` are missing (except in tests, where fakes are injected).
- Add `/api/health` that runs `select 1` against Neon.
- Add `src/proxy.ts` (Next.js 16 renamed Middleware to Proxy). It may do an
  **optimistic** redirect for `/admin`, but it is **not** the authorization
  boundary.
- Add `.env.example` with every setting, documented, no real values.
- Add `AGENTS.md` with the invariants and the command list.

**Verify:** `npm run dev` boots; `/api/health` returns `{ ok: true, db: true }`;
a missing required env var fails with a clear message; `npm run build` passes.

### Phase 2 — Database, migrations, seed

Create the schema in §5 with Drizzle. Use `text` + `CHECK` constraints for
statuses, not native enums. Use integer minor units for money. Use `timestamptz`.

Generate migrations with `drizzle-kit generate`, **read the SQL**, then apply
with `drizzle-kit migrate`. Migrations are applied by hand, never by the deploy.

Seed one admin user and one draft photograph for local development.

**Verify:** a fresh Neon branch migrates from zero; inserting
`status = 'probably_paid'` fails; a negative price fails; two pending orders for
the same email + photograph are rejected; two active download tokens for one
order are rejected.

### Phase 3 — Admin auth

- `admin_users`, `admin_sessions`, `login_attempts`.
- Argon2id with explicit parameters: memory 19 MiB, time cost 2, parallelism 1.
- Login: generic error, constant-time-ish behavior (verify a dummy hash when the
  user is missing), DB-backed rate limit (8 failures / 15 minutes per email or
  IP hash).
- Session: 32 random bytes, base64url, SHA-256 hash stored in the DB. Cookie:
  `HttpOnly`, `SameSite=Lax`, `Secure` in production, 7 days.
- `requireAdmin()` for pages and `requireAdminAction()` for mutations. Use
  React `cache()` so a page does not query the session repeatedly.
- Logout is a POST that revokes the session row and clears the cookie.
- Password rotation: re-run the seed script; no password-reset flow in v1.

**Verify:** `/admin` redirects when logged out; a Server Action called directly
without a session is rejected; wrong password is generic; the 9th failure is
429; logout revokes; an expired session is rejected.

### Phase 4 — Public gallery

- `/` (home) and `/photographs` query only `status = 'published'`.
- `/photographs/[slug]` renders the watermarked preview, title, story, optional
  metadata, price, and the purchase form.
- Previews are served by `/api/previews/[...key]` from the private bucket with
  `Cache-Control: public, max-age=31536000, immutable`.
- Use responsive `<img srcset>` with generated thumb/preview variants. Do not
  rely on Next's remote image optimizer for private R2 objects.
- Add metadata, Open Graph, sitemap, robots. `noindex` the admin, order, and
  download routes.

**Verify:** a draft returns 404; the HTML contains no `original_key`; preview
images load through the app route; a photograph can be opened on mobile.

### Phase 5 — Upload and preview

1. `POST /api/admin/uploads/presign` (admin only) validates
   `{ filename, contentType, size }`, generates
   `originals/{photoId}/{uuid}.{ext}`, and returns a 5-minute presigned PUT.
2. The browser PUTs directly to R2 with `XMLHttpRequest` so progress is visible.
3. The client calls `finalizePhoto` with the key and metadata.
4. The server `HeadObject`s the key, then reads it with `sharp`:
   - allow JPEG, PNG, WebP only; reject SVG, GIF, HEIC, RAW in v1;
   - max 30 MB; max 100 MP; min 1200 × 800;
   - generate a 2000px watermarked preview and an 800px thumb (WebP);
   - generate a 20px blur data URL;
   - upload previews under `previews/{photoId}/...`;
   - insert the photograph row in a transaction.
5. If the DB insert fails, delete the previews and the original best-effort.
6. Publish/archive are explicit admin actions. Archive never deletes the
   original if orders exist.

**Verify:** a JPEG uploads and is watermarked; a PDF or SVG is rejected; a
draft is not in the gallery; archiving a photograph with a paid order still
allows the download.

### Phase 6 — Orders and WhatsApp

- The purchase form sends only `photographId` and `email`.
- `createOrder` reads `price_cents` and `currency` from the photograph row,
  where `status = 'published'`, and snapshots both into the order.
- Generate a human reference like `SF-7K3M9Q2X` (Crockford base32, 50+ bits).
  Retry on collision.
- If a pending order already exists for the same normalized email + photograph,
  return that order instead of creating a duplicate.
- Redirect to `/order/[reference]`, which shows the receipt, the WhatsApp
  button, payment instructions, and the “I've paid” claim.
- The WhatsApp link is `https://wa.me/{WHATSAPP_NUMBER}?text=...` with the
  reference, title, price, and a request for payment instructions.
- `claimPayment` sets `payment_claimed_at` and `payment_claim_note`. It **does
  not** change `status`.

**Verify:** changing the photograph price after order creation leaves the order
amount unchanged; submitting the same email + photo twice returns one pending
order; the claim leaves the status `pending_payment`; the WhatsApp text contains
the reference and price.

### Phase 7 — Admin order desk

- List orders with filters: pending, paid, cancelled, refunded, email failed.
- Search by reference or email.
- Order detail shows the snapshot price, customer email, claims, email attempts,
  token status, and an append-only timeline.
- `markOrderPaid` is a conditional update:
  `UPDATE orders SET status='paid', paid_at=now() WHERE id=$1 AND status='pending_payment'`.
  If no row changes, return the current status; if already paid, it is a
  successful no-op, not a second email.
- Create the download token in the same transaction as the paid transition.
- Insert an `order_events` row for every transition.
- `cancelOrder` only from pending. `refundOrder` only from paid and revokes
  active tokens.
- Allow the admin to correct a customer email before a retry; audit it.

**Verify:** double-clicking “Mark paid” produces one paid event and one token;
a cancelled order cannot be marked paid; a refund revokes the token; the
timeline shows every action.

### Phase 8 — Email and download

- Generate a 32-byte raw token, show it only in the email, store SHA-256.
- Token TTL: 14 days. One active token per order (partial unique index).
- Email send is claim-then-send:
  1. `UPDATE orders SET email_status='sending', email_last_attempt_at=now(),
     email_attempts=email_attempts+1 WHERE id=$1 AND status='paid' AND
     (email_status IN ('not_sent','failed') OR
      (email_status='sending' AND email_last_attempt_at < now() - interval '5 minutes'))`.
  2. If no row, stop (already sent or in progress).
  3. Send through Resend with `Idempotency-Key: download-email/{orderId}/{tokenId}`.
  4. On success: `email_status='sent'`, `email_sent_at`, `email_message_id`.
  5. On failure: `email_status='failed'`, `email_last_error` (sanitized).
  6. Insert an event either way.
- The email links to `${PUBLIC_BASE_URL}/download/{rawToken}`.
- `/download/[token]` validates the hash, revocation, expiry, and order paid.
  It renders a page with a **Download original** button.
- `/api/download/[token]` validates again, increments `use_count`/`last_used_at`,
  signs a 5–10 minute R2 GET URL with a nice `Content-Disposition`, and
  redirects. Set `Cache-Control: no-store`, `Referrer-Policy: no-referrer`,
  `X-Robots-Tag: noindex`.
- The admin cannot retrieve the raw token. They can resend the same link or
  revoke it and issue a new one.

**Verify:** no email is sent before paid; a failed email leaves the order paid
and retryable; the DB never contains the raw token; an expired or revoked token
returns a generic denial; the signed URL expires; a refund blocks future
downloads; an already-downloaded file cannot be taken back.

### Phase 9 — Tests and failure drills

Use Vitest against `TEST_DATABASE_URL` (a separate Neon branch). Truncate tables
between tests. Provide fake storage and email adapters.

Test at least:

- price snapshot survives a price change;
- duplicate pending order is reused;
- `markOrderPaid` is idempotent;
- email is not sent before paid;
- email failure leaves the order paid;
- retry after failure sends once;
- raw token is not stored;
- expired token is denied;
- revoked token is denied;
- refund revokes the token;
- unpublishing/archiving a photo does not break a paid download;
- unauthorized admin action is rejected.

**Verify:** the suite is green on a clean test branch; the failure drills pass
in the UI as well as in code.

### Phase 10 — Deploy and harden

- Vercel Pro, Neon integration, R2 bucket, Resend verified domain.
- Set every env var in production and preview. Use a separate Neon branch or
  database for previews.
- R2 CORS allows `PUT` from the production domain and `http://localhost:3000`.
- Run migrations by hand against production, then seed the admin.
- Set security headers: `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`, HSTS.
- Log order reference and status only. Never log tokens, passwords, cookies, or
  full customer emails.
- Test the full workflow with a real email and a real R2 object.

**Verify:** the production end-to-end flow works; a paid order downloads; an
expired link is denied; the health check is green; logs contain no secrets; the
Vercel plan is appropriate for commercial use.

---

## 4. Hard invariants

1. **The price comes from the database.** The client never sends a price.
2. **Only the admin can mark an order paid.** A customer's claim is recorded,
   not trusted.
3. **No email before the order is paid.** Payment status and email status are
   separate.
4. **`paid` is a one-way door.** It can become `refunded`, never back to
   `pending_payment`.
5. **The original is never public.** Only a signed, short-lived R2 GET URL can
   read it after a token + paid check.
6. **The raw download token is never stored or logged.** The DB stores a hash.
7. **Authorization happens inside every Server Action and Route Handler.** A
   protected layout or `proxy.ts` is only a UX convenience.
8. **A photograph with orders is never hard-deleted.** Archive it; keep the
   original for paid customers.
9. **Money is integer minor units.** Never use floats for prices.
10. **Every state transition is conditional and audited.** Double-clicks and
    retries must be idempotent.

---

## 5. Data model

### photographs

| Column | Type / rule |
| --- | --- |
| `id` | uuid primary key |
| `slug` | text unique, not null |
| `title` | text not null |
| `description` | text not null default `''` |
| `alt_text` | text not null default `''` |
| `price_cents` | integer not null, `>= 0` |
| `currency` | char(3) not null |
| `preview_key` | text not null |
| `thumb_key` | text not null |
| `blur_data_url` | text |
| `original_key` | text not null |
| `original_filename` | text not null |
| `original_mime` | text not null |
| `original_bytes` | integer not null |
| `width`, `height` | integer not null |
| `location` | text |
| `captured_year` | integer |
| `camera` | text |
| `status` | text `draft | published | archived` |
| `published_at` | timestamptz |
| `created_at`, `updated_at` | timestamptz |

Constraints: unique slug; `price_cents >= 0`; `status <> 'published' OR
published_at IS NOT NULL`.

### orders

| Column | Type / rule |
| --- | --- |
| `id` | uuid primary key |
| `reference` | text unique, not null |
| `photograph_id` | uuid references photographs(id) on delete restrict |
| `customer_email` | text not null, lowercased |
| `price_cents` | integer not null |
| `currency` | char(3) not null |
| `status` | text `pending_payment | paid | cancelled | refunded` |
| `email_status` | text `not_sent | sending | sent | failed` |
| `email_attempts` | integer not null default 0 |
| `email_last_attempt_at` | timestamptz |
| `email_sent_at` | timestamptz |
| `email_message_id` | text |
| `email_last_error` | text |
| `paid_at` | timestamptz |
| `cancelled_at` | timestamptz |
| `refunded_at` | timestamptz |
| `payment_claimed_at` | timestamptz |
| `payment_claim_note` | text |
| `admin_note` | text |
| `created_at`, `updated_at` | timestamptz |

Rules:

- `status = 'paid'` requires `paid_at IS NOT NULL`.
- Partial unique index: one pending order per normalized email + photograph:
  ```sql
  create unique index orders_one_pending_per_email_photo
  on orders (lower(customer_email), photograph_id)
  where status = 'pending_payment';
  ```
- Snapshot `price_cents` and `currency` at creation.
- Index `(status, created_at desc)` and `(customer_email)`.

### download_tokens

| Column | Type / rule |
| --- | --- |
| `id` | uuid primary key |
| `order_id` | uuid references orders(id) on delete cascade |
| `token_hash` | text unique, not null |
| `expires_at` | timestamptz not null |
| `revoked_at` | timestamptz |
| `last_used_at` | timestamptz |
| `use_count` | integer not null default 0 |
| `created_at` | timestamptz |

Partial unique index: one active token per order:
```sql
create unique index download_tokens_one_active_per_order
on download_tokens (order_id)
where revoked_at is null;
```

### order_events

Append-only audit trail:

`id bigserial`, `order_id uuid`, `type text` (`created`, `payment_claimed`,
`payment_confirmed`, `email_sent`, `email_failed`, `email_retry`,
`link_reissued`, `cancelled`, `refunded`, `downloaded`), `actor text`
(`customer | admin | system`), `metadata jsonb`, `created_at timestamptz`.

Never put raw tokens or full emails in `metadata`.

### admin_users / admin_sessions / login_attempts

- `admin_users`: id, email unique, password_hash, display_name, disabled_at,
  timestamps.
- `admin_sessions`: id, user_id, token_hash unique, expires_at, last_seen_at,
  revoked_at, ip_hash, user_agent.
- `login_attempts`: id, email, ip_hash, succeeded, created_at. Used for the
  DB-backed rate limit. No raw IPs.

---

## 6. Key flows and code sketches

### 6.1 Create an order

```ts
const photo = await db.query.photographs.findFirst({
  where: and(eq(photographs.id, photoId), eq(photographs.status, "published")),
});
if (!photo) return { ok: false, error: "This photograph is no longer available." };

const reference = makeReference();
const inserted = await db
  .insert(orders)
  .values({
    reference,
    photographId: photo.id,
    customerEmail: email.toLowerCase(),
    priceCents: photo.priceCents,
    currency: photo.currency,
    status: "pending_payment",
  })
  .onConflictDoNothing()
  .returning();

if (inserted.length === 0) {
  const existing = await findPendingOrder(email, photoId);
  if (existing) return { ok: true, order: existing };
  throw new Error("Order conflict");
}
```

### 6.2 Mark paid exactly once

```ts
return db.transaction(async (tx) => {
  const [paid] = await tx
    .update(orders)
    .set({ status: "paid", paidAt: now, updatedAt: now })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")))
    .returning();

  if (!paid) {
    const current = await tx.query.orders.findFirst({ where: eq(orders.id, orderId) });
    if (current?.status === "paid") return { ok: true, already: true };
    return { ok: false, error: `Cannot pay a ${current?.status} order.` };
  }

  const token = await createToken(tx, orderId, now);
  await tx.insert(orderEvents).values({
    orderId,
    type: "payment_confirmed",
    actor: "admin",
    metadata: { reference: paid.reference },
  });
  return { ok: true, order: paid, token };
});
```

Send the email **after** the transaction commits. A failed email never rolls
back the payment.

### 6.3 Claim an email send

```ts
const [claimed] = await db
  .update(orders)
  .set({
    emailStatus: "sending",
    emailLastAttemptAt: now,
    emailAttempts: sql`${orders.emailAttempts} + 1`,
  })
  .where(
    and(
      eq(orders.id, orderId),
      eq(orders.status, "paid"),
      or(
        inArray(orders.emailStatus, ["not_sent", "failed"]),
        and(
          eq(orders.emailStatus, "sending"),
          lt(orders.emailLastAttemptAt, new Date(now.getTime() - 5 * 60_000)),
        ),
      ),
    ),
  )
  .returning();
if (!claimed) return { ok: true, skipped: true };
```

Use `Idempotency-Key: download-email/{orderId}/{tokenId}` on the Resend call.

### 6.4 Validate a download and sign a URL

```ts
const hash = sha256(rawToken);
const row = await db.query.downloadTokens.findFirst({
  where: eq(downloadTokens.tokenHash, hash),
  with: { order: true },
});
if (!row) return deny();
if (row.revokedAt) return deny();
if (row.expiresAt <= now) return deny();
if (row.order.status !== "paid") return deny();

const url = await getSignedUrl(
  r2,
  new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: row.order.photograph.originalKey,
    ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
    ResponseContentType: "application/octet-stream",
  }),
  { expiresIn: 300 },
);
```

Return a **generic** denial page for every failure. Do not reveal whether the
token existed, which order it belonged to, or why it failed.

### 6.5 Generate the preview

```ts
const original = await r2.send(new GetObjectCommand({ Bucket, Key: key }));
const watermarked = await sharp(await toBuffer(original.Body))
  .rotate()
  .resize({ width: 2000, withoutEnlargement: true })
  .composite([{ input: watermarkTile, tile: true, blend: "over" }])
  .webp({ quality: 82 })
  .toBuffer();
```

Also generate the 800px thumb and a 20px blur placeholder. Store the keys, not
the files, in Postgres.

---

## 7. Environment variables

```env
# App
PUBLIC_BASE_URL=http://localhost:3000
BRAND_NAME=Safelight
DEFAULT_CURRENCY=MYR
WATERMARK_TEXT=© Safelight · Preview

# Database
DATABASE_URL=postgresql://...-pooler...
TEST_DATABASE_URL=postgresql://...   # separate Neon branch

# Admin seed (ADMIN_PASSWORD is used by the seed script only)
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM="Safelight <studio@mail.yourdomain.com>"
EMAIL_REPLY_TO=you@example.com
DISABLE_EMAIL_SENDS=false

# WhatsApp / payment
WHATSAPP_NUMBER=60123456789
PAYMENT_INSTRUCTIONS=Bank transfer to ... / DuitNow QR ...

# R2 (one private bucket)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=safelight

# Optional
RESEND_WEBHOOK_SECRET=
```

- `ADMIN_PASSWORD` is not read by the runtime app. It is only used by
  `npm run seed:admin`. Remove it from the production runtime env after seeding.
- `DISABLE_EMAIL_SENDS=true` in preview deployments prevents accidental email.
- Use `PUBLIC_BASE_URL` explicitly for email links. Do not rely on
  `VERCEL_URL`; it changes per deployment.

---

## 8. Definition of done

The project is done when all of these pass:

- [ ] A visitor can browse only published photographs and never sees an original key.
- [ ] A purchase form with an invalid email is rejected on the server.
- [ ] The order price is snapshotted; a later price change does not alter it.
- [ ] Re-submitting the same email + photograph returns the same pending order.
- [ ] The WhatsApp button opens a prefilled message with the reference, title, and price.
- [ ] “I've paid” records a claim but leaves the order `pending_payment`.
- [ ] Only the admin can mark an order paid.
- [ ] Double-clicking “Mark paid” produces one paid transition and one email.
- [ ] No email is sent before paid.
- [ ] A failed email leaves the order paid and can be retried without duplicating.
- [ ] The download token is hashed in the DB; the raw token appears only in the email.
- [ ] An expired or revoked token is denied with a generic page.
- [ ] A refund revokes future downloads.
- [ ] Unpublishing or archiving a photograph does not break a paid download.
- [ ] A logged-out Server Action is rejected, not just hidden.
- [ ] The production deployment completes the full workflow with real email and R2.
- [ ] Logs contain order references, not tokens or full customer emails.

---

## 9. Footguns

| Footgun | Rule |
| --- | --- |
| Trusting a client-submitted price | Read the price from the DB and snapshot it. |
| Sending email when marking paid | Mark paid first, commit, then send. A failure is recorded, not rolled back. |
| Double-clicking “Mark paid” | Conditional `UPDATE ... WHERE status='pending_payment'`; make the second click a no-op. |
| Storing the raw download token | Store SHA-256; put the raw value only in the email. |
| Using the order reference as authorization | The reference is human-readable. The download token is the secret. |
| A public R2 bucket for originals | Use one private bucket; serve previews through the app; sign original GETs. |
| Deleting a photo with orders | Archive it; `on delete restrict`. Paid customers keep access. |
| Relying on `proxy.ts` or a layout for auth | Authorize inside every action and route handler. |
| Logging tokens or emails | Log order reference and status only. Redact everything else. |
| Letting the email link point at R2 | Link to the app; the app mints a fresh signed URL after checking the token and order. |
| Reusing a signed URL forever | Sign for 5–10 minutes; never store the signed URL. |
| Watermarking on the client | The client can bypass it. Use `sharp` on the server. |
| Accepting any file type | Allow JPEG/PNG/WebP; validate with `sharp`, not just `Content-Type`. |
| Loading a 100 MP image into `sharp` | Set `limitInputPixels` and a 30 MB upload cap. |
| Putting Vercel Hobby on a commercial shop | Hobby is for non-commercial use. Use Pro or another host. |
| Using an unverified Resend domain | Verify SPF/DKIM; use a real sending subdomain. |
| Assuming a refund un-downloads the file | It cannot. Revoke future access and say so in the UI. |
| Storing money as a float | Store integer cents; format with `Intl.NumberFormat`. |

---

## 10. Deployment checklist

1. Create the Vercel project and connect the Neon integration.
2. Create the R2 bucket. Keep it private. Create a scoped API token.
3. Configure R2 CORS for `http://localhost:3000` and the production origin,
   `PUT`, `Content-Type`, expose `ETag`.
4. Verify the sending domain in Resend. Set `EMAIL_FROM` to that domain.
5. Set all env vars for Production and Preview. Use a separate Neon branch for
   previews.
6. Run `npm run db:migrate` by hand against production. Never in the build.
7. Run `npm run seed:admin` once. Remove `ADMIN_PASSWORD` from the runtime env.
8. Deploy. Visit `/api/health`. Log in. Upload a real photograph. Publish it.
9. Buy it with a real email. Send the WhatsApp message. Mark it paid.
10. Confirm the email arrives, the download page works, and the signed URL
    expires. Then refund a test order and confirm the link is revoked.
11. Check logs for secrets. Check the 404, expired-link, and email-failure
    pages. Run the boss fight one more time.

---

## 11. Extensions (do not build in v1)

- Stripe / FPX / DuitNow Online checkout, keeping the same order state machine.
- Customer order lookup via a magic link.
- Collections/series and filtering.
- Coupons and gift codes.
- Resend delivery webhooks (`delivered`, `bounced`, `complained`).
- Cleanup job for orphaned R2 uploads and expired sessions/tokens.
- Multiple admin roles.
- RAW/HEIC support and print fulfillment.
- A real watermark logo upload.

Every extension must keep the invariants in §4. If it cannot, it is a different
project.
