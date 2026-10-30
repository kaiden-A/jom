# master-plan-kedai.md — Bootstrap blueprint: Next.js + Neon + R2 + Resend

This file is written for a coding agent starting **Kedai**, a one-person
marketplace for physical, one-of-one items. Feed it to the agent before the
first line of code is written. It is a single Next.js application: the public
shelf, the owner's back room, the reservation state machine, photo uploads, and
the WhatsApp handoff all live in one repo and one deploy.

The shop sells **one item at a time**, holds it for **24 hours** after a buyer
reserves it, and arranges payment and handover **manually through WhatsApp**.
There are no customer accounts, no cart, and no online payment in v1.

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
| Shop name, one-line promise, seller display name | `SHOP_NAME`, page copy, `EMAIL_FROM` |
| Production domain | `PUBLIC_BASE_URL`, R2 CORS, email links |
| Shop WhatsApp number in E.164 without `+` | `WHATSAPP_NUMBER` |
| Pickup location and pickup instructions | `SHOP_LOCATION`, `PICKUP_INSTRUCTIONS` |
| Seller notification email | `SHOP_EMAIL` |
| Admin email and a 12+ character password | `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only) |
| Neon pooled connection string + a second branch for tests | `DATABASE_URL`, `TEST_DATABASE_URL` |
| Cloudflare account id, R2 bucket name, R2 API token, public bucket URL | `R2_*` |
| Resend API key and a verified sending domain | `RESEND_API_KEY`, `EMAIL_FROM` |
| Default currency | `DEFAULT_CURRENCY` (default `MYR`) |
| Reservation window in hours | `RESERVATION_HOURS` (default `24`) |

Do not put real secrets in this document. They belong in `.env.local` locally
and in the hosting platform's environment store in production.

### 0.3 Scope discipline

- **One app.** No separate backend service, no client/server split.
- **One seller.** This is a personal shop, not a multi-vendor marketplace.
- **No customer accounts.** A buyer is a name and an email on a reservation.
- **No cart.** One reservation per item. An item is one of one.
- **No online payment in v1.** The manual WhatsApp handover is the product.
- **No component library.** Build the shop UI by hand.
- A new dependency not listed in §1 requires a reason. Prefer the platform.

---

## 1. Stack and why

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16.4 App Router, TypeScript strict** | Server Components for reads, Server Actions for mutations, Route Handlers for uploads and cron. One deploy. |
| Styling | **Tailwind CSS 4 + CSS variables, `next/font`** | Fast to build, but the design tokens keep it from looking templated. |
| Database | **Neon Postgres + Drizzle ORM + `pg`** | Reservations need transactions and a partial unique index. Neon's pooled connection works on Vercel; Drizzle keeps the schema and SQL explicit. |
| DB connection | `pg` Pool + `@vercel/functions` `attachDatabasePool` | Neon recommends TCP pooling on Vercel Fluid. Use the `-pooler` host. |
| Files | **Cloudflare R2**, one bucket for item photos | The photos are public marketing. The back room is private through auth, not through file secrecy. |
| Uploads | Presigned PUT from the browser | The server never handles the original bytes. Five-minute ticket. |
| Image processing | **`sharp`** in a Node Route Handler or Server Action | Generate display and card variants, strip EXIF/GPS, and create a blur placeholder. Never trust the client. |
| Email | **Resend + React Email** | A buyer receipt and a seller alert with idempotency keys and a usable dashboard. |
| Auth | **Custom admin sessions**, Argon2id, opaque cookie | One admin, real sessions, revocation, no customer accounts. |
| Validation | **Zod** | Parse env, forms, and API inputs at the boundary. |
| Tests | **Vitest** + a separate Neon branch + fake storage/email | Test the use-cases, not the UI. |
| Hosting | **Vercel** + Neon integration | One origin; no CORS between app and API. R2 is the only file store. |
| Cron | **Vercel Cron** + a lazy expiry fallback | Expiry must work even if the cron is late. |

Runtime dependencies: `next`, `react`, `react-dom`, `drizzle-orm`, `pg`,
`@vercel/functions`, `zod`, `@aws-sdk/client-s3`,
`@aws-sdk/s3-request-presigner`, `sharp`, `resend`,
`@react-email/components`, `@node-rs/argon2`, `server-only`.

Dev dependencies: `typescript`, `drizzle-kit`, `vitest`, `@types/node`,
`@types/pg`, `tailwindcss`, `@tailwindcss/postcss`.

---

## 2. Target repo layout

```text
kedai/
├─ src/
│  ├─ app/
│  │  ├─ (site)/
│  │  │  ├─ page.tsx                      # the shelf
│  │  │  ├─ items/[slug]/page.tsx         # the item
│  │  │  ├─ reservation/[reference]/page.tsx
│  │  │  └─ about/page.tsx                # optional seller page
│  │  ├─ admin/
│  │  │  ├─ login/page.tsx
│  │  │  └─ (protected)/
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ items/page.tsx
│  │  │     ├─ items/new/page.tsx
│  │  │     ├─ items/[id]/page.tsx
│  │  │     ├─ reservations/page.tsx
│  │  │     └─ reservations/[id]/page.tsx
│  │  ├─ api/
│  │  │  ├─ health/route.ts
│  │  │  ├─ admin/uploads/presign/route.ts
│  │  │  └─ cron/expire-reservations/route.ts
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
│  │  ├─ reservations/
│  │  ├─ items/
│  │  ├─ validation/
│  │  ├─ config.ts
│  │  ├─ money.ts
│  │  ├─ references.ts
│  │  └─ logger.ts
│  ├─ emails/
│  │  ├─ reservation-receipt.tsx
│  │  └─ seller-alert.tsx
│  └─ proxy.ts
├─ drizzle.config.ts
├─ next.config.ts
├─ .env.example
├─ .env.local
├─ AGENTS.md
├─ master-plan-kedai.md
└─ tests/
```

Rules:

- `app/` contains routes, layouts, and thin adapters. No business logic.
- `lib/reservations/` contains the use-cases. They accept a `deps` object so
  tests can pass a real DB and fake storage/email.
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

Seed three draft items for local development. The admin seed waits for phase 3,
because the admin tables do not exist yet.

**Verify:** a fresh Neon branch migrates from zero; inserting
`status = 'probably_sold'` fails; a negative price fails; two pending
reservations for the same item are rejected; a confirmed reservation without
`confirmed_at` fails.

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
- Seed the admin user now that the tables exist. Password rotation: re-run the
  seed script; no password-reset flow in v1.

**Verify:** `/admin` redirects when logged out; a Server Action called directly
without a session is rejected; wrong password is generic; the 9th failure is
429; logout revokes; an expired session is rejected.

### Phase 4 — The public shelf

- `/` queries only `status IN ('available', 'reserved', 'sold')` and
  `published_at IS NOT NULL`, never `draft` or `archived`.
- `/items/[slug]` renders the photos, title, condition, price, seller note, and
  the reservation form when the item is available.
- The item page shows a `Reserved` state with the hold window and a `Sold` stamp.
  It never shows buyer details.
- Use responsive `<img srcset>` from the R2 variants. Use `next/image` with the
  R2 public host in `images.remotePatterns`, or plain `<img>` with `srcset`.
- Add metadata and Open Graph tags. `noindex` the admin and reservation routes.
  The item page is indexable; the reservation receipt is not.
- Add a share button that copies the item URL.
- Empty state: a quiet shelf with “Nothing on the shelf right now.”

**Verify:** a draft returns 404; an archived item returns 404; a reserved item
shows the hold state and no form; a sold item shows the stamp; the HTML contains
no buyer email; the item link has an OG image.

### Phase 5 — Photos and uploads

1. `POST /api/admin/uploads/presign` (admin only) validates
   `{ itemId, filename, contentType, size }`, generates
   `items/{itemId}/staging/{uuid}.{ext}`, and returns a 5-minute presigned PUT.
2. The browser PUTs directly to R2 with `XMLHttpRequest` so progress is visible.
3. The client calls `finalizePhoto` with the key and alt text.
4. The server `HeadObject`s the key, then reads it with `sharp`:
   - allow JPEG, PNG, WebP only; reject SVG, GIF, HEIC, RAW in v1;
   - max 20 MB; max 80 MP; min 800 × 600;
   - auto-rotate, then strip EXIF/GPS by re-encoding;
   - generate a 1600px display WebP and an 800px card WebP;
   - generate a 24px blur data URL;
   - upload the variants under `items/{itemId}/{photoId}/...`;
   - insert the `item_photos` row in a transaction;
   - delete the staging object best-effort.
5. The first photo becomes the cover (position 0). The admin can reorder photos.
6. Replacing or deleting a photo deletes the old R2 objects best-effort. Never
   delete an item with reservations; archive it.

**Verify:** a JPEG uploads and produces two variants; a PDF or SVG is rejected; a
photo with GPS EXIF loses the GPS data; a draft is not on the shelf; archiving
an item keeps its reservation history.

### Phase 6 — Reservations and WhatsApp

- The reservation form sends only `itemId`, `name`, `email`, optional `phone`,
  `fulfilment`, and `note`. It never sends a price.
- `createReservation` reads `price_cents` and `currency` from the item row,
  where `status = 'available'`, and snapshots both into the reservation.
- Generate a human reference like `KD-7K3M9Q2X` (Crockford base32, 50+ bits).
  Retry on collision.
- Lock the item row with `SELECT ... FOR UPDATE` and check `status =
  'available'` inside the transaction. Update the item to `reserved` and insert
  the reservation in the same transaction. The partial unique index is the
  second guard.
- If another buyer won the race, return “Someone just reserved this item” and
  show the reserved state. Do not create a second pending reservation.
- Redirect to `/reservation/[reference]`, which shows the receipt, the WhatsApp
  button, the hold window, and the “I've paid” claim.
- The WhatsApp link is `https://wa.me/{WHATSAPP_NUMBER}?text=...` with the
  reference, title, price, and handover preference.
