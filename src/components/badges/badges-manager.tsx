"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
	createCreatorBadge,
	deleteCreatorBadge,
} from "@/actions/badges"
import type { CreatorBadge } from "@/generated/prisma/client"
import { toast } from "sonner"

function formatUsd(cents: number) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		cents / 100,
	)
}

export function BadgesManager({ initial }: { initial: CreatorBadge[] }) {
	const [badges, setBadges] = useState(initial)
	const [name, setName] = useState("")
	const [description, setDescription] = useState("")
	const [emoji, setEmoji] = useState("")
	const [dollars, setDollars] = useState("5")
	const [busy, setBusy] = useState(false)

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault()
		const n = Number.parseFloat(dollars.replace(/[^0-9.]/g, ""))
		if (!Number.isFinite(n) || n < 0.5) {
			toast.error("Price must be at least $0.50.")
			return
		}
		const amountCents = Math.round(n * 100)
		setBusy(true)
		const res = await createCreatorBadge({
			name: name.trim(),
			description: description.trim() || undefined,
			emoji: emoji.trim() || undefined,
			amountCents,
		})
		setBusy(false)
		if (!res.ok) {
			toast.error(res.error)
			return
		}
		if (res.ok && "badge" in res && res.badge) {
			setBadges((prev) => [...prev, res.badge])
		}
		setName("")
		setDescription("")
		setEmoji("")
		setDollars("5")
		toast.success("Badge added")
	}

	const handleDelete = async (id: string) => {
		setBusy(true)
		const res = await deleteCreatorBadge(id)
		setBusy(false)
		if (!res.ok) {
			toast.error(res.error)
			return
		}
		setBadges((prev) => prev.filter((b) => b.id !== id))
		toast.success("Removed")
	}

	return (
		<div className="space-y-10">
			<section>
				<h2 className="text-lg font-semibold">Your badge tiers</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Each tier has a fixed card price. Supporters who pay unlock the badge on their
					dashboard.
				</p>
				<div className="mt-4 space-y-3">
					{badges.length === 0 ? (
						<p className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground">
							No badges yet — add your first tier below.
						</p>
					) : (
						badges.map((b, i) => (
							<motion.div
								key={b.id}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.03 * i }}
								className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
							>
								<div>
									<p className="font-medium">
										{b.emoji ? `${b.emoji} ` : ""}
										{b.name}
									</p>
									{b.description && (
										<p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
									)}
								</div>
								<div className="flex items-center gap-3">
									<Badge variant="secondary">{formatUsd(b.amountCents)}</Badge>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="text-destructive hover:text-destructive"
										disabled={busy}
										onClick={() => void handleDelete(b.id)}
										aria-label="Delete badge"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</motion.div>
						))
					)}
				</div>
			</section>

			<section className="rounded-2xl border border-border bg-muted/20 p-6">
				<h3 className="font-semibold">Add a badge tier</h3>
				<form onSubmit={(e) => void handleAdd(e)} className="mt-4 space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="b-name">Name</Label>
							<Input
								id="b-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Supporter · Gold"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="b-emoji">Emoji (optional)</Label>
							<Input
								id="b-emoji"
								value={emoji}
								onChange={(e) => setEmoji(e.target.value)}
								placeholder="⭐"
								maxLength={8}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="b-desc">Description (optional)</Label>
						<Input
							id="b-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Shown on your public page"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="b-price">Price (USD)</Label>
						<div className="relative max-w-xs">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
								$
							</span>
							<Input
								id="b-price"
								className="pl-7 font-mono"
								value={dollars}
								onChange={(e) => setDollars(e.target.value)}
								inputMode="decimal"
								required
							/>
						</div>
					</div>
					<Button type="submit" disabled={busy}>
						{busy ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								<Plus className="mr-2 h-4 w-4" />
								Add badge
							</>
						)}
					</Button>
				</form>
			</section>
		</div>
	)
}
