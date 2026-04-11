# TipMark — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Creator     │    │  Fan / Tip   │    │  Creator         │  │
│  │  Onboarding  │    │  Page        │    │  Dashboard       │  │
│  │  /onboard    │    │  /[username] │    │  /dashboard      │  │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘  │
│         │                  │                      │             │
│         └──────────────────┴──────────────────────┘            │
│                            │                                    │
│                   Solana Wallet (Phantom)                       │
└────────────────────────────┼────────────────────────────────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
    ┌──────▼───────┐                   ┌───────▼──────────┐
    │  Next.js     │                   │  Solana Devnet   │
    │  API Routes  │                   │  / Mainnet       │
    │  (Vercel)    │                   │                  │
    └──────┬───────┘                   │  ┌────────────┐  │
           │                           │  │  TipMark   │  │
    ┌──────▼───────┐                   │  │  Anchor    │  │
    │  Neon        │                   │  │  Program   │  │
    │  Postgres    │                   │  └────────────┘  │
    │  (metadata   │                   │                  │
    │  cache)      │                   │  ┌────────────┐  │
    └──────────────┘                   │  │  Bubblegum │  │
                                       │  │  (cNFT)    │  │
    ┌──────────────┐                   │  └────────────┘  │
    │  IPFS        │                   └──────────────────┘
    │  (Pinata)    │
    │  badge art   │
    │  + metadata  │
    └──────────────┘
```

## Data Flow: Tipping a Creator

```
Fan                    Next.js              Solana           Metaplex
 │                        │                   │                  │
 │  1. Visit /username     │                   │                  │
 │──────────────────────>  │                   │                  │
 │                        │                   │                  │
 │  2. Connect wallet      │                   │                  │
 │<──────────────────────  │                   │                  │
 │                        │                   │                  │
 │  3. Fill tip form       │                   │                  │
 │──────────────────────>  │                   │                  │
 │                        │                   │                  │
 │  4. Sign transaction    │                   │                  │
 │──────────────────────────────────────────>  │                  │
 │                        │                   │                  │
 │                        │  5. TipMark:send_tip instruction      │
 │                        │──────────────────> │                  │
 │                        │                   │                  │
 │                        │  6. On-chain tip record stored        │
 │                        │  (tipper, creator, amount, msg)       │
 │                        │                   │                  │
 │                        │  7. Confirm tx    │                  │
 │                        │<────────────────── │                  │
 │                        │                   │                  │
 │                        │  8. Mint cNFT badge to tipper        │
 │                        │────────────────────────────────────> │
 │                        │                   │                  │
 │  9. Badge in wallet     │                   │                  │
 │<────────────────────────────────────────────────────────────  │
 │                        │                   │                  │
 │                        │  10. Store tip in Neon DB            │
 │                        │──── (POST /api/tips) ────>           │
```

## Anchor Program Accounts

### `CreatorProfile`
```rust
pub struct CreatorProfile {
    pub authority: Pubkey,      // Creator's wallet
    pub username: String,       // "harkirat" (max 32 chars)
    pub total_received: u64,    // In lamports
    pub tip_count: u32,
    pub bump: u8,
}
```

### `TipRecord`
```rust
pub struct TipRecord {
    pub tipper: Pubkey,
    pub creator: Pubkey,
    pub amount: u64,            // In lamports
    pub message: String,        // Max 280 chars
    pub timestamp: i64,
    pub badge_tier: u8,         // 0=Bronze, 1=Silver, 2=Gold, 3=Diamond
    pub bump: u8,
}
```

### Program Instructions
1. `create_creator_profile(username: String)` — creates PDA for creator
2. `send_tip(amount: u64, message: String)` — transfers SOL, stores record, emits event

## Database Schema (Neon Postgres)

```sql
-- Creator profiles (cache from on-chain + extra metadata)
CREATE TABLE creators (
  id          SERIAL PRIMARY KEY,
  wallet      VARCHAR(44) UNIQUE NOT NULL,
  username    VARCHAR(32) UNIQUE NOT NULL,
  name        TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Tip records (synced from on-chain events)
CREATE TABLE tips (
  id          SERIAL PRIMARY KEY,
  tx_hash     VARCHAR(88) UNIQUE NOT NULL,
  tipper      VARCHAR(44) NOT NULL,
  creator     VARCHAR(44) NOT NULL,
  amount_sol  DECIMAL(18,9) NOT NULL,
  message     TEXT,
  badge_tier  VARCHAR(10),   -- 'bronze','silver','gold','diamond'
  nft_mint    VARCHAR(44),   -- Compressed NFT asset ID
  created_at  TIMESTAMP DEFAULT NOW()
);
```

## NFT Badge Metadata Structure

```json
{
  "name": "TipMark Gold Badge — @harkirat",
  "symbol": "TIPMARK",
  "description": "Proof of support for @harkirat on TipMark",
  "image": "ipfs://Qm.../gold-badge.png",
  "attributes": [
    { "trait_type": "Tier", "value": "Gold" },
    { "trait_type": "Creator", "value": "@harkirat" },
    { "trait_type": "Amount", "value": "2.5 SOL" },
    { "trait_type": "Date", "value": "2026-04-15" },
    { "trait_type": "Soul-Bound", "value": "true" }
  ],
  "properties": {
    "creators": [{ "address": "<creator_wallet>", "share": 100 }]
  }
}
```