- `claimPayment` sets `claimed_paid_at` and `claim_note`. It **does not** change
  `status`.
- Expiry: `expireReservations()` marks pending reservations with
  `expires_at <= now()` as `expired` and returns their items to `available`.
  Call it from `/api/cron/expire-reservations` (protected by `CRON_SECRET`) and
  lazily before the shelf and item queries.

**Verify:** changing the item price after reservation creation leaves the
reservation amount unchanged; two concurrent reservations produce exactly one
pending row; the claim leaves the status `pending`; the WhatsApp text contains
the reference and price; a reservation past `expires_at` releases the item.

### Phase 7 — The back room

- `/admin` shows counts: available, reserved, sold, pending holds, expiring soon.
- `/admin/items` lists items with filters: draft, available, reserved, sold,
  archived. Create/edit/publish/archive.
- `/admin/items/new` creates a draft, then accepts photos.
- `/admin/items/[id]` shows the item, photos, and reservation history.
- `/admin/reservations` lists reservations with filters: pending, confirmed,
  cancelled, expired, claimed, email failed.
- `/admin/reservations/[id]` shows the buyer, snapshot price, claim, email
  attempts, and an append-only timeline.
- `confirmSale` is a conditional update inside a transaction:
  - lock the reservation row;
  - if already `confirmed`, return success as a no-op;
  - if not `pending` or `expires_at <= now()`, reject;
  - update the item to `sold` where it is still `reserved`;
  - update the reservation to `confirmed` with `confirmed_at`;
  - insert a `sale_confirmed` event.
