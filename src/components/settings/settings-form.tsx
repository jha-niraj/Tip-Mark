"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCreatorProfile } from "@/actions/creator-profile"
import type { CreatorProfile } from "@/generated/prisma/client"
import { toast } from "sonner"

export function SettingsForm({ profile }: { profile: CreatorProfile | null }) {
	const [displayName, setDisplayName] = useState(profile?.displayName ?? "")
	const [slug, setSlug] = useState(profile?.slug ?? "")
	const [bio, setBio] = useState(profile?.bio ?? "")
	const [solanaWallet, setSolanaWallet] = useState(profile?.solanaWallet ?? "")
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		const res = await updateCreatorProfile({
			displayName: displayName.trim(),
			slug: slug.trim(),
			bio: bio.trim() || undefined,
			solanaWallet: solanaWallet.trim() || null,
		})
		setLoading(false)
		if (!res.ok) {
			toast.error(res.error)
			return
		}
		toast.success("Profile saved")
		if (res.ok && "profile" in res && res.profile) {
			setSlug(res.profile.slug)
		}
	}

	return (
		<motion.form
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			onSubmit={(e) => void handleSubmit(e)}
			className="mx-auto max-w-xl space-y-6"
		>
			<div className="space-y-2">
				<Label htmlFor="displayName">Display name</Label>
				<Input
					id="displayName"
					value={displayName}
					onChange={(e) => setDisplayName(e.target.value)}
					placeholder="How you appear publicly"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="slug">Public URL</Label>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">/u/</span>
					<Input
						id="slug"
						value={slug}
						onChange={(e) =>
							setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
						}
						placeholder="yourname"
						className="font-mono"
					/>
				</div>
			</div>
			<div className="space-y-2">
				<Label htmlFor="bio">Bio</Label>
				<Input
					id="bio"
					value={bio}
					onChange={(e) => setBio(e.target.value)}
					placeholder="A short line for your tip page"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="sol">Solana receive wallet</Label>
				<Input
					id="sol"
					value={solanaWallet}
					onChange={(e) => setSolanaWallet(e.target.value.trim())}
					placeholder="Base58 address (optional)"
					className="font-mono text-sm"
				/>
			</div>

			<div className="rounded-xl border border-border bg-muted/30 p-4">
				<p className="text-sm font-medium">Stripe Connect</p>
				<p className="mt-1 text-xs text-muted-foreground">
					{profile?.stripeChargesEnabled
						? "Charges enabled — you can receive card tips."
						: "Onboarding will connect here. For now, add STRIPE_SECRET_KEY and wire Connect in a follow-up."}
				</p>
			</div>

			<div className="flex flex-wrap gap-3">
				<Button type="submit" disabled={loading}>
					{loading ? (
						<>
							<Loader2 className="animate-spin" /> Saving
						</>
					) : (
						"Save profile"
					)}
				</Button>
				{profile && (
					<Button variant="outline" type="button" asChild>
						<Link href={`/u/${profile.slug}`} target="_blank" rel="noreferrer">
							<ExternalLink className="mr-1 h-4 w-4" />
							View public page
						</Link>
					</Button>
				)}
			</div>
		</motion.form>
	)
}
