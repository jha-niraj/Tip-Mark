# TipMark — Features Specification

## MVP Features (Week 1–2, must-have for hackathon)

### 1. Creator Onboarding
- [ ] Connect Solana wallet (Phantom, Backpack, Solflare)
- [ ] Create creator profile: name, bio, avatar (IPFS upload)
- [ ] Auto-generate shareable page: `tipmark.xyz/{username}`
- [ ] Set custom tip amounts / suggestions (0.01, 0.1, 0.5, 1 SOL)

### 2. Tipping Flow
- [ ] Visitor lands on `/{username}` page
- [ ] Connect their wallet
- [ ] Enter tip amount + optional message (stored on-chain)
- [ ] Confirm transaction via wallet
- [ ] SOL goes directly to creator's wallet (no escrow, no fees)
- [ ] Transaction is stored on-chain via Anchor program

### 3. Compressed NFT Badge Minting
- [ ] On successful tip, mint a Compressed NFT to the tipper's wallet
- [ ] Badge tiers by amount:
  - Bronze: < 0.1 SOL
  - Silver: 0.1 – 1 SOL
  - Gold: 1 – 5 SOL
  - Diamond: 5+ SOL
- [ ] Badge metadata: creator name, tip amount, date, tipper message
- [ ] Soul-bound (non-transferable) — set `isMutable: false`
- [ ] Badge art: 4 SVG/PNG templates (one per tier), stored on IPFS

### 4. Creator Dashboard
- [ ] Total SOL received (all-time)
- [ ] List of supporters with: wallet address, tier badge, message, date
- [ ] "Supporter Wall" — top 10 supporters by total amount
- [ ] Copy shareable link button
- [ ] Embed widget code snippet (for creator websites)

---

## Core Features (Week 3, required for full submission)

### 5. Embeddable Widget
- [ ] `<script>` tag or iframe snippet creators paste on their site
- [ ] Shows tip button + creator name
- [ ] Opens TipMark modal on click
- [ ] Works on any website (Beehiiv, Substack, personal sites)

### 6. Supporter Profile Page
- [ ] `tipmark.xyz/wallet/{address}` — all badges owned by a wallet
- [ ] Shows: creator badges, tier, date tipped
- [ ] Public profile — shareable "I support these creators"

### 7. Token-Gated Access (Stretch)
- [ ] Creator sets a badge tier requirement (e.g., "Gold+ only")
- [ ] Gated content: external link unlocked only if wallet holds qualifying badge
- [ ] Use case: Discord invite, exclusive video link, private newsletter

---

## Stretch Features (Week 4, bonus if time allows)

### 8. Creator Tiers / Subscription Mode
- [ ] Monthly recurring tips (if Solana Pay supports it or manual)
- [ ] "Membership" model with monthly badge refresh

### 9. Leaderboard
- [ ] Top creators by total tips this week/month
- [ ] Top supporters across platform

### 10. Social Sharing
- [ ] Auto-generate shareable card when tip is made: "I just supported @creator on TipMark!"
- [ ] Twitter/X intent link with badge image

---

## Out of Scope (not building)
- Multi-token support (USDC, etc.) — SOL only for MVP
- Creator analytics beyond basic dashboard
- Mobile app
- Fiat on-ramp
