"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuthModal } from "@/components/auth/auth-modal-context"
import { ArrowRight, Heart, Sparkles, Zap } from "lucide-react"

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
	{ wallet: "4rNj...8wLe", amount: "$12", tier: "💳", msg: "Campaign: launch week" },
	{ wallet: "7vBt...1mXc", amount: "0.05 SOL", tier: "🥉", msg: "Keep building!" },
]

export function Hero() {
	const { openSignIn } = useAuthModal()

	return (
		<section className="relative flex min-h-screen items-center overflow-hidden pt-16">
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
				style={{
					backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			<div className="pointer-events-none absolute top-32 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px] dark:bg-primary/12" />

			<div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
				<div className="grid items-center gap-12 lg:grid-cols-2 xl:gap-20">
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className="text-center lg:text-left"
					>
						<motion.div variants={itemVariants}>
							<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
								<span className="h-1.5 w-1.5 rounded-full bg-primary" />
								Solana ◎ + Stripe · one profile
							</div>
						</motion.div>

						<motion.h1
							variants={itemVariants}
							className="text-5xl leading-[1.05] font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
						>
							Tips that leave
							<br />
							<span className="text-primary">a mark.</span>
						</motion.h1>

						<motion.p
							variants={itemVariants}
							className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground lg:mx-0"
						>
							Tip in <strong className="font-semibold text-foreground">SOL</strong> or by{" "}
							<strong className="font-semibold text-foreground">card</strong>. Creators get one
							link, badges, and optional campaigns — you keep{" "}
							<strong className="font-semibold text-foreground">100%</strong> of what’s on-chain.
						</motion.p>

						<motion.div
							variants={itemVariants}
							className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
						>
							<Button
								size="lg"
								className="gap-2 px-7 text-[15px]"
								onClick={() => openSignIn("supporter")}
							>
								<Heart className="h-4 w-4" />
								Start tipping
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="gap-2 text-[15px]"
								onClick={() => openSignIn("creator")}
							>
								<Sparkles className="h-4 w-4" />
								Receive tips
							</Button>
						</motion.div>

						<motion.div variants={itemVariants}>
							<Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" asChild>
								<a href="#how-it-works">How it works →</a>
							</Button>
						</motion.div>

						<motion.div
							variants={itemVariants}
							className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start"
						>
							{["SOL + cards", "One creator profile", "Campaigns (card)", "Open source"].map(
								(item, i) => (
									<span
										key={item}
										className="flex items-center gap-2 text-sm text-muted-foreground"
									>
										{i > 0 && <span className="text-border">·</span>}
										{item}
									</span>
								),
							)}
						</motion.div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="relative hidden items-center justify-center lg:flex"
					>
						<div className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl dark:shadow-none">
							<div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
								<div className="flex gap-1.5">
									{[0, 1, 2].map((i) => (
										<span key={i} className="h-2.5 w-2.5 rounded-full bg-border" />
									))}
								</div>
								<div className="flex-1 rounded border border-border bg-background px-3 py-1 text-center font-mono text-xs text-muted-foreground">
									tipmark.app/u/harkirat
								</div>
							</div>

							<div className="border-b border-border px-5 pt-5 pb-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
											H
										</div>
										<div>
											<p className="text-sm font-semibold">harkirat</p>
											<p className="text-xs text-muted-foreground">SOL + Stripe</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold text-primary">8.3 SOL</p>
										<p className="text-xs text-muted-foreground">earned</p>
									</div>
								</div>
							</div>

							<div className="divide-y divide-border">
								{mockTips.map((tip) => (
									<motion.div
										key={tip.wallet + tip.amount}
										className="flex items-start gap-3 px-5 py-3.5"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.8 }}
									>
										<span className="mt-0.5 text-lg">{tip.tier}</span>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-2">
												<span className="font-mono text-xs text-muted-foreground">
													{tip.wallet}
												</span>
												<span className="text-xs font-semibold text-foreground tabular-nums">
													{tip.amount}
												</span>
											</div>
											<p className="mt-0.5 truncate text-xs text-muted-foreground">
												&ldquo;{tip.msg}&rdquo;
											</p>
										</div>
									</motion.div>
								))}
							</div>

							<div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
								<div className="flex items-center gap-2">
									<div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
										<Zap className="h-3 w-3 fill-current text-primary-foreground" />
									</div>
									<span className="text-xs font-semibold">TipMark</span>
								</div>
								<Button size="sm" className="h-7 px-3 text-xs">
									Tip now
								</Button>
							</div>
						</div>

						<motion.div
							className="absolute -right-4 top-12 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg"
							animate={{ y: [0, -6, 0] }}
							transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						>
							<span className="text-sm">💎</span>
							<span className="ml-1.5 font-medium">Badge minted</span>
						</motion.div>
						<motion.div
							className="absolute -bottom-2 -left-6 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg"
							animate={{ y: [0, -5, 0] }}
							transition={{
								duration: 3.5,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 1,
							}}
						>
							<span className="font-bold text-primary">+0.5 SOL</span>
							<span className="ml-1.5 text-muted-foreground">on-chain</span>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
