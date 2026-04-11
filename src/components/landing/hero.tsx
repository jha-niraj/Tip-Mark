"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { ArrowRight, Zap } from "lucide-react"

const containerVariants: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const mockTips = [
	{ wallet: "9xKm...3fPq", amount: "2.5 SOL", tier: "🥇", msg: "Love your content!" },
	{ wallet: "4rNj...8wLe", amount: "0.3 SOL", tier: "🥈", msg: "Day 1 supporter here" },
	{ wallet: "7vBt...1mXc", amount: "0.05 SOL", tier: "🥉", msg: "Keep building!" },
]

export function Hero() {
	const [signInOpen, setSignInOpen] = useState(false)

	return (
		<section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
			{/* Minimal dot grid */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
				style={{
					backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			{/* Single centered glow */}
			<div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/8 dark:bg-primary/12 rounded-full blur-[100px] pointer-events-none" />

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
				<div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

					{/* Left — copy */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className="text-center lg:text-left"
					>
						{/* Announcement pill */}
						<motion.div variants={itemVariants}>
							<div className="inline-flex items-center gap-2 mb-8 border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground">
								<span className="h-1.5 w-1.5 rounded-full bg-primary" />
								Built on Solana ◎ &mdash; Colosseum Frontier 2026
							</div>
						</motion.div>

						<motion.h1
							variants={itemVariants}
							className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-foreground"
						>
							Tips that leave
							<br />
							<span className="text-primary">a mark.</span>
						</motion.h1>

						<motion.p
							variants={itemVariants}
							className="mt-5 text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed"
						>
							Your fans tip in SOL. They receive a permanent on-chain proof-of-support
							badge. You keep <strong className="text-foreground font-semibold">100%</strong>.
							No fees. No middlemen.
						</motion.p>

						<motion.div
							variants={itemVariants}
							className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start"
						>
							<Button
								size="lg"
								className="gap-2 px-7 text-[15px]"
								onClick={() => setSignInOpen(true)}
							>
								Create your page
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button variant="outline" size="lg" className="text-[15px]" asChild>
								<a href="#how-it-works">How it works</a>
							</Button>
						</motion.div>

						{/* Trust strip */}
						<motion.div
							variants={itemVariants}
							className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 justify-center lg:justify-start"
						>
							{[
								"0% platform fee",
								"$0.001 per badge",
								"Instant SOL payout",
								"Open source",
							].map((item, i) => (
								<span key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
									{i > 0 && <span className="text-border">·</span>}
									{item}
								</span>
							))}
						</motion.div>
					</motion.div>

					{/* Right — product mockup */}
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="relative hidden lg:flex items-center justify-center"
					>
						<div className="w-full max-w-[400px] rounded-2xl border border-border bg-card shadow-xl dark:shadow-none overflow-hidden">
							{/* Browser chrome */}
							<div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/40">
								<div className="flex gap-1.5">
									{[0, 1, 2].map((i) => (
										<span key={i} className="h-2.5 w-2.5 rounded-full bg-border" />
									))}
								</div>
								<div className="flex-1 bg-background border border-border rounded px-3 py-1 text-xs text-muted-foreground text-center font-mono">
									tipmark.xyz/harkirat
								</div>
							</div>

							{/* Creator header */}
							<div className="px-5 pt-5 pb-4 border-b border-border">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm">
											H
										</div>
										<div>
											<p className="font-semibold text-sm">harkirat</p>
											<p className="text-xs text-muted-foreground">47 supporters</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold text-primary">8.3 SOL</p>
										<p className="text-xs text-muted-foreground">earned</p>
									</div>
								</div>
							</div>

							{/* Tip feed */}
							<div className="divide-y divide-border">
								{mockTips.map((tip) => (
									<motion.div
										key={tip.wallet}
										className="flex items-start gap-3 px-5 py-3.5"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.8 }}
									>
										<span className="text-lg mt-0.5">{tip.tier}</span>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between gap-2">
												<span className="text-xs font-mono text-muted-foreground">{tip.wallet}</span>
												<span className="text-xs font-semibold text-foreground tabular-nums">{tip.amount}</span>
											</div>
											<p className="text-xs text-muted-foreground mt-0.5 truncate">&ldquo;{tip.msg}&rdquo;</p>
										</div>
									</motion.div>
								))}
							</div>

							{/* Footer */}
							<div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
										<Zap className="h-3 w-3 text-primary-foreground fill-current" />
									</div>
									<span className="text-xs font-semibold">TipMark</span>
								</div>
								<Button size="sm" className="h-7 text-xs px-3">Tip now</Button>
							</div>
						</div>

						{/* Subtle floating badge hint */}
						<motion.div
							className="absolute -right-4 top-12 bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs"
							animate={{ y: [0, -6, 0] }}
							transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						>
							<span className="text-sm">💎</span>
							<span className="ml-1.5 font-medium">Diamond badge minted</span>
						</motion.div>
						<motion.div
							className="absolute -left-6 bottom-16 bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs"
							animate={{ y: [0, -5, 0] }}
							transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
						>
							<span className="text-primary font-bold">+0.5 SOL</span>
							<span className="ml-1.5 text-muted-foreground">received</span>
						</motion.div>
					</motion.div>
				</div>
			</div>

			<SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
		</section>
	)
}
