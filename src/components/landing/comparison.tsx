"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check, X, Minus } from "lucide-react"

type CellVal = true | false | "partial"

interface Row {
  feature: string
  tipmark: CellVal
  buymeacoffee: CellVal
  basic: CellVal
}

const rows: Row[] = [
  { feature: "Platform fee",               tipmark: true,     buymeacoffee: false,     basic: true },
  { feature: "On-chain supporter badge",   tipmark: true,     buymeacoffee: false,     basic: false },
  { feature: "Soul-bound NFT proof",       tipmark: true,     buymeacoffee: false,     basic: false },
  { feature: "Decentralized",              tipmark: true,     buymeacoffee: false,     basic: "partial" },
  { feature: "Embeddable widget",          tipmark: true,     buymeacoffee: true,      basic: false },
  { feature: "Supporter leaderboard",      tipmark: true,     buymeacoffee: false,     basic: false },
  { feature: "Token-gated content",        tipmark: true,     buymeacoffee: false,     basic: false },
  { feature: "Direct crypto payout",       tipmark: true,     buymeacoffee: false,     basic: true },
  { feature: "No account to tip",          tipmark: true,     buymeacoffee: false,     basic: true },
]

const feeValues: Record<string, string> = {
  tipmark: "0%",
  buymeacoffee: "5%",
  basic: "0%",
}

function Cell({ val, col, rowIdx }: { val: CellVal; col: string; rowIdx: number }) {
  if (rowIdx === 0) {
    return (
      <span className={`text-sm font-bold tabular-nums ${
        col === "tipmark" ? "text-primary" :
        val ? "text-muted-foreground" : "text-red-500 dark:text-red-400"
      }`}>
        {feeValues[col]}
      </span>
    )
  }
  if (val === true) {
    return col === "tipmark" ? (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground">
        <Check className="h-3.5 w-3.5" />
      </span>
    ) : (
      <Check className="h-4 w-4 text-muted-foreground/50" />
    )
  }
  if (val === "partial") return <Minus className="h-4 w-4 text-muted-foreground/40" />
  return <X className="h-4 w-4 text-muted-foreground/25" />
}

export function Comparison() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="compare" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
            Compare
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Why TipMark wins.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We didn&apos;t build another tip jar. We built proof of support.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative"
        >
          {/* "Recommended" pill above TipMark column */}
          <div className="absolute -top-4 left-[calc(25%+2px)] w-[calc(25%-4px)] flex justify-center z-10">
            <span className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              Recommended
            </span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {/* Column headers */}
            <div className="grid grid-cols-4 border-b border-border text-sm">
              <div className="px-4 py-3.5 bg-muted/40" />
              {/* TipMark — featured */}
              <div className="px-4 py-3.5 text-center border-l border-primary/30 bg-primary/5">
                <span className="font-bold text-primary text-sm">TipMark</span>
              </div>
              <div className="px-4 py-3.5 text-center border-l border-border">
                <span className="font-medium text-muted-foreground text-xs">Buy Me a Coffee</span>
              </div>
              <div className="px-4 py-3.5 text-center border-l border-border">
                <span className="font-medium text-muted-foreground text-xs">Basic Tip Jar</span>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                className="grid grid-cols-4 border-t border-border group"
              >
                <div className="px-4 py-3.5 flex items-center text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                  {row.feature}
                </div>
                {/* TipMark cell */}
                <div className="px-4 py-3.5 flex items-center justify-center border-l border-primary/20 bg-primary/[0.03]">
                  <Cell val={row.tipmark} col="tipmark" rowIdx={i} />
                </div>
                <div className="px-4 py-3.5 flex items-center justify-center border-l border-border">
                  <Cell val={row.buymeacoffee} col="buymeacoffee" rowIdx={i} />
                </div>
                <div className="px-4 py-3.5 flex items-center justify-center border-l border-border">
                  <Cell val={row.basic} col="basic" rowIdx={i} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
