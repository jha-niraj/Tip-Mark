import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listMyCampaigns } from "@/actions/campaigns"
import { CampaignsClient } from "@/components/campaigns/campaigns-client"

export default async function CampaignsPage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")
	if (session.user.role !== "CREATOR") redirect("/home")

	const campaigns = await listMyCampaigns()

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
				<Suspense
					fallback={
						<div className="py-20 text-center text-muted-foreground">Loading…</div>
					}
				>
					<CampaignsClient initial={campaigns} />
				</Suspense>
			</main>
		</div>
	)
}
