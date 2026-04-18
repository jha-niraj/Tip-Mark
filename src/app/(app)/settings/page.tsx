import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Settings } from "lucide-react"
import { getCreatorProfileForUser } from "@/actions/creator-profile"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")

	if (session.user.role !== "CREATOR") {
		return (
			<div className="min-h-screen bg-background">
				<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
					<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
								<Settings className="h-6 w-6 text-primary" />
							</div>
							<h1 className="text-3xl font-bold tracking-tight">Account</h1>
							<p className="mt-2 max-w-lg text-muted-foreground leading-relaxed">
								Supporter accounts use email sign-in only for now.
							</p>
						</div>
						<Link
							href="/home"
							className="text-sm text-primary underline-offset-4 hover:underline"
						>
							← Dashboard
						</Link>
					</div>
					<div className="rounded-2xl border border-border bg-card p-8">
						<p className="text-sm text-muted-foreground">
							Signed in as <span className="font-medium text-foreground">{session.user.email}</span>
						</p>
					</div>
				</main>
			</div>
		)
	}

	const profile = await getCreatorProfileForUser()

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
				<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<Settings className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
						<p className="mt-2 max-w-lg text-muted-foreground leading-relaxed">
							Public profile, Solana wallet, and Stripe payouts.
						</p>
					</div>
					<Link
						href="/home"
						className="text-sm text-primary underline-offset-4 hover:underline"
					>
						← Dashboard
					</Link>
				</div>
				<SettingsForm profile={profile} />
			</main>
		</div>
	)
}
