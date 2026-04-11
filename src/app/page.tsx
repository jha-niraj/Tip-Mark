import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/landing/hero"
import { StatsBar } from "@/components/landing/stats-bar"
import { Problem } from "@/components/landing/problem"
import { HowItWorks } from "@/components/landing/how-it-works"
import { BadgeTiers } from "@/components/landing/badge-tiers"
import { Comparison } from "@/components/landing/comparison"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <Problem />
        <HowItWorks />
        <BadgeTiers />
        <Comparison />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