- `cancelReservation` only from `pending`; it returns the item to `available`.
- `extendReservation` only from `pending`; it adds the reservation window
  (default 24 hours) and inserts an `extended` event.
- `archiveItem` only changes `status` to `archived`; it never deletes a row with
  reservations. Items with no reservations may be deleted.
- Allow the admin to correct a buyer email before a retry; audit it.

**Verify:** double-clicking “Confirm sale” produces one confirmed event and one
sold item; a cancelled or expired reservation cannot be confirmed; extending a
hold moves `expires_at`; archiving an item keeps its history; an unauthorized
action is rejected.

### Phase 8 — Email and receipts

- The buyer receipt email is sent after a reservation is created. A sale
  confirmation is visible on the live receipt; a second email is an extension.
  The seller alert is sent when a reservation is created.
- Email send is claim-then-send:
  1. `UPDATE reservations SET email_status='sending',
     email_attempts=email_attempts+1, email_last_attempt_at=now()
     WHERE id=$1 AND status IN ('pending','confirmed')
     AND (email_status IN ('not_sent','failed')
     OR (email_status='sending' AND email_last_attempt_at < now() - interval '5 minutes'))`.
  2. If no row, stop (already sent or in progress).
  3. Send through Resend with `Idempotency-Key: reservation-receipt/{id}`.
  4. On success: `email_status='sent'`, `email_sent_at`, `email_message_id`.
  5. On failure: `email_status='failed'`, `email_last_error` (sanitized).
  6. Insert an event either way.
