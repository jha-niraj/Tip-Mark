"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const stats = [
  { value: "0%", label: "Platform fee" },
  { value: "$0.001", label: "Per badge minted" },
  { value: "< 1s", label: "Tip to badge" },
  { value: "100%", label: "On-chain" },
  { value: "∞", label: "Permanent proof" },
]

export function StatsBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="border-y border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center"
            >
              <div className="flex flex-col items-center px-8 py-2 text-center">
                <span className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{stat.label}</span>
              </div>
              {i < stats.length - 1 && (
                <span className="text-border/70 text-lg select-none hidden sm:inline">|</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
