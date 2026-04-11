# TipMark — 30-Day Build Plan

**Start**: April 11, 2026
**Deadline**: May 11, 2026
**Submission**: Colosseum Frontier Hackathon

---

## Week 1 (Apr 11–17): Foundation + Anchor Program

### Goals
- Anchor smart contract running on devnet
- Wallet connection working in Next.js
- Basic tip transaction flow end-to-end

### Tasks
- [x] Initialize Next.js app
- [ ] Set up Anchor workspace (`programs/tipmark/`)
- [ ] Write Anchor program:
  - `create_creator_profile` instruction
  - `send_tip` instruction (stores tipper, amount, message)
  - Account structs: `CreatorProfile`, `TipRecord`
- [ ] Deploy program to devnet
- [ ] Wire wallet adapter in Next.js (WalletProvider setup)
- [ ] Test: send a tip from one wallet to another via program
- [ ] Set up Neon Postgres + Prisma schema
  - Tables: `creators`, `tips`

### Deliverable
A working devnet transaction: wallet A tips wallet B, tip record stored on-chain.

---

## Week 2 (Apr 18–24): Creator Pages + Tipping UI

### Goals
- Creator can create a profile
- Public tip page is live and functional

### Tasks
- [ ] Creator onboarding page (`/onboard`)
  - Connect wallet → fill profile form → sign message (auth) → save to DB
- [ ] Dynamic creator page (`/[username]`)
  - Show creator info, tip form, supporter wall
- [ ] Tipping flow UI:
  - Amount selector (preset buttons + custom input)
  - Message textarea
  - "Send Tip" button → triggers wallet transaction
  - Success/failure states
- [ ] API routes:
  - `POST /api/creators` — save profile
  - `GET /api/creators/[username]` — fetch creator
  - `POST /api/tips` — record tip in DB after on-chain confirmation
- [ ] Basic creator dashboard (`/dashboard`)
  - Total received, recent supporters list

### Deliverable
Full tip flow working: visit `/username`, connect wallet, send tip.

---

## Week 3 (Apr 25 – May 1): Compressed NFT Badges

### Goals
- Every tip mints a badge NFT to tipper's wallet
- Badge tiers working (Bronze/Silver/Gold/Diamond)

### Tasks
- [ ] Design 4 badge images (can use Figma or simple SVG)
  - Bronze, Silver, Gold, Diamond — with TipMark branding
- [ ] Upload badge images + metadata to IPFS (Pinata)
- [ ] Set up Metaplex Bubblegum:
  - Create Merkle tree for compressed NFTs
  - `mintCompressedNFT` function
- [ ] Integrate into tip flow:
  - After tip tx confirmed → mint badge to tipper
  - Tier determined by tip amount
  - Metadata: creator name, amount, date, message
- [ ] Show badge on supporter profile (`/profile/[wallet]`)
- [ ] Show badges on creator dashboard supporter list

### Deliverable
Tip → NFT badge minted to tipper's wallet, visible in Phantom.

---

## Week 4 (May 2–11): Polish + Embeddable Widget + Submission

### Goals
- Production-ready, demo-ready submission
- Embeddable widget working
- Deployed to Vercel + Mainnet (or clean devnet)

### Tasks
- [ ] Embeddable widget (`/widget/[username]`)
  - iFrame-based tip button
  - Code snippet copy for creators
- [ ] Supporter wall on creator page (public leaderboard)
- [ ] Supporter profile page (`/profile/[wallet]`)
- [ ] Landing page (`/`) — explain TipMark, demo CTA
- [ ] UI polish: animations, loading states, error handling
- [ ] Mobile responsive check
- [ ] Deploy to Vercel
- [ ] Deploy Anchor program to mainnet (or well-tested devnet)
- [ ] Record 3-min demo video
- [ ] Write hackathon submission write-up
- [ ] Submit on Colosseum by May 11

### Deliverable
Fully working app, deployed, submitted.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Compressed NFT minting complexity | Use Helius DAS API + Bubblegum SDK wrappers |
| Anchor program bugs | Extensive devnet testing, simple instructions only |
| Time overrun | Widget + supporter profile are stretch — core tip + badge is MVP |
| Metaplex SDK breaking changes | Pin versions, test against devnet early |

---

## Definition of "Done" for Hackathon

A submission is complete when:
1. Creator can create a profile and get a shareable link
2. Fan can send a SOL tip with a message
3. Fan receives a Compressed NFT badge in their wallet
4. Creator sees tips on their dashboard
5. App is deployed and accessible online
6. Demo video recorded
