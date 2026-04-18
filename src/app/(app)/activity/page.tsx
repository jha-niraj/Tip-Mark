import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { History } from "lucide-react"

/** Supporter tip history (server shell). */
export default async function ActivityPage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")
	if (session.user.role !== "SUPPORTER") redirect("/home")

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
				<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<History className="h-6 w-6 text-primary" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight">Activity</h1>
						<p className="mt-2 max-w-lg text-muted-foreground leading-relaxed">
							Every card tip you&apos;ve sent, with receipts and creator context.
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
						Tip history will load here from server actions.
					</p>
				</div>
			</main>
		</div>
	)
}
