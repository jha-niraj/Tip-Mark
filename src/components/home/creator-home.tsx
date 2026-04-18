"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
	ArrowRight,
	CreditCard,
	ExternalLink,
	Sparkles,
	Wallet,
	Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CreatorDashboardPayload } from "@/actions/dashboard"
import type { SerializedTip } from "@/lib/serialize-tip"

function formatUsd(cents: number) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		cents / 100,
	)
}

function TipRow({ tip }: { tip: SerializedTip }) {
	const isSol = tip.rail === "SOLANA"
	return (
		<tr className="border-b border-border/60 last:border-0">
			<td className="py-3 pr-3">
				<Badge variant="secondary" className="font-mono text-[10px]">
					{isSol ? "SOL" : "CARD"}
				</Badge>
			</td>
			<td className="py-3 pr-3 text-sm">
				{isSol ? (
					<span className="font-medium tabular-nums">{tip.amountSol ?? "—"} SOL</span>
				) : (
					<span className="font-medium tabular-nums">
						{tip.amountCents != null ? formatUsd(tip.amountCents) : "—"}
					</span>
				)}
			</td>
			<td className="max-w-[140px] truncate py-3 text-sm text-muted-foreground">
				{tip.supporter?.name || tip.supporter?.email || tip.tipperWallet || "Anonymous"}
			</td>
			<td className="hidden py-3 text-sm text-muted-foreground sm:table-cell">
				{tip.campaign?.title ?? "—"}
			</td>
			<td className="py-3 text-right text-xs text-muted-foreground">
				{new Date(tip.createdAt).toLocaleDateString()}
			</td>
		</tr>
	)
}

export function CreatorHome({ initial }: { initial: CreatorDashboardPayload }) {
	const { profile, stats, recentTips, campaigns } = initial

	return (
		<div className="min-h-screen bg-background">
			<div className="relative overflow-hidden border-b border-border">
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
				<div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
					>
						<div>
							<h1 className="text-4xl font-bold tracking-tight">Creator dashboard</h1>
							<p className="mt-2 max-w-xl text-muted-foreground">
								Solana tips and card tips in one place. Share your public link and run
								campaigns.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button asChild className="gap-2">
								<Link href="/campaigns?new=1">
									<Sparkles className="h-4 w-4" />
									New campaign
								</Link>
							</Button>
							{profile && (
								<Button variant="outline" asChild className="gap-2">
									<Link href={`/u/${profile.slug}`} target="_blank" rel="noreferrer">
										<ExternalLink className="h-4 w-4" />
										Public page
									</Link>
								</Button>
							)}
						</div>
					</motion.div>

					<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{
								label: "Tips received",
								value: String(stats.succeededTips),
								sub: `${stats.solTipsCount} SOL · ${stats.cardTipsCount} card`,
								icon: Zap,
							},
							{
								label: "Card volume (Stripe)",
								value: formatUsd(stats.totalCardCents),
								sub: profile?.stripeChargesEnabled
									? "Payouts ready"
									: "Connect in Settings",
								icon: CreditCard,
							},
							{
								label: "Active campaigns",
								value: String(stats.activeCampaigns),
								sub: "Card tips",
								icon: Sparkles,
							},
							{
								label: "Solana wallet",
								value: profile?.solanaWallet ? "Linked" : "Not set",
								sub: profile?.solanaWallet
									? `${profile.solanaWallet.slice(0, 4)}…${profile.solanaWallet.slice(-4)}`
									: "Add in Settings",
								icon: Wallet,
							},
						].map((card, i) => (
							<motion.div
								key={card.label}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.05 * i, duration: 0.35 }}
								className="rounded-2xl border border-border bg-card p-5 shadow-sm"
							>
								<div className="flex items-center justify-between gap-2">
									<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										{card.label}
									</p>
									<card.icon className="h-4 w-4 text-primary" />
								</div>
								<p className="mt-3 text-2xl font-bold tabular-nums">{card.value}</p>
								<p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			<main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="grid gap-10 lg:grid-cols-2">
					<section>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-semibold">Recent tips</h2>
							<Button variant="ghost" size="sm" asChild>
								<Link href="/campaigns" className="gap-1 text-primary">
									Manage <ArrowRight className="h-3.5 w-3.5" />
								</Link>
							</Button>
						</div>
						<div className="overflow-hidden rounded-2xl border border-border">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
										<th className="px-4 py-2">Rail</th>
										<th className="px-4 py-2">Amount</th>
										<th className="px-4 py-2">From</th>
										<th className="hidden px-4 py-2 sm:table-cell">Campaign</th>
										<th className="px-4 py-2 text-right">Date</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{recentTips.length === 0 ? (
										<tr>
											<td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
												No tips yet. Share your link and enable payouts in Settings.
											</td>
										</tr>
									) : (
										recentTips.map((tip) => <TipRow key={tip.id} tip={tip} />)
									)}
								</tbody>
							</table>
						</div>
					</section>

					<section>
						<h2 className="mb-4 text-lg font-semibold">Campaigns</h2>
						<div className="space-y-3">
							{campaigns.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
									No campaigns yet.{" "}
									<Link href="/campaigns" className="font-medium text-primary underline-offset-4 hover:underline">
										Create one
									</Link>
								</div>
							) : (
								campaigns.map((c, i) => (
									<motion.div
										key={c.id}
										initial={{ opacity: 0, x: 12 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.04 * i }}
										className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
									>
										<div>
											<p className="font-medium">{c.title}</p>
											<p className="text-xs text-muted-foreground">Status: {c.status}</p>
										</div>
										<Button variant="outline" size="sm" asChild>
											<Link href="/campaigns">Edit</Link>
										</Button>
									</motion.div>
								))
							)}
						</div>
					</section>
				</div>

				{!profile && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center"
					>
						<p className="text-sm text-muted-foreground">
							Finish setup in{" "}
							<Link href="/settings" className="font-semibold text-primary">
								Settings
							</Link>{" "}
							to claim your URL and payout methods.
						</p>
					</motion.div>
				)}
			</main>
		</div>
	)
}
