import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Award } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { listCreatorBadges } from "@/actions/badges"
import { BadgesManager } from "@/components/badges/badges-manager"

export default async function BadgesPage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")
	if (session.user.role !== "CREATOR") redirect("/home")

	const badges = await listCreatorBadges()

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
				<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<Award className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight">Badge tiers</h1>
						<p className="mt-2 max-w-lg text-muted-foreground leading-relaxed">
							Set fixed prices for supporter badges. Supporters can still send any custom
							amount without a badge from your public page.
						</p>
					</div>
					<Link
						href="/studio"
						className="text-sm text-primary underline-offset-4 hover:underline"
					>
						← Studio & preview
					</Link>
				</div>
				<BadgesManager initial={badges} />
			</main>
		</div>
	)
}
