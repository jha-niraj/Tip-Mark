"use client"

import { motion } from "framer-motion"
import { ArrowRight, CreditCard, Sparkles, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthModal } from "@/components/auth/auth-modal-context"
import { useSession } from "next-auth/react"
import { createTipCheckoutSession } from "@/actions/checkout"
import { toast } from "sonner"
import type { Campaign, CreatorProfile } from "@/generated/prisma/client"

type Props = {
	profile: CreatorProfile & { campaigns: Campaign[] }
}

export function PublicCreatorPage({ profile }: Props) {
	const { data: session } = useSession()
	const { openSignIn } = useAuthModal()

	const handleCardTip = async (campaignId?: string) => {
		if (!session) {
			openSignIn("supporter")
			toast.message("Sign in to complete card tips with Stripe.")
			return
		}
		const res = await createTipCheckoutSession({
			creatorProfileId: profile.id,
			campaignId: campaignId ?? null,
			amountCents: 500,
		})
		if (!res.ok) {
			toast.error("error" in res ? res.error : "Checkout unavailable")
		}
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
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
							{(profile.displayName ?? profile.slug).slice(0, 1).toUpperCase()}
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
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button
						size="lg"
						className="gap-2"
						onClick={() => void handleCardTip()}
					>
						<CreditCard className="h-4 w-4" />
						Tip with card
						<ArrowRight className="h-4 w-4" />
					</Button>
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
					SOL tips: send from your wallet to the creator&apos;s address on their dashboard.
					Card tips use Stripe when configured.
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
									<Button variant="outline" onClick={() => void handleCardTip(c.id)}>
										Tip this campaign
									</Button>
								</motion.div>
							))}
						</div>
					</section>
				)}
			</main>
		</div>
	)
}
