# TipMark — Platform architecture (Stripe-first)

This folder describes how the app is structured around **card tips via Stripe**, **creators**, **supporters**, and **campaigns** (optional buckets supporters can tip toward). Web3/Solana is out of scope for this phase.

## Product shape

- **Creators** run a public tip page, configure **Stripe Connect** (or similar) for payouts, create **campaigns** (goals, titles, optional amounts), and see analytics on **/home** and dedicated sections.
- **Supporters** sign in, tip a creator (general or toward a campaign), and see history on **/home** and **activity**.
- **Public** visitors can open a creator’s public URL **without logging in**; we still **encourage sign-in before completing a tip** (documented in supporter plan).

## Routing and rendering convention

| Layer | Responsibility |
|--------|----------------|
| **`app/**/page.tsx`** | **Server Components** only: call **server actions** (from `src/actions/`), read `session` / cookies as needed, pass serializable props to clients. |
| **`src/actions/**`** | Server actions: validation, Prisma, Stripe server SDK, redirects/errors. |
| **`components/**`** | Client components (`"use client"`) for forms, sheets, charts, wallet of interactivity. |

No **`/new`** routes for creating campaigns: use a **right-side Sheet** (shadcn) launched from list or dashboard.

## Folder structure (target)

```text
src/
  app/
    page.tsx               # landing
    (app)/                 # route group: shared sidebar shell (not in URL)
      layout.tsx           # SidebarProvider + AppShell
      home/page.tsx        # role-aware server page → future CreatorHome / SupporterHome clients
      campaigns/page.tsx   # creator: list; Sheet for create/edit (no /new)
      settings/page.tsx    # profile, Stripe, notifications
      activity/page.tsx    # supporter: tips given, receipts
    u/
      [slug]/page.tsx      # public creator tip page (no auth to view)
  actions/
    auth/
    tips/
    campaigns/
    stripe/
  components/
    home/
      creator-home.tsx     # client
      supporter-home.tsx   # client
    campaigns/
    ...
```

## Shared route: `/home`

- Single URL for both roles.
- **Server** `page.tsx` resolves the user’s **role** (and later: whether they have completed creator onboarding).
- Fetches **role-appropriate** summaries via server actions (e.g. recent tips, active campaigns, Stripe status).
- Renders **one** of two client trees: creator dashboard vs supporter dashboard (props passed down).

## Documents in this folder

- **[creator-plan.md](./creator-plan.md)** — creator journeys, pages, Sheets, Stripe touchpoints, schema model **names** (no DDL).
- **[supporter-plan.md](./supporter-plan.md)** — supporter journeys, `/home` vs `/activity`, tipping flows, schema model **names**.

## Sidebar and UI

The signed-in shell uses the same **design tokens** as the landing page: zinc neutrals, **amber primary**, `border-border`, `bg-card`, `text-muted-foreground`, compact typography for labels. Navigation is **role-based** via `src/lib/navigation.ts`.
