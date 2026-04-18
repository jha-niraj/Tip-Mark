import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Megaphone } from "lucide-react"

/**
 * Campaign list (server). Create/edit flows use a right Sheet — no `/campaigns/new` route.
 */
export default async function CampaignsPage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")
	if (session.user.role !== "CREATOR") redirect("/home")

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
				<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<Megaphone className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
						<p className="mt-2 max-w-lg text-muted-foreground leading-relaxed">
							Launch goals your supporters can tip toward. New campaigns open in a
							side panel — not a separate page.
						</p>
					</div>
					<p className="text-sm text-muted-foreground">
						<Link className="text-primary underline-offset-4 hover:underline" href="/home">
							← Dashboard
						</Link>
					</p>
				</div>
				<div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
					<p className="text-muted-foreground">
						Campaign list and “New campaign” Sheet will load here.
					</p>
				</div>
			</main>
		</div>
	)
}
