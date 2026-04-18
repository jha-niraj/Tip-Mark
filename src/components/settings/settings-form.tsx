"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, ImagePlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCreatorProfile } from "@/actions/creator-profile"
import { uploadImageToCloudinary } from "@/actions/shared/upload.action"
import type { CreatorProfile } from "@/generated/prisma/client"
import { toast } from "sonner"

export function SettingsForm({ profile }: { profile: CreatorProfile | null }) {
	const fileRef = useRef<HTMLInputElement>(null)
	const [displayName, setDisplayName] = useState(profile?.displayName ?? "")
	const [slug, setSlug] = useState(profile?.slug ?? "")
	const [bio, setBio] = useState(profile?.bio ?? "")
	const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "")
	const [solanaWallet, setSolanaWallet] = useState(profile?.solanaWallet ?? "")
	const [loading, setLoading] = useState(false)
	const [uploadingAvatar, setUploadingAvatar] = useState(false)

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		e.target.value = ""
		if (!file) return

		setUploadingAvatar(true)
		const fd = new FormData()
		fd.append("file", file)
		const res = await uploadImageToCloudinary(fd)
		setUploadingAvatar(false)

		if (!res.success || !res.url) {
			toast.error(res.message)
			return
		}

		setAvatarUrl(res.url)
		const save = await updateCreatorProfile({ avatarUrl: res.url })
		if (!save.ok) {
			toast.error(save.error)
			return
		}
		toast.success("Avatar saved")
	}

	const clearAvatar = async () => {
		setUploadingAvatar(true)
		const save = await updateCreatorProfile({ avatarUrl: null })
		setUploadingAvatar(false)
		if (!save.ok) {
			toast.error(save.error)
			return
		}
		setAvatarUrl("")
		toast.success("Avatar removed")
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		const res = await updateCreatorProfile({
			displayName: displayName.trim(),
			slug: slug.trim(),
			bio: bio.trim() || undefined,
			avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
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
			<input
				ref={fileRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp"
				className="sr-only"
				onChange={(e) => void handleAvatarChange(e)}
			/>

			<div className="space-y-3">
				<Label>Profile photo</Label>
				<p className="text-xs text-muted-foreground">
					JPG, PNG, or WebP · max 5MB · uploaded to Cloudinary and shown on your public page.
				</p>
				<div className="flex flex-wrap items-center gap-4">
					<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
						{avatarUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={avatarUrl} alt="" className="h-full w-full object-cover" />
						) : (
							<span className="text-2xl font-semibold text-muted-foreground">
								{(displayName || slug || "?").slice(0, 1).toUpperCase()}
							</span>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="secondary"
							disabled={uploadingAvatar}
							onClick={() => fileRef.current?.click()}
							className="gap-2"
						>
							{uploadingAvatar ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<ImagePlus className="h-4 w-4" />
							)}
							Upload image
						</Button>
						{avatarUrl ? (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								disabled={uploadingAvatar}
								onClick={() => void clearAvatar()}
								aria-label="Remove avatar"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						) : null}
					</div>
				</div>
			</div>

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
				<Button type="submit" disabled={loading || uploadingAvatar}>
					{loading ? (
						<>
							<Loader2 className="animate-spin" /> Saving
						</>
					) : (
						"Save profile"
					)}
				</Button>
				{profile && slug.length >= 3 && (
					<Button variant="outline" type="button" asChild>
						<Link href={`/u/${slug}`} target="_blank" rel="noreferrer">
							<ExternalLink className="mr-1 h-4 w-4" />
							View public page
						</Link>
					</Button>
				)}
			</div>
		</motion.form>
	)
}
