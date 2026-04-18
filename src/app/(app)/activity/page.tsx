import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { History } from "lucide-react"
import { listSupporterActivityTips } from "@/actions/tips"
import { ActivityList } from "@/components/activity/activity-list"

export default async function ActivityPage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")
	if (session.user.role !== "SUPPORTER") redirect("/home")

	const tips = await listSupporterActivityTips()

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
							Every SOL and card tip you&apos;ve sent (unified ledger).
						</p>
					</div>
					<Link
						href="/home"
						className="text-sm text-primary underline-offset-4 hover:underline"
					>
						← Dashboard
					</Link>
				</div>
				<ActivityList tips={tips} />
			</main>
		</div>
	)
}