- The receipt email links to `${PUBLIC_BASE_URL}/reservation/{reference}`.
- `/reservation/[reference]` shows the item, snapshot price, status, first name,
  masked email, hold window, and WhatsApp button. It never shows the phone
  number or full email.
- A failed email never changes `status`. The reservation is still pending or
  confirmed.
- The seller alert is best-effort; the admin dashboard is the source of truth.

**Verify:** no email is sent before the reservation exists; a failed email leaves
the reservation pending or confirmed; retry after failure sends once; the email
link opens the live receipt; the receipt contains no full email or phone.

### Phase 9 — Tests and failure drills

Use Vitest against `TEST_DATABASE_URL` (a separate Neon branch). Truncate tables
between tests. Provide fake storage and email adapters.

Test at least:

- price snapshot survives a price change;
- two concurrent reservations produce one pending row;
- a reservation past `expires_at` releases the item;
- `confirmSale` is idempotent;
- a cancelled reservation cannot be confirmed;
- an expired reservation cannot be confirmed;
- confirming a sale marks the item sold exactly once;
- a failed email leaves the reservation pending or confirmed;
- retry after failure sends once;
- archiving an item with history does not delete it;
- an unauthorized admin action is rejected;
- the public receipt does not leak the full email or phone;
- the upload rejects a non-image and strips GPS EXIF.

**Verify:** the suite is green on a clean test branch; the failure drills pass
in the UI as well as in code.

### Phase 10 — Deploy and harden

- Vercel, Neon integration, R2 bucket, Resend verified domain.
- Set every env var in production and preview. Use a separate Neon branch or
  database for previews.
- R2 CORS allows `PUT` from the production domain and `http://localhost:3000`.
- Run migrations by hand against production, then seed the admin.
- Configure the Vercel Cron for `/api/cron/expire-reservations` every 5 minutes.
- Add a DB-backed rate limit to the reservation form (for example, max 5
  reservations per hashed IP per 10 minutes) and a honeypot field.
- Set security headers: `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`, HSTS.
- Log reservation reference and status only. Never log passwords, cookies, full
  emails, phone numbers, or raw IPs.
- Test the full workflow with a real email and a real R2 object.

**Verify:** the production end-to-end flow works; a reservation can be made and
confirmed; an expired hold releases the item; the receipt email arrives; the
health check is green; logs contain no secrets; the cron runs.

---

## 4. Hard invariants

1. **The price comes from the database.** The client never sends a price.
2. **One item has at most one pending reservation.** The database enforces it
   with a partial unique index.
3. **Only the admin can confirm a sale.** A buyer's claim is recorded, not
   trusted.
4. **An expired reservation releases the item.** Expiry works from the cron and
   from a lazy check, because a cron can be late.
5. **A sold item is a one-way door for that reservation.** A confirmed
   reservation is never confirmed twice.
6. **Authorization happens inside every Server Action and Route Handler.** A
   protected layout or `proxy.ts` is only a UX convenience.
7. **An item with reservations is never hard-deleted.** Archive it; keep the
   history.
8. **Photos are public, but the back room is not.** The photos are marketing.
   The mutations are the private part.
9. **Money is integer minor units.** Never use floats for prices.
10. **Every state transition is conditional and audited.** Double-clicks and
    retries must be idempotent.

---

## 5. Data model

### items

| Column | Type / rule |
| --- | --- |
| `id` | uuid primary key |
| `slug` | text unique, not null |
| `title` | text not null |
| `description` | text not null default `''` |
| `condition` | text `new | like_new | good | fair | for_parts` |
| `category` | text not null default `'other'` |
| `price_cents` | integer not null, `>= 0` |
| `currency` | char(3) not null |
| `status` | text `draft | available | reserved | sold | archived` |
| `published_at` | timestamptz |
| `sold_at` | timestamptz |
| `archived_at` | timestamptz |
| `created_at`, `updated_at` | timestamptz |

