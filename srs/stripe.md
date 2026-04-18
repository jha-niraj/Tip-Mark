# Stripe in TipMark — end-to-end guide

This document explains how **card tips** work in this codebase: the **Checkout Session** flow, the **`Tip` ledger** in PostgreSQL, **webhooks**, **Stripe Connect** (optional), and how to configure everything in **development** and **production**.

---

## 1. Mental model

TipMark treats every card payment as one row in the **`tips`** table:

- **`rail = STRIPE`** — paid with Stripe (vs **`SOLANA`** for on-chain tips).
- **`status`** — starts **`PENDING`**, becomes **`SUCCEEDED`**, **`FAILED`**, or **`CANCELED`** depending on Checkout / PaymentIntent outcome.
- **Amount** — stored as **`amountCents`** (integer USD cents, e.g. `500` = $5.00).

The app does **not** charge the card itself in the browser. It:

1. Creates a **`Tip`** row with **`PENDING`**.
2. Creates a **Stripe Checkout Session** with that amount and metadata pointing at the tip id.
3. Redirects the user to **Stripe-hosted Checkout** (`session.url`).
4. After payment, Stripe sends **webhook events** to your server; the handler updates the **`Tip`** to **`SUCCEEDED`** (or failure/cancel).

So the **source of truth for “payment completed”** is: **webhooks** (and optionally overlapping events — see §5). The success URL is only for **UX** (show a thank-you message), not for accounting.

---

## 2. Files and responsibilities

| Piece | Path | Role |
|--------|------|------|
| Stripe SDK singleton | `src/lib/stripe.ts` | Reads **`STRIPE_SECRET_KEY`**, constructs `new Stripe(...)`. Returns `null` if the key is missing. |
| App base URL | `src/lib/app-url.ts` | **`NEXT_PUBLIC_APP_URL`**, else **`VERCEL_URL`**, else `http://localhost:3000` — used for Checkout **success/cancel** URLs. |
| Create Checkout + create `Tip` | `src/actions/checkout.ts` | Server action **`createTipCheckoutSession`**: validates user, creator, amount/badge/campaign, creates **`Tip`**, creates **Checkout Session**, stores **`stripeCheckoutSessionId`**, returns **`url`**. |
| Webhook event logic | `src/lib/stripe-webhook.ts` | **`processStripeWebhookEvent(event)`** — maps Stripe events → Prisma updates. |
| HTTP webhook handler | `src/lib/stripe-webhook-request.ts` | **`handleStripeWebhookPOST`**: raw body + **`Stripe-Signature`** → **`constructEvent`**, then **`processStripeWebhookEvent`**. |
| Route (canonical) | `src/app/api/webhooks/stripe/route.ts` | **`POST /api/webhooks/stripe`** — use this in **production** Dashboard. |
| Route (CLI alias) | `src/app/api/webhook/route.ts` | **`POST /api/webhook`** — same handler; convenient for **`stripe listen --forward-to .../api/webhook`**. |
| Public UI | `src/components/public/public-creator-page.tsx` | Calls **`createTipCheckoutSession`**, then **`window.location.href = url`**. |

---

## 3. Checkout flow (step by step)

### 3.1 Preconditions

- **`STRIPE_SECRET_KEY`** is set (test key `sk_test_...` or live `sk_live_...`).
- User is **signed in** (server action checks **NextAuth** session).
- **Creator** exists; optional **campaign** / **badge** ids belong to that creator.

### 3.2 Amount rules (`createTipCheckoutSession`)

Implementation: `src/actions/checkout.ts`.

- **Custom amount** (no badge): **`amountCents`** must be **≥ 50** ($0.50 — Stripe’s practical minimum for small charges).
- **Badge tier**: if **`creatorBadgeId`** is passed, the server **loads the badge** and sets **`finalCents = badge.amountCents`**. The client cannot force a lower price by tampering with the amount.
- **Campaign**: if **`campaignId`** is set, the server verifies the campaign belongs to the same **`creatorProfileId`**.

### 3.3 Creating the ledger row first

```text
Tip.create({
  rail: STRIPE,
  creatorProfileId,
  supporterUserId: session.user.id,
  campaignId?: …,
  creatorBadgeId?: …,
  amountCents: finalCents,
  currency: "usd",
  status: PENDING,
})
```

This gives a stable **`tip.id`** (cuid) **before** talking to Stripe.

