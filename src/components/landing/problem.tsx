"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { X, Check } from "lucide-react"

const rows = [
  {
    label: "Platform fee on every tip",
    before: "5% — gone before you see it",
    after: "0% — every lamport is yours",
  },
  {
    label: "What fans get for supporting",
    before: "A thank-you email. Nothing else.",
    after: "Permanent soul-bound NFT badge",
  },
  {
    label: "Your earnings history",
    before: "Stored on their servers",
    after: "On-chain, owned by you",
  },
  {
    label: "Platform availability",
    before: "Can be shut down anytime",
    after: "Solana — unstoppable & open",
  },
  {
    label: "Supporter recognition",
    before: "None. Fans are anonymous.",
    after: "Leaderboard, tiers, token-gating",
  },
]

export function Problem() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
            The problem
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Tipping is broken.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Every existing tool takes your money, gives your fans nothing, or could disappear overnight.
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border">
            <div className="px-5 py-3.5 text-xs font-medium tracking-wide text-muted-foreground uppercase bg-muted/40" />
            <div className="px-5 py-3.5 border-l border-border bg-muted/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Other platforms
              </span>
            </div>
            <div className="px-5 py-3.5 border-l border-border bg-primary/5">
              <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                TipMark ⚡
              </span>
            </div>
          </div>

          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
              className="grid grid-cols-[1fr_1fr_1fr] border-b border-border last:border-0"
            >
              {/* Feature label */}
              <div className="px-5 py-4 flex items-start">
                <span className="text-sm font-medium text-foreground">{row.label}</span>
              </div>

              {/* Before */}
              <div className="px-5 py-4 border-l border-border flex items-start gap-2.5 bg-background">
                <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{row.before}</span>
              </div>

              {/* After — TipMark */}
              <div className="px-5 py-4 border-l border-primary/20 flex items-start gap-2.5 bg-primary/[0.03]">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{row.after}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
