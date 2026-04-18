"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CampaignSheet } from "@/components/campaigns/campaign-sheet"
import { deleteCampaign, listMyCampaigns } from "@/actions/campaigns"
import type { Campaign } from "@/generated/prisma/client"
import { toast } from "sonner"

export function CampaignsClient({ initial }: { initial: Campaign[] }) {
	const [campaigns, setCampaigns] = useState(initial)
	const [sheetOpen, setSheetOpen] = useState(false)
	const [editing, setEditing] = useState<Campaign | null>(null)
	const searchParams = useSearchParams()
	const router = useRouter()

	const refresh = useCallback(async () => {
		const list = await listMyCampaigns()
		setCampaigns(list)
		router.refresh()
	}, [router])

	useEffect(() => {
		if (searchParams.get("new") === "1") {
			// Sync URL query → open sheet once (deep link from dashboard).
			queueMicrotask(() => {
				setEditing(null)
				setSheetOpen(true)
				router.replace("/campaigns", { scroll: false })
			})
		}
	}, [searchParams, router])

	const openNew = () => {
		setEditing(null)
		setSheetOpen(true)
	}

	const openEdit = (c: Campaign) => {
		setEditing(c)
		setSheetOpen(true)
	}

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this campaign?")) return
		const res = await deleteCampaign(id)
		if (!res.ok) {
			toast.error(res.error)
			return
		}
		toast.success("Campaign removed")
		void refresh()
	}

	return (
		<>
			<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<Megaphone className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
					<p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">
						Optional goals for card tips. Create or edit in the side panel — no separate
						/new page.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button onClick={openNew} className="gap-2">
						<Plus className="h-4 w-4" />
						New campaign
					</Button>
					<Button variant="outline" asChild>
						<Link href="/home">Dashboard</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-4">
				{campaigns.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						className="rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-16 text-center"
					>
						<p className="text-muted-foreground">
							No campaigns yet. Tip: tie a campaign to a launch, milestone, or themed
							week.
						</p>
						<Button className="mt-4" onClick={openNew}>
							Create your first
						</Button>
					</motion.div>
				) : (
					campaigns.map((c, i) => (
						<motion.div
							key={c.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.04 * i }}
							className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
						>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h2 className="text-lg font-semibold">{c.title}</h2>
									<Badge variant="secondary">{c.status}</Badge>
								</div>
								{c.description && (
									<p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
								)}
								<p className="mt-2 text-xs text-muted-foreground">
									{c.goalAmountCents != null
										? `Goal: $${(c.goalAmountCents / 100).toFixed(2)}`
										: "No goal set"}
								</p>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={() => openEdit(c)}>
									<Pencil className="mr-1 h-3.5 w-3.5" />
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="text-destructive"
									onClick={() => void handleDelete(c.id)}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>
						</motion.div>
					))
				)}
			</div>

			<CampaignSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				campaign={editing}
				onSaved={() => void refresh()}
			/>
		</>
	)
}