### 3.4 Stripe Checkout Session

The code builds **`Stripe.Checkout.SessionCreateParams`**:

- **`mode: "payment"`** — one-time payment (not subscription).
- **`line_items`** — one line item with **`price_data`** (USD, **`unit_amount: finalCents`**).
- **`success_url` / `cancel_url`** — based on **`getAppUrl()`** and the creator slug, e.g.  
  `https://yourdomain.com/u/{slug}?tip=success` and `...?tip=canceled`.
- **`client_reference_id: tip.id`** — duplicate pointer to the tip (Stripe shows this in the Dashboard).
- **`metadata`** on the session: **`tipId`**, **`creatorProfileId`**, **`supporterUserId`**.
- **`payment_intent_data.metadata: { tipId }`** — so **PaymentIntent**-based webhooks can find the same tip.

Then:

```text
checkoutSession = await stripe.checkout.sessions.create(checkoutParams)
await prisma.tip.update({ where: { id: tip.id }, data: { stripeCheckoutSessionId: checkoutSession.id } })
```

If **`checkoutSession.url`** is missing, the tip is marked **`FAILED`**.

### 3.5 Stripe Connect (optional)

If **`CreatorProfile.stripeConnectAccountId`** and **`stripeChargesEnabled`** are set, the code adds:

```ts
payment_intent_data: {
  ...existing,
  transfer_data: { destination: profile.stripeConnectAccountId },
}
```

That sends funds to the **connected account** (destination charge pattern). If Connect is **not** onboarded, charges stay on the **platform** Stripe account until you implement payouts separately.

### 3.6 Browser redirect

The client receives **`{ ok: true, url }`** and sets **`window.location.href = url`**. The user completes payment on **Stripe Checkout**.

---

## 4. Webhooks — why they exist

Stripe processes the card **asynchronously**. Your server learns the outcome in two ways:

1. **Webhooks** (reliable, server-to-server): Stripe **`POST`s** signed JSON to your endpoint.
2. **Success redirect** (unreliable for accounting): the user may close the tab before returning; never trust success URL alone.

TipMark **updates the database in webhook handlers** so **`Tip.status`** reflects reality.

---

## 5. Webhook pipeline (code-level)

### 5.1 HTTP layer

`src/lib/stripe-webhook-request.ts`:

1. Read **`await req.text()`** — must be the **raw** body (do not `JSON.parse` before verify).
2. Read header **`stripe-signature`**.
3. **`stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`** — if the secret is wrong or the body was altered, verification **throws**.
4. Call **`processStripeWebhookEvent(event)`**.

**Runtime:** routes set **`export const runtime = "nodejs"`** so the Node Stripe SDK and crypto behave as expected.

### 5.2 Events handled (`src/lib/stripe-webhook.ts`)

| Event | What we do |
|--------|------------|
| **`checkout.session.completed`** | Read **`metadata.tipId`** or **`client_reference_id`**. If **`status` is still `PENDING`**, set **`SUCCEEDED`** and store **`stripePaymentIntentId`** when present. |
| **`checkout.session.expired`** | Same tip id resolution; set **`CANCELED`** if still **`PENDING`**. |
| **`payment_intent.succeeded`** | If **`metadata.tipId`** exists (we set it on the PaymentIntent), mark **`SUCCEEDED`**. Useful for CLI tests and redundancy with Checkout. |
| **`payment_intent.payment_failed`** | Mark **`FAILED`** if **`metadata.tipId`** exists. |

**Idempotency:** updates use **`updateMany`** with **`status: PENDING`** where applicable, so duplicate deliveries of the same event do not corrupt state.

### 5.3 Two URL paths, one handler

- **`POST /api/webhooks/stripe`** — recommended for **production** (clear, RESTful).
- **`POST /api/webhook`** — identical behavior; use with **Stripe CLI** `listen --forward-to http://localhost:PORT/api/webhook`.

---

## 6. Environment variables

| Variable | Purpose |
|----------|---------|
| **`STRIPE_SECRET_KEY`** | Server-only. **`sk_test_...`** (dev) or **`sk_live_...`** (prod). Used by **`getStripe()`** and Checkout creation. |
| **`STRIPE_WEBHOOK_SECRET`** | Server-only. **`whsec_...`**. Used to **verify** webhook signatures. **Different** for Dashboard endpoint vs **Stripe CLI** “listen” secret. |
| **`NEXT_PUBLIC_APP_URL`** | Optional but **recommended** in production: canonical site origin (**`https://yourdomain.com`**) for Checkout **success/cancel** URLs. No trailing slash. |
| **`VERCEL_URL`** | Set by Vercel automatically; **`getAppUrl()`** falls back to **`https://` + VERCEL_URL** if **`NEXT_PUBLIC_APP_URL`** is unset. |

