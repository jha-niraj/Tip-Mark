"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const steps = [
	{
		n: "01",
		title: "Create your profile",
		desc: "Sign in with your email. Connect your Solana wallet. Set your username, bio, and avatar — done in under 60 seconds.",
		aside: "Live at tipmark.xyz/yourname",
	},
	{
		n: "02",
		title: "Share your link",
		desc: "Drop your TipMark link in your bio, YouTube description, newsletter, or embed the one-line widget on your site.",
		aside: "Embed snippet included",
	},
	{
		n: "03",
		title: "Tips arrive. Badges mint.",
		desc: "A fan sends SOL with a message. The SOL hits your wallet instantly. A permanent badge mints to their wallet — automatically.",
		aside: "Fully automated, no action needed",
	},
]

export function HowItWorks() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, margin: "-80px" })

	return (
		<section id="how-it-works" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="text-center mb-16"
				>
					<p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">
						How it works
					</p>
					<h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
						Three steps.
						<br />
						<span className="text-primary">That&apos;s genuinely it.</span>
					</h2>
				</motion.div>

				<div className="grid lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
					{
						steps.map((step, i) => (
							<motion.div
								key={step.n}
								initial={{ opacity: 0, y: 24 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
								className="bg-background p-8 flex flex-col gap-5"
							>
								<span className="text-[56px] font-black leading-none text-border select-none tabular-nums">
									{step.n}
								</span>
								<div className="flex-1">
									<h3 className="text-lg font-bold mb-2">{step.title}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
								</div>
								<div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1.5 w-fit">
									<span className="text-primary">→</span>
									{step.aside}
								</div>
							</motion.div>
						))
					}
				</div>
			</div>
		</section>
	)
}