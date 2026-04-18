"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SupporterDashboardPayload } from "@/actions/dashboard"
function formatUsd(cents: number) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		cents / 100,
	)
}

export function SupporterHome({ initial }: { initial: SupporterDashboardPayload }) {
	const { stats, recentTips } = initial

	return (
		<div className="min-h-screen bg-background">
			<div className="relative overflow-hidden border-b border-border">
				<div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
				<div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
					>
						<div>
							<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
								<Heart className="h-3.5 w-3.5 text-primary" />
								Supporter
							</div>
							<h1 className="text-4xl font-bold tracking-tight">Your impact</h1>
							<p className="mt-2 max-w-lg text-muted-foreground">
								Every SOL and card tip shows up here. Creators you support get the full
								story in their dashboard.
							</p>
						</div>
						<Button asChild variant="outline" className="gap-2">
							<Link href="/activity">
								Full activity
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</motion.div>

					<div className="mt-10 grid gap-4 sm:grid-cols-3">
						{[
							{ label: "Total tips sent", value: String(stats.tipsSent), icon: Sparkles },
							{ label: "SOL tips", value: String(stats.solTips), icon: Sparkles },
							{
								label: "Card tips (USD)",
								value: formatUsd(stats.totalCardCents),
								icon: Sparkles,
							},
						].map((c, i) => (
							<motion.div
								key={c.label}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.06 * i }}
								className="rounded-2xl border border-border bg-card p-5"
							>
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									{c.label}
								</p>
								<p className="mt-2 text-2xl font-bold tabular-nums">{c.value}</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			<main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
				<h2 className="mb-4 text-lg font-semibold">Recent tips</h2>
				<div className="overflow-hidden rounded-2xl border border-border">
					<div className="divide-y divide-border">
						{recentTips.length === 0 ? (
							<p className="px-6 py-14 text-center text-sm text-muted-foreground">
								You haven&apos;t sent a tip yet. Open a creator&apos;s public page and support
								them with SOL or card.
							</p>
						) : (
							recentTips.map((tip, i) => (
								<motion.div
									key={tip.id}
									initial={{ opacity: 0, x: -8 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.03 * i }}
									className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-[10px]">
												{tip.rail}
											</Badge>
											<span className="font-medium">
												{tip.creatorDisplayName || tip.creatorSlug || "Creator"}
											</span>
										</div>
										<p className="mt-1 text-xs text-muted-foreground">
											{tip.campaign?.title ? `${tip.campaign.title} · ` : ""}
											{new Date(tip.createdAt).toLocaleString()}
										</p>
									</div>
									<p className="text-lg font-semibold tabular-nums">
										{tip.rail === "SOLANA"
											? `${tip.amountSol ?? "0"} SOL`
											: tip.amountCents != null
												? formatUsd(tip.amountCents)
												: "—"}
									</p>
								</motion.div>
							))
						)}
					</div>
				</div>
			</main>
		</div>
	)
}
