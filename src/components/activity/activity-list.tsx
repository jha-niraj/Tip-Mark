"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import type { SerializedTip } from "@/lib/serialize-tip"

function formatUsd(cents: number) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		cents / 100,
	)
}

export function ActivityList({ tips }: { tips: SerializedTip[] }) {
	if (tips.length === 0) {
		return (
			<p className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center text-sm text-muted-foreground">
				No tips yet. When you support creators, they&apos;ll show up here.
			</p>
		)
	}

	return (
		<div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
			{tips.map((tip, i) => (
				<motion.div
					key={tip.id}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: Math.min(0.02 * i, 0.3) }}
					className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="text-[10px]">
								{tip.rail}
							</Badge>
							<span className="font-medium">
								{tip.creatorDisplayName || tip.creatorSlug || "Creator"}
							</span>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							{tip.campaign?.title ? `${tip.campaign.title} · ` : ""}
							{new Date(tip.createdAt).toLocaleString()} · {tip.status}
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
			))}
		</div>
	)
}
