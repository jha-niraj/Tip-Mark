"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
	ArrowRight,
	CreditCard,
	Loader2,
	Sparkles,
	Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthModal } from "@/components/auth/auth-modal-context"
import { useSession } from "next-auth/react"
import { createTipCheckoutSession } from "@/actions/checkout"
import { toast } from "sonner"
import type { Campaign, CreatorBadge, CreatorProfile } from "@/generated/prisma/client"

type Props = {
	profile: CreatorProfile & { campaigns: Campaign[]; badges: CreatorBadge[] }
}

function formatUsd(cents: number) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		cents / 100,
	)
}

export function PublicCreatorPage({ profile }: Props) {
	const { data: session } = useSession()
	const { openSignIn } = useAuthModal()
	const [loadingKey, setLoadingKey] = useState<string | null>(null)
	const [customDollars, setCustomDollars] = useState("5.00")

	const parseCustomCents = useMemo(() => {
		const n = Number.parseFloat(customDollars.replace(/[^0-9.]/g, ""))
		if (!Number.isFinite(n)) return null
		return Math.round(n * 100)
	}, [customDollars])

	const handleCardTip = async (opts: {
		amountCents: number
		creatorBadgeId?: string | null
		campaignId?: string | null
		key: string
	}) => {
		if (!session) {
			openSignIn("supporter")
			toast.message("Sign in to complete card tips with Stripe.")
			return
		}
		setLoadingKey(opts.key)
		const res = await createTipCheckoutSession({
			creatorProfileId: profile.id,
			campaignId: opts.campaignId ?? null,
			amountCents: opts.amountCents,
			creatorBadgeId: opts.creatorBadgeId ?? null,
		})
		setLoadingKey(null)
		if (!res.ok) {
			toast.error("error" in res ? res.error : "Checkout unavailable")
			return
		}
		window.location.href = res.url
	}

	const onCustomTip = () => {
		const cents = parseCustomCents
		if (cents == null || cents < 50) {
			toast.error("Enter at least $0.50 for card tips.")
			return
		}
		void handleCardTip({
			amountCents: cents,
			key: "custom",
		})
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="relative overflow-hidden border-b border-border">
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
				<div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45 }}
					>
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
							{profile.avatarUrl ? (
								// Arbitrary HTTPS avatars — avoid Next/Image hostname allowlist.
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={profile.avatarUrl}
									alt=""
									className="h-full w-full object-cover"
								/>
							) : (
								(profile.displayName ?? profile.slug).slice(0, 1).toUpperCase()
							)}
						</div>
						<h1 className="text-4xl font-bold tracking-tight">
							{profile.displayName ?? profile.slug}
						</h1>
						{profile.bio && (
							<p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">
								{profile.bio}
							</p>
						)}
						<div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
							{profile.solanaWallet && (
								<span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
									<Wallet className="h-3.5 w-3.5" />
									SOL tips
								</span>
							)}
							<span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
								<CreditCard className="h-3.5 w-3.5" />
								Card tips
							</span>
						</div>
					</motion.div>
				</div>
			</div>

			<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
				<section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<h2 className="text-lg font-semibold">Tip with card (any amount)</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Enter any amount from $0.50 — not tied to a badge tier.
					</p>
					<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
						<div className="flex-1 space-y-2">
							<Label htmlFor="amt">Amount (USD)</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									$
								</span>
								<Input
									id="amt"
									inputMode="decimal"
									className="pl-7 font-mono tabular-nums"
									value={customDollars}
									onChange={(e) => setCustomDollars(e.target.value)}
								/>
							</div>
						</div>
						<Button
							size="lg"
							className="gap-2 sm:min-w-[160px]"
							onClick={onCustomTip}
							disabled={loadingKey !== null}
						>
							{loadingKey === "custom" ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CreditCard className="h-4 w-4" />
							)}
							Pay with Stripe
						</Button>
					</div>
				</section>

				{profile.badges.length > 0 && (
					<section className="mt-10">
						<h2 className="mb-1 text-lg font-semibold">Badge tiers</h2>
						<p className="text-sm text-muted-foreground">
							Fixed-price tiers this creator configured — each unlocks a supporter badge on
							your dashboard.
						</p>
						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							{profile.badges.map((b, i) => (
								<motion.div
									key={b.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.04 * i }}
									className="flex flex-col rounded-2xl border border-border bg-card p-4"
								>
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="text-lg font-semibold">
												{b.emoji ? `${b.emoji} ` : ""}
												{b.name}
											</p>
											{b.description && (
												<p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
											)}
										</div>
										<Badge variant="secondary" className="shrink-0">
											{formatUsd(b.amountCents)}
										</Badge>
									</div>
									<Button
										className="mt-4 gap-2"
										variant="default"
										disabled={loadingKey !== null}
										onClick={() =>
											void handleCardTip({
												amountCents: b.amountCents,
												creatorBadgeId: b.id,
												key: b.id,
											})
										}
									>
										{loadingKey === b.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<CreditCard className="h-4 w-4" />
										)}
										Get this badge
									</Button>
								</motion.div>
							))}
						</div>
					</section>
				)}

				<div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button
						size="lg"
						variant="outline"
						className="gap-2"
						type="button"
						onClick={() =>
							toast.message(
								"Send SOL from Phantom or any Solana wallet to this creator’s address (shown on their dashboard).",
							)
						}
					>
						<Sparkles className="h-4 w-4" />
						SOL tip (wallet)
					</Button>
				</div>
				<p className="mt-4 text-center text-xs text-muted-foreground">
					Card tips use Stripe Checkout. Configure{" "}
					<code className="rounded bg-muted px-1 py-0.5 text-[10px]">STRIPE_SECRET_KEY</code>{" "}
					and webhooks for production.
				</p>

				{profile.campaigns.length > 0 && (
					<section className="mt-14">
						<h2 className="mb-4 text-lg font-semibold">Campaigns</h2>
						<div className="space-y-3">
							{profile.campaigns.map((c, i) => (
								<motion.div
									key={c.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.05 * i }}
									className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="font-semibold">{c.title}</h3>
											<Badge variant="secondary">{c.status}</Badge>
										</div>
										{c.description && (
											<p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
										)}
									</div>
									<Button
										variant="outline"
										disabled={loadingKey !== null}
										onClick={() => {
											const cents = parseCustomCents
											if (cents == null || cents < 50) {
												toast.error("Set an amount of at least $0.50 in the field above first.")
												return
											}
											void handleCardTip({
												amountCents: cents,
												campaignId: c.id,
												key: `camp-${c.id}`,
											})
										}}
									>
										{loadingKey === `camp-${c.id}` ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<>
												Tip with amount above
												<ArrowRight className="ml-1 h-4 w-4" />
											</>
										)}
									</Button>
								</motion.div>
							))}
						</div>
						<p className="mt-3 text-xs text-muted-foreground">
							Enter your tip in the card section above, then apply it to a campaign here.
						</p>
					</section>
				)}
			</main>
		</div>
	)
}
