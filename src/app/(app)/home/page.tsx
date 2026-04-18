import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
	const session = await getServerSession(authOptions)

	if (!session) {
		redirect("/")
	}

	const isCreator = session.user.role === "CREATOR"

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
				<div className="mb-16 text-center">
					<div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
						<LayoutDashboard className="h-8 w-8 text-primary" />
					</div>
					<h1 className="mb-3 text-4xl font-bold tracking-tight">
						{isCreator ? "Creator" : "Supporter"} dashboard
					</h1>
					<p className="mx-auto max-w-md text-lg text-muted-foreground leading-relaxed">
						{isCreator
							? "Manage campaigns, card tips via Stripe, and your public page — all from here."
							: "Track tips you’ve sent and discover creators to support."}
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Signed in as {session.user.email}
					</p>
				</div>

				{isCreator ? (
					<div className="grid gap-5 sm:grid-cols-3">
						{[
							{
								step: "01",
								title: "Connect payouts",
								desc: "Link Stripe so you can receive card tips.",
								cta: "Set up",
								href: null,
							},
							{
								step: "02",
								title: "Create campaigns",
								desc: "Optional goals your supporters can tip toward.",
								cta: "Open campaigns",
								href: "/campaigns",
							},
							{
								step: "03",
								title: "Share your page",
								desc: "One public link for tips and campaigns.",
								cta: "View settings",
								href: "/settings",
							},
						].map((item) => (
							<div
								key={item.step}
								className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
							>
								<span className="select-none text-4xl font-black text-border/60">
									{item.step}
								</span>
								<div>
									<h3 className="mb-1 text-base font-semibold">{item.title}</h3>
									<p className="text-sm text-muted-foreground">{item.desc}</p>
								</div>
								<div className="mt-auto">
									{item.href ? (
										<Button size="sm" className="w-fit" asChild>
											<Link href={item.href}>{item.cta}</Link>
										</Button>
									) : (
										<Button size="sm" className="w-fit" disabled>
											{item.cta}
										</Button>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="rounded-2xl border border-border bg-card p-8 text-center">
						<p className="text-muted-foreground">
							Supporter home will list recent tips and activity. See{" "}
							<a className="font-medium text-primary underline-offset-4 hover:underline" href="/activity">
								Activity
							</a>{" "}
							for full history.
						</p>
					</div>
				)}

				<p className="mt-10 text-center text-sm text-muted-foreground">
					Stripe flows and campaign sheets are documented in{" "}
					<code className="rounded bg-muted px-1.5 py-0.5 text-xs">/srs</code>.
				</p>
			</main>
		</div>
	)
}