Constraints: unique slug; `price_cents >= 0`; `condition` valid; `status`
valid; `status <> 'available'` is not required to be published, but a public
query must require `published_at IS NOT NULL`; `sold` requires `sold_at`;
`archived` requires `archived_at`.

### item_photos

| Column | Type / rule |
| --- | --- |
| `id` | uuid primary key |
| `item_id` | uuid references items(id) on delete cascade |
| `display_key` | text not null |
| `card_key` | text not null |
| `blur_data_url` | text |
| `alt` | text not null default `''` |
| `width`, `height` | integer not null |
| `position` | integer not null default 0, `>= 0` |
| `created_at` | timestamptz |

Index `(item_id, position)`. The cover is the lowest position. No unique
constraint on position, because reordering is easier without one.

### reservations

| Column | Type / rule |
| --- | --- |
| `id` | uuid primary key |
| `reference` | text unique, not null |
| `item_id` | uuid references items(id) on delete restrict |
| `buyer_name` | text not null |
| `buyer_email` | text not null, lowercased |
| `buyer_phone` | text not null default `''` |
| `fulfilment` | text `pickup | post` |
| `note` | text not null default `''` |
| `price_cents` | integer not null, `>= 0` |
| `currency` | char(3) not null |
| `status` | text `pending | confirmed | cancelled | expired` |
| `expires_at` | timestamptz not null |
| `claimed_paid_at` | timestamptz |
| `claim_note` | text |
| `email_status` | text `not_sent | sending | sent | failed` |
| `email_attempts` | integer not null default 0 |
| `email_last_attempt_at` | timestamptz |
| `email_sent_at` | timestamptz |
| `email_message_id` | text |
| `email_last_error` | text |
| `seller_notified_at` | timestamptz |
| `seller_email_error` | text |
| `confirmed_at` | timestamptz |
| `cancelled_at` | timestamptz |
| `created_ip_hash` | text |
| `created_at`, `updated_at` | timestamptz |

Rules:

- `status = 'confirmed'` requires `confirmed_at IS NOT NULL`.
- `status = 'cancelled'` requires `cancelled_at IS NOT NULL`.
- `status = 'pending'` requires `expires_at > created_at`.
- Partial unique index: one pending reservation per item:
  ```sql
  create unique index reservations_one_pending_per_item
  on reservations (item_id)
  where status = 'pending';
  ```
- Index `(status, expires_at)` for expiry, `(item_id, created_at desc)`, and
  `(buyer_email)`.
- Snapshot `price_cents` and `currency` at creation.
- `created_ip_hash` is a hash, never a raw IP.

### reservation_events

Append-only audit trail:

`id bigserial`, `reservation_id uuid`, `type text` (`created`,
`payment_claimed`, `sale_confirmed`, `cancelled`, `expired`, `extended`,
`email_sent`, `email_failed`, `email_retry`, `seller_notified`), `actor text`
(`buyer | admin | system`), `metadata jsonb`, `created_at timestamptz`.

Never put full emails, phone numbers, or raw IPs in `metadata`.

### admin_users / admin_sessions / login_attempts

- `admin_users`: id, email unique, password_hash, display_name, disabled_at,
  timestamps.
- `admin_sessions`: id, user_id, token_hash unique, expires_at, last_seen_at,
  revoked_at, ip_hash, user_agent.
- `login_attempts`: id, email, ip_hash, succeeded, created_at. Used for the
  DB-backed rate limit. No raw IPs.

---

## 6. Key flows and code sketches

### 6.1 Create a reservation

```ts
export async function createReservation(input: CreateReservationInput) {
  return db.transaction(async (tx) => {
    const [item] = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, input.itemId), eq(items.status, "available")))
      .for("update");

    if (!item || !item.publishedAt) {
      return { ok: false, error: "This item is no longer available." };
    }

    const reference = makeReference();
    const [reservation] = await tx
      .insert(reservations)
      .values({
        reference,
        itemId: item.id,
        buyerName: input.name,
        buyerEmail: input.email.toLowerCase(),
        buyerPhone: input.phone ?? "",
        fulfilment: input.fulfilment,
        note: input.note ?? "",
        priceCents: item.priceCents,
        currency: item.currency,
        status: "pending",
        expiresAt: sql`now() + (${RESERVATION_HOURS} || ' hours')::interval`,
        createdIpHash: input.ipHash,
      })
      .returning();

    await tx
      .update(items)
      .set({ status: "reserved", updatedAt: new Date() })
      .where(and(eq(items.id, item.id), eq(items.status, "available")));

    await tx.insert(reservationEvents).values({
      reservationId: reservation.id,
      type: "created",
      actor: "buyer",
    });

    return { ok: true, reservation };
  });
}
```

