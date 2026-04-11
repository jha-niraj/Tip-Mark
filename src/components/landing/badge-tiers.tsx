"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Bronze",
    emoji: "🥉",
    range: "< 0.1 SOL",
    desc: "You showed up before they were famous.",
    perks: ["On-chain badge", "Supporter wall listing", "Proof of early support"],
    accent: "#b45309",   /* amber-700 */
    darkAccent: "#d97706",
  },
  {
    name: "Silver",
    emoji: "🥈",
    range: "0.1 – 1 SOL",
    desc: "Genuine fan backing the creator they believe in.",
    perks: ["On-chain badge", "Supporter wall listing", "Silver-tier recognition"],
    accent: "#a1a1aa",   /* zinc-400 */
    darkAccent: "#71717a",
  },
  {
    name: "Gold",
    emoji: "🥇",
    range: "1 – 5 SOL",
    desc: "Power supporter. Top-tier backing for a creator's work.",
    perks: ["On-chain badge", "Supporter wall — top section", "Token-gated content access"],
    accent: "#f59e0b",   /* amber-500 */
    darkAccent: "#fbbf24",
    featured: true,
  },
  {
    name: "Diamond",
    emoji: "💎",
    range: "5+ SOL",
    desc: "Legend status. The inner circle. Forever on-chain.",
    perks: ["On-chain badge", "Hall of fame listing", "All token-gated perks", "Direct creator message"],
    accent: "#52525b",   /* zinc-600 */
    darkAccent: "#a1a1aa",
  },
]

export function BadgeTiers() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="badge-tiers" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
            Supporter badges
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Every tip tells a story.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Supporters earn soul-bound NFT badges based on tip amount.
            Non-transferable. Permanent. On Solana.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.09 }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    Most popular
                  </span>
                </div>
              )}

              <div
                className="h-full rounded-xl border border-border bg-card flex flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md dark:group-hover:shadow-none dark:group-hover:border-border/80"
                style={
                  {
                    "--tier-accent": tier.accent,
                  } as React.CSSProperties
                }
              >
                {/* Top accent strip */}
                <div
                  className="h-[3px] w-full flex-shrink-0"
                  style={{ background: tier.accent }}
                />

                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tier.emoji}</span>
                      <span className="font-bold text-base">{tier.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 tabular-nums">
                      {tier.range}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-snug">{tier.desc}</p>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Perks */}
                  <ul className="space-y-2 mt-auto">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-foreground/80">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-7"
        >
          Soul-bound — cannot be transferred or sold. Permanent proof.
        </motion.p>
      </div>
    </section>
  )
}
