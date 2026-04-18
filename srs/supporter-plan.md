# Supporter plan — pages, flows, and data (Stripe phase)

Audience: signed-in users who **send tips** to creators, optionally **toward a campaign**.

---

## Primary goals

1. **Discover or follow** creators (MVP: paste link or search later).
2. **Tip** via card (Stripe) — **general support** or **campaign-specific** tip.
3. **See history** of tips and receipts on **`/home`** and **`/activity`**.
4. **Encourage login before paying** while still allowing a **read-only public** creator page.

---

## Pages and routes (supporter)

| Route | Purpose |
|--------|---------|
| **`/home`** | **Supporter dashboard** (server): recent tips given, suggested creators or empty state, shortcuts. Client subtree: supporter home UI. Same URL as creators — content is **role-based**. |
| **`/activity`** | **Full history**: list/card of past tips, amounts, creator name, campaign name if any, link to Stripe receipt or in-app receipt id, filters by date. |
| **`/u/[slug]`** | **Public** page: creator profile + tip CTA. **View without login.** Tipping flow prompts **sign in** before Checkout when possible; guest checkout only if you explicitly add it later. |

Optional later: **`/discover`** (browse creators) — not required for MVP if links are shared manually.

---

## Supporter `/home` vs creator `/home`

- **One route** (`/home`), **two experiences**:
  - **Server** `page.tsx` reads session and **role** (and future flags).
  - Calls **different server actions** for summaries (e.g. `getSupporterDashboard` vs `getCreatorDashboard`).
  - Passes data into **`SupporterHome`** or **`CreatorHome`** client components.

This avoids duplicating URLs and keeps bookmarks simple.

---

## Tipping flow (conceptual)

1. Land on **`/u/[slug]`** (public).
2. Choose **Tip creator** or **Tip this campaign** (if campaigns listed).
3. If not signed in: **Sign in** modal (email OTP), then return to the same page.
4. Start **Stripe Checkout** (or embedded flow) with metadata: creator id, campaign id (optional), supporter user id.
5. Success page or redirect back to **`/u/[slug]`** or **`/activity`** with confirmation.

---

## What appears on supporter `/home`

- **Summary**: tips sent this month / all time (simple).
- **Recent activity**: last few tips with creator + amount.
- **Empty state**: “Enter a creator link” or saved favorites (if you add **`FavoriteCreator`** later).

---

## Schema — model **names** (no field definitions)

Shared with creator plan; supporter-specific additions may include:

- **`User`** — already; role **`SUPPORTER`** (default) vs **`CREATOR`**.
- **`Tip`** / **`Payment`** — supporter’s user id when logged in; guest tips only if you add nullable supporter and capture email from Stripe.
- **`FavoriteCreator`** (optional) — supporter bookmarks a **`CreatorProfile`**.
- **`Notification`** (optional) — tip confirmations, campaign updates.

---

## Sidebar (supporter)

Typical entries: **Dashboard** (`/home`), **Activity** (`/activity`). Same shell and visual language as the landing page (amber primary, zinc chrome).

---

## Server actions (conceptual)

Examples under `src/actions/`: list supporter tips, prepare Checkout session payload, attach supporter id to payment metadata.

---

## Privacy and display names

- Decide whether supporters show **real name**, **first name**, or **anonymous** on creator dashboards (document policy in product, not here).
