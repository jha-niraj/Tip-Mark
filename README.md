# TipMark ⚡

**The tip jar that rewards your fans forever.**

TipMark is an open-source, decentralized creator tipping platform built on Solana. Fans send SOL tips with a message — the SOL lands directly in the creator's wallet, and the fan automatically receives a **permanent, soul-bound NFT badge** proving they supported that creator. No platform fees. No middlemen. Just Solana.

> Built for the [Colosseum Frontier Hackathon 2026](https://arena.colosseum.org/hackathon/frontier)

---

## Why TipMark

| | TipMark | Buy Me a Coffee | Basic Tip Jar |
|---|---|---|---|
| Platform fee | **0%** | 5% | 0% |
| Fan gets proof of support | **Soul-bound NFT** | Nothing | Nothing |
| Decentralized | **Yes** | No | Partial |
| Embeddable widget | **Yes** | Yes | No |
| Token-gated content | **Yes** | No | No |

---

## How it works

1. **Creator signs up** — Connect email, link Solana wallet, set username. Live at `tipmark.xyz/yourname` in under 60 seconds.
2. **Fan tips** — Sends any amount of SOL with an optional message. Goes directly to the creator's wallet.
3. **Badge mints** — A Compressed NFT badge automatically mints to the fan's wallet based on tip amount:
   - 🥉 **Bronze** — < 0.1 SOL
   - 🥈 **Silver** — 0.1–1 SOL
   - 🥇 **Gold** — 1–5 SOL
   - 💎 **Diamond** — 5+ SOL

Badges are soul-bound (non-transferable) and permanent — proof you were there.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Framer Motion |
| Auth | NextAuth v4 (email OTP via Resend) |
| Blockchain | Solana (Anchor smart contract) |
| NFTs | Metaplex Bubblegum (Compressed NFTs) |
| Database | Neon Postgres (Prisma 7) |
| Package manager | Bun |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 18
- A [Neon](https://neon.tech) Postgres database (free tier works)
- A [Resend](https://resend.com) account for email OTPs (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/jha-niraj/TipMark.git
cd tipmark
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env .env.local
```

```env
# Neon Postgres connection string
DATABASE_URL="postgresql://user:password@host/tipmark?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Resend API key — get yours at resend.com
RESEND_API_KEY="re_your_key_here"
```

### 4. Set up the database

```bash
bunx prisma migrate dev --name init
```

This creates the `users`, `otps`, `creators`, and `tips` tables in your Neon database.

### 5. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
tipmark/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/   # NextAuth handler
│   │   │       └── send-otp/        # OTP email endpoint
│   │   ├── home/                    # Creator dashboard (protected)
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── auth/
│   │   │   └── sign-in-dialog.tsx   # Email + OTP auth flow
│   │   ├── landing/                 # Landing page sections
│   │   ├── ui/                      # shadcn components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth config
│   │   └── prisma.ts                # Prisma client singleton
│   └── types/
│       └── next-auth.d.ts           # Session type augmentation
├── prisma/
│   └── schema.prisma                # DB schema
├── srs/                             # Product docs & planning
│   ├── overview.md
│   ├── features.md
│   ├── tech-stack.md
│   ├── build-plan.md
│   └── architecture.md
└── middleware.ts                    # Route protection
```

---

## Roadmap

See [`srs/build-plan.md`](./srs/build-plan.md) for the full week-by-week breakdown.

- [x] Landing page with auth (email OTP)
- [ ] Anchor smart contract (`send_tip` + `create_creator_profile`)
- [ ] Creator onboarding + profile page (`/[username]`)
- [ ] Tipping flow (wallet connect + SOL transfer)
- [ ] Compressed NFT badge minting (Metaplex Bubblegum)
- [ ] Creator dashboard (earnings, supporter wall)
- [ ] Embeddable tip widget
- [ ] Supporter profile page (`/profile/[wallet]`)
- [ ] Token-gated content links

---

## Contributing

Contributions are welcome — especially on the Anchor program and Metaplex integration.

### Fork and run locally

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/tipmark.git
cd tipmark

# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Install and set up (see Getting Started above)
bun install
# ... fill in .env.local ...
bunx prisma migrate dev

# 4. Make your changes and test
bun dev

# 5. Build check before pushing
bun run build

# 6. Push and open a pull request
git push origin feat/your-feature-name
```

### Contribution guidelines

- **One thing per PR** — keep pull requests focused. Fixes, features, and refactors separately.
- **No breaking changes** to the auth flow or DB schema without a migration.
- **Match the code style** — TypeScript strict, no `any`, Tailwind for styling.
- **Test the golden path** — sign in flow, tip flow, dashboard — before submitting.
- For large changes, open an issue first to discuss the approach.

### Good first issues

- Improve the OTP email template design
- Add loading skeletons to the dashboard
- Write unit tests for the `send-otp` API route
- Improve mobile layout on the landing page
- Add `robots.txt` and `sitemap.xml`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXTAUTH_URL` | Yes | Full URL of your app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |
| `RESEND_API_KEY` | Yes | API key from [resend.com](https://resend.com) |

---

## License

MIT — do whatever you want with it. Attribution appreciated but not required.

---

<div align="center">
  <strong>Built with ⚡ for Colosseum Frontier Hackathon 2026 on Solana ◎</strong>
</div>
