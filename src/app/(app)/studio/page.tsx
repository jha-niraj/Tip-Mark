import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { ExternalLink, LayoutTemplate } from "lucide-react"
import { authOptions } from "@/lib/auth"
import {
	ensureCreatorProfile,
	getCreatorProfileForUser,
} from "@/actions/creator-profile"
import { SettingsForm } from "@/components/settings/settings-form"
import { Button } from "@/components/ui/button"

export default async function StudioPage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")
	if (session.user.role !== "CREATOR") redirect("/home")

	const ensured = await ensureCreatorProfile()
	if (!ensured.ok) redirect("/home")

	const profile = await getCreatorProfileForUser()

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
				<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<LayoutTemplate className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight">Studio</h1>
						<p className="mt-2 max-w-lg text-muted-foreground leading-relaxed">
							Everything supporters see on your public page — name, bio, avatar, and URL.
							Use preview to open exactly what they&apos;ll get (your live{" "}
							<code className="rounded bg-muted px-1 py-0.5 text-xs">/u/</code> page).
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{profile?.slug && (
							<Button asChild className="gap-2">
								<Link href={`/u/${profile.slug}`} target="_blank" rel="noreferrer">
									<ExternalLink className="h-4 w-4" />
									Preview public page
								</Link>
							</Button>
						)}
						<Button variant="outline" asChild>
							<Link href="/badges">Manage badges</Link>
						</Button>
					</div>
				</div>

				<div className="mb-8 rounded-2xl border border-primary/25 bg-primary/5 p-5 text-sm text-muted-foreground">
					<p>
						<strong className="text-foreground">Tip:</strong> Your public URL is{" "}
						{profile?.slug ? (
							<code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">
								/u/{profile.slug}
							</code>
						) : (
							"set after saving"
						)}
						. Payout methods and Solana wallet live in{" "}
						<Link href="/settings" className="font-medium text-primary underline-offset-4 hover:underline">
							Settings
						</Link>
						.
					</p>
				</div>

				<SettingsForm profile={profile} />
			</main>
		</div>
	)
}