Never expose **`STRIPE_SECRET_KEY`** or **`STRIPE_WEBHOOK_SECRET`** to the client.

---

## 7. Local development (Stripe CLI)

### 7.1 Listen and forward

1. Run the app (e.g. **`bun dev`** on port **3000** or **3001**).
2. In another terminal:

   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhook
   ```

   (Adjust host/port to match your dev server.)

3. The CLI prints a **webhook signing secret** (`whsec_...`). Put it in **`.env`**:

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Restart** the Next.js dev server after changing **`.env`**.

**Note:** Each **`stripe listen`** session can issue a **new** `whsec`; update **`.env`** when it changes.

### 7.2 npm script (optional)

The repo may define:

```json
"stripe:listen": "stripe listen --forward-to http://localhost:3000/api/webhook"
```

Change the port if needed.

### 7.3 Testing triggers

- **`stripe trigger checkout.session.completed`** — closer to real Checkout behavior.
- **`stripe trigger payment_intent.succeeded`** — often **does not** include your **`tipId`** metadata; our handler may **no-op** unless metadata matches a real tip.

The most realistic test is: complete a **test card** payment through the app’s Checkout in **test mode**.

---

## 8. Production configuration

### 8.1 Stripe Dashboard

1. **Developers → API keys**  
   - Use **live** keys only in production environment.  
   - **`STRIPE_SECRET_KEY`** = **Secret key** (restricted key is possible if scoped correctly).

2. **Developers → Webhooks → Add endpoint**  
   - **Endpoint URL:**  
     `https://<your-production-domain>/api/webhooks/stripe`  
     (HTTPS required.)
   - **Events to send** (minimum for this app):  
     - `checkout.session.completed`  
     - `checkout.session.expired`  
     - `payment_intent.succeeded` (optional redundancy)  
     - `payment_intent.payment_failed` (optional)  
   - After creation, reveal the **Signing secret** (`whsec_...`) — this is **`STRIPE_WEBHOOK_SECRET`** for production (not the CLI secret).

3. **Test vs Live**  
   - Use **test** keys + test webhook endpoint on **preview** deployments if you mirror production.  
   - **Live** keys and **live** webhook secret on **production** only.

### 8.2 Hosting (e.g. Vercel)

Add environment variables in the project settings:

- **`STRIPE_SECRET_KEY`**
- **`STRIPE_WEBHOOK_SECRET`** (from **Dashboard** webhook endpoint, not from CLI)
- **`NEXT_PUBLIC_APP_URL`** = `https://yourdomain.com`

Redeploy after changes.

### 8.3 Build

The build runs **`prisma generate`**; no Stripe-specific build step. Webhook routes must stay on the **Node** runtime (already set).

---

## 9. Security and operations notes

- **Verification:** Only trust events that pass **`constructEvent`** with your **`STRIPE_WEBHOOK_SECRET`**.
- **Replay:** Stripe may retry webhooks; idempotent **`updateMany`** limits damage.
- **Amount integrity:** The charged amount is defined in **Checkout Session** creation server-side; badge prices are enforced by re-reading the badge row.
- **Connect:** When **`transfer_data.destination`** is used, ensure the connected account is fully onboarded and **`stripeChargesEnabled`** is accurate before enabling in production.

---

## 10. Quick reference — user-visible flow

```text
Supporter clicks “Pay” on /u/[slug]
    → createTipCheckoutSession (server)
        → Tip row PENDING
        → stripe.checkout.sessions.create
        → redirect to Stripe Checkout
    → User pays at Stripe
    → Stripe POSTs webhook to /api/webhooks/stripe (prod) or CLI-forwarded /api/webhook (dev)
        → constructEvent + processStripeWebhookEvent
        → Tip SUCCEEDED (or FAILED/CANCELED)
    → User lands on success_url (optional UX only)
```

This matches the implementation in **`src/actions/checkout.ts`**, **`src/lib/stripe-webhook.ts`**, and the **`POST`** handlers under **`src/app/api/`**.
