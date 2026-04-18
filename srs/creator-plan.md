# Creator plan — pages, flows, and data (Stripe phase)

Audience: people who receive tips and optionally run **campaigns** (fundraisers, milestones, “buy me a coffee” variants).

---

## Primary goals

1. **Onboard** as a creator (profile, slug, payout method).
2. **Receive tips** via Stripe (general tip or toward a **campaign**).
3. **Create and manage campaigns** without dedicated `/new` routes — use a **Sheet from the right** from the dashboard or campaigns list.
4. **See performance** on `/home`: recent tips, campaign progress, payout / Connect status.

---

## Pages and routes (creator)

| Route | Purpose |
|--------|---------|
| **`/home`** | Creator **dashboard** (server): aggregates recent activity, campaign summaries, CTA to open “New campaign” Sheet, Stripe status snippet. Client subtree: creator dashboard UI. |
| **`/campaigns`** | **List** all campaigns; primary **create/edit** entry is a **right Sheet** (not `/campaigns/new`). Optional filters: active / ended. |
| **`/settings`** | **Profile** (name, bio, avatar, public slug), **Stripe Connect** onboarding and payout status, **email / notifications**, future **badge** copy if needed. |
| **`/u/[slug]`** | **Public** creator page (same URL pattern for everyone); creator previews how it looks via link from settings or dashboard. |

No **`*/new`** routes for campaign creation.

---

## Sheets and modals (no `/new` pages)

- **Create / edit campaign**: `Sheet` `side="right"`, wide on desktop. Fields (conceptual): title, short description, optional goal amount, optional end date, visibility (active/paused).
- **Optional**: “Share campaign” or “Copy link” inside the sheet or row actions on the list.

---

## What appears on creator `/home`

- **At a glance**: total received (period), number of tips, active campaigns count.
- **Recent tips**: table or feed (amount, campaign if any, supporter display name if allowed, time).
- **Campaigns snapshot**: progress bars or cards linking to `/campaigns`.
- **Stripe**: short status — not connected / pending / ready / restricted (wording only in UI).
- **Primary action**: button opening the **New campaign** Sheet.

---

## Stripe (conceptual, no code here)

- **Connect** (or equivalent) for creator payouts.
- **Checkout** or **Payment Intents** for one-off tips; metadata links payment to **creator**, optional **campaign**, and **supporter** user id when logged in.
- Webhooks as **Route Handlers** or dedicated API routes for **Stripe-only** callbacks (heavy/off-platform), while **our** DB updates go through small internal helpers called from webhook handlers.

---

## Schema — unified data model (conceptual; no DDL here)

The database uses **one profile** and **one tip table** for both rails:

- **`User`** — authentication, **`UserRole`** (`SUPPORTER` | `CREATOR`), links to optional **`CreatorProfile`** and outgoing **`Tip`** rows as supporter.
- **`CreatorProfile`** — **single** public identity per creator: **`slug`**, display fields, **`solanaWallet`** (receive address), and **Stripe Connect** payout fields. Replaces the old split between a Solana-only `Creator` row and a separate card profile.
- **`Campaign`** — optional fundraising buckets; card tips can reference a campaign; SOL tips typically do not.
- **`Tip`** — **unified ledger** with **`TipRail`** (`SOLANA` | `STRIPE`): Solana fields (e.g. signature, `amountSol`, `tipperWallet`) vs Stripe fields (e.g. `amountCents`, Stripe ids, status). Same creator, supporter, and optional campaign relations for reporting.
- **`TipRail` / `TipStatus`** — enums on **`Tip`** to branch UI and queries.
- **`StripeEvent`** (optional) — idempotent webhook audit.
- **`Payout` / `BalanceSnapshot`** (optional) — reporting beyond dashboards.

Legacy Solana-only tables are **not** used going forward; migrate historical rows into **`Tip`** with `rail = SOLANA` if needed.

---

## Sidebar (creator)

Typical entries: **Dashboard** (`/home`), **Campaigns** (`/campaigns`), **Settings** (`/settings`). Visual treatment matches landing: amber accent, zinc borders, no clutter.

---

## Server actions (conceptual)

Grouped under `src/actions/` (names only): `campaigns`, `tips`, `stripe`, `creatorProfile` — create/update campaign, list dashboard stats, start Connect onboarding, etc.

---

## Linking

- Every creator-facing screen links back to **`/home`** and to **`/u/[slug]`** preview.
- Campaign rows deep-link supporters to tip with **campaign context** in the URL query or path (decision in implementation).