The `SELECT ... FOR UPDATE` serializes two buyers on the same item. The partial
unique index catches anything that slips past the row lock.

### 6.2 Expire reservations

```ts
export async function expireReservations() {
  return db.transaction(async (tx) => {
    const expired = await tx
      .update(reservations)
      .set({ status: "expired", updatedAt: new Date() })
      .where(
        and(
          eq(reservations.status, "pending"),
          lte(reservations.expiresAt, new Date()),
        ),
      )
      .returning({ id: reservations.id, itemId: reservations.itemId });

    for (const reservation of expired) {
      await tx
        .update(items)
        .set({ status: "available", updatedAt: new Date() })
        .where(
          and(eq(items.id, reservation.itemId), eq(items.status, "reserved")),
        );

      await tx.insert(reservationEvents).values({
        reservationId: reservation.id,
        type: "expired",
        actor: "system",
      });
    }

    return expired.length;
  });
}
```

Call this from the cron route and from a lazy check before the shelf and item
queries. If the cron is down, the shop still heals itself.

### 6.3 Confirm a sale exactly once

```ts
export async function confirmSale(reservationId: string, actorId: string) {
  return db.transaction(async (tx) => {
    const [reservation] = await tx
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .for("update");

    if (!reservation) return { ok: false, error: "Not found." };
    if (reservation.status === "confirmed") {
      return { ok: true, already: true };
    }
    if (reservation.status !== "pending") {
      return { ok: false, error: "This reservation is not pending." };
    }
    if (reservation.expiresAt <= new Date()) {
      await tx
        .update(reservations)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(reservations.id, reservationId));
      await tx
        .update(items)
        .set({ status: "available", updatedAt: new Date() })
        .where(
          and(
            eq(items.id, reservation.itemId),
            eq(items.status, "reserved"),
          ),
        );
      return { ok: false, error: "This reservation expired. The item is back on the shelf." };
    }

    const [item] = await tx
      .update(items)
      .set({ status: "sold", soldAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(items.id, reservation.itemId), eq(items.status, "reserved")),
      )
      .returning();

    if (!item) {
      return { ok: false, error: "The item is no longer reserved." };
    }

    await tx
      .update(reservations)
      .set({
        status: "confirmed",
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, reservationId));

    await tx.insert(reservationEvents).values({
      reservationId,
      type: "sale_confirmed",
      actor: "admin",
      metadata: { adminId: actorId },
    });

    return { ok: true };
  });
}
```

Send the receipt email **after** the transaction commits. Email is a side
effect; it must not be able to roll back a sale.

### 6.4 Upload a photo and generate variants

```ts
const key = `items/${itemId}/staging/${crypto.randomUUID()}.${ext}`;

const uploadUrl = await getSignedUrl(
  s3,
  new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  }),
  { expiresIn: 300 },
);
```

On finalize, read the staging object, then:

```ts
const image = sharp(buffer, { failOn: "error" }).rotate();
const meta = await image.metadata();

const display = await image
  .clone()
  .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 82 })
  .toBuffer();

const card = await image
  .clone()
  .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 78 })
  .toBuffer();

const blur = await image
  .clone()
  .resize(24)
  .webp({ quality: 35 })
  .toBuffer();
```

Re-encoding through WebP removes EXIF/GPS. Reject SVG, GIF, HEIC, and RAW in
v1. Store the variants under `items/{itemId}/{photoId}/`. Delete the staging
object best-effort after the DB row is committed.

### 6.5 Claim an email send

```sql
update reservations
set email_status = 'sending',
    email_attempts = email_attempts + 1,
    email_last_attempt_at = now()
where id = $1
  and status in ('pending', 'confirmed')
  and (
    email_status in ('not_sent', 'failed')
    or (email_status = 'sending' and email_last_attempt_at < now() - interval '5 minutes')
  )
returning *;
```

If no row is returned, another attempt is already in progress or the receipt was
already sent. Send with a stable idempotency key:
`reservation-receipt/{reservationId}`.

---

