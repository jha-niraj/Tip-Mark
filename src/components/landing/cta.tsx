"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { ArrowRight } from "lucide-react"

export function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [signInOpen, setSignInOpen] = useState(false)

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-zinc-950 dark:bg-zinc-900 dark:border dark:border-border px-8 py-16 sm:px-16 sm:py-20 text-center"
        >
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-zinc-500 mb-5">
            Ready to start?
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Start earning tips
            <br />
            on Solana.
          </h2>
          <p className="text-zinc-400 text-lg mt-5 max-w-md mx-auto leading-relaxed">
            Your page is live in 60 seconds. Fans get permanent badges.
            You keep 100% of every tip.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Button
              size="lg"
              className="gap-2 px-8 text-[15px]"
              onClick={() => setSignInOpen(true)}
            >
              Create your free page
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-zinc-400 hover:text-white hover:bg-white/10 text-[15px]"
              asChild
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <p className="text-zinc-600 text-sm mt-8">
            Free forever · Open source · Built on Solana ◎
          </p>
        </motion.div>
      </div>

      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </section>
  )
}
