# TipMark — Tech Stack

## Frontend

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR for creator pages, API routes, familiar |
| Styling | Tailwind CSS | Fast UI development |
| Language | TypeScript | Type safety across Solana types |
| State | React Context + useState | Simple enough, no Redux needed |
| Forms | React Hook Form | Clean form handling |

## Solana / Web3

| Layer | Technology | Why |
|-------|-----------|-----|
| Wallet | `@solana/wallet-adapter-react` | Standard multi-wallet support |
| Wallets | Phantom, Backpack, Solflare | Most popular Solana wallets |
| On-chain program | Anchor (Rust) | Easiest Solana framework for programs |
| NFT minting | Metaplex Bubblegum | Compressed NFTs (~$0.001 each vs $1+ regular) |
| Metaplex SDK | `@metaplex-foundation/umi` | Modern Metaplex client SDK |
| RPC | Helius (devnet → mainnet) | Fast, reliable, free tier available |
| Network | Solana Devnet (dev) → Mainnet (prod) | |

## Backend / Database

| Layer | Technology | Why |
|-------|-----------|-----|
| Database | Neon Postgres (serverless) | Profile metadata, username → wallet mapping |
| ORM | Prisma | Type-safe queries |
| API | Next.js API routes | No separate server needed |
| Auth | Wallet signature (no passwords) | Web3-native auth via `signMessage` |
| File storage | IPFS via NFT.Storage or Pinata | Profile images, badge artwork |

## Anchor Program (Smart Contract)

The on-chain program handles:
- Storing tip records (tipper, creator, amount, message, timestamp)
- Acting as a registry for creator profiles (wallet → username mapping)
- Emitting events for the frontend to listen to

Program is deployed to Solana Devnet during development, Mainnet for submission.

## Deployment

| Layer | Platform |
|-------|----------|
| Frontend | Vercel |
| Database | Neon Postgres (cloud) |
| NFT metadata | IPFS (Pinata) |
| Smart contract | Solana Devnet / Mainnet |

## Key Dependencies

```json
{
  "@solana/web3.js": "^1.x",
  "@solana/wallet-adapter-react": "^0.15.x",
  "@solana/wallet-adapter-wallets": "^0.19.x",
  "@coral-xyz/anchor": "^0.30.x",
  "@metaplex-foundation/umi": "^0.9.x",
  "@metaplex-foundation/mpl-bubblegum": "^4.x",
  "next": "15.x",
  "tailwindcss": "^4.x",
  "prisma": "^5.x",
  "@prisma/client": "^5.x"
}
```