## 7. Environment variables

| Variable | Required | Used for |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon pooled connection |
| `TEST_DATABASE_URL` | tests | separate Neon branch |
| `PUBLIC_BASE_URL` | yes | email links, R2 CORS, metadata |
| `ADMIN_EMAIL` | seed | first admin |
| `ADMIN_PASSWORD` | seed | first admin password, 12+ chars |
| `IP_HASH_SECRET` | yes | hashing IPs for rate limits |
| `R2_ACCOUNT_ID` | yes | R2 endpoint |
| `R2_ACCESS_KEY_ID` | yes | R2 API token |
| `R2_SECRET_ACCESS_KEY` | yes | R2 API token |
| `R2_BUCKET` | yes | item photos |
| `R2_PUBLIC_BASE_URL` | yes | public image host |
| `RESEND_API_KEY` | yes | transactional email |
| `EMAIL_FROM` | yes | verified sender |
| `SHOP_EMAIL` | yes | seller alerts |
| `WHATSAPP_NUMBER` | yes | E.164 without `+` |
| `RESERVATION_HOURS` | yes | default `24` |
| `DEFAULT_CURRENCY` | yes | default `MYR` |
| `SHOP_NAME`, `SHOP_LOCATION`, `PICKUP_INSTRUCTIONS` | yes | page copy and receipt |
| `CRON_SECRET` | yes | protect the expiry route |

---

## 8. Definition of done

- A visitor can open the shelf, view an item, reserve it, get a receipt, open
  WhatsApp, and claim “I've paid”.
- Two buyers clicking at the same time produce exactly one pending reservation.
- An expired reservation releases the item, even if the cron is late.
- The admin can create, edit, publish, archive, and price an item.
- The admin can upload photos, reorder them, and set a cover.
- The admin can confirm, cancel, and extend reservations.
- A confirmed sale marks the item sold exactly once.
- A failed receipt email leaves the reservation pending or confirmed.
- The receipt page never leaks the full email or phone number.
- The tests in phase 9 pass on a clean branch.
- The deploy checklist in phase 10 passes.

---

## 9. Footguns

- **Deriving item status only from reservations.** It drifts. Keep the stored
  status and update it in the same transaction.
- **Trusting a cron for expiry.** A late cron means a stale hold. Use the lazy
  check as the correctness path.
- **Letting the buyer confirm.** A claim is a signal, not a payment.
- **Sending email inside the DB transaction.** A failed email must not roll back
  a sale.
- **Deleting an item with reservations.** Archive it. The history is the shop's
  memory.
- **Using a public R2 key that reveals a draft.** Use unguessable keys and never
  link a draft publicly.
- **Trusting the client price.** Read it from the item row.
- **Using `Date.now()` on the client for expiry.** Use database time.
- **A missing partial unique index.** Two pending reservations for one item is
  the bug the course exists to prevent.
- **Changing the Resend idempotency key on retry.** Use a stable key; otherwise
  a retry can duplicate the email.
- **Running `sharp` on the Edge runtime.** Use Node.
- **Publishing a photo with GPS EXIF.** Re-encode and strip metadata.
- **Logging raw emails, phones, or IPs.** Hash and redact.

---

## 10. Deployment checklist

- [ ] Neon production branch created; migrations applied by hand.
- [ ] Admin seeded with a strong password.
- [ ] Vercel project connected; all env vars set for production and preview.
- [ ] R2 bucket created; public access configured; CORS allows the production
      domain and `http://localhost:3000`.
- [ ] Resend domain verified; `EMAIL_FROM` and `SHOP_EMAIL` set.
- [ ] Vercel Cron configured for `/api/cron/expire-reservations`.
- [ ] `CRON_SECRET` set; the route rejects requests without it.
- [ ] Security headers configured.
- [ ] Health check green on production.
- [ ] One end-to-end reservation with a real email and a real photo.
- [ ] One expired reservation releases the item.
- [ ] Logs checked: no secrets, no full emails, no raw IPs.

---

## 11. Extensions (do not build in v1)

- Categories and filtering.
- Search.
- Offers and negotiation.
- Shipping fees and labels.
- Multiple admins.
- Customer accounts and saved items.
- Online payment (Stripe or a local gateway).
- Reservation reminders before expiry.
- “Similar items” and a sold archive.
- Analytics.
