"use client"

import { useState } from "react"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { upsertCampaign, type CampaignInput } from "@/actions/campaigns"
import { toast } from "sonner"
import type { Campaign } from "@/generated/prisma/client"
import { Loader2 } from "lucide-react"

type Props = {
	open: boolean
	onOpenChange: (open: boolean) => void
	campaign: Campaign | null
	onSaved: () => void
}

function CampaignSheetForm({
	campaign,
	onOpenChange,
	onSaved,
}: Omit<Props, "open">) {
	const [title, setTitle] = useState(campaign?.title ?? "")
	const [description, setDescription] = useState(campaign?.description ?? "")
	const [goalDollars, setGoalDollars] = useState(
		campaign?.goalAmountCents != null ? String(campaign.goalAmountCents / 100) : "",
	)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!title.trim()) {
			toast.error("Title is required")
			return
		}
		setLoading(true)
		const goalCents =
			goalDollars.trim() === ""
				? null
				: Math.round(parseFloat(goalDollars) * 100)

		const payload: CampaignInput = {
			...(campaign?.id && { id: campaign.id }),
			title: title.trim(),
			description: description.trim() || undefined,
			goalAmountCents:
				goalCents != null && !Number.isNaN(goalCents) ? goalCents : null,
		}

		const res = await upsertCampaign(payload)
		setLoading(false)
		if (!res.ok) {
			toast.error(res.error)
			return
		}
		toast.success(campaign ? "Campaign updated" : "Campaign created")
		onOpenChange(false)
		onSaved()
	}

	return (
		<>
			<SheetHeader className="text-left">
				<SheetTitle>{campaign ? "Edit campaign" : "New campaign"}</SheetTitle>
				<SheetDescription>
					Card tips can be directed to a campaign. SOL tips stay general unless you
					extend flows later.
				</SheetDescription>
			</SheetHeader>
			<form
				onSubmit={(e) => void handleSubmit(e)}
				className="flex flex-1 flex-col gap-4 overflow-y-auto"
			>
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Launch week fund"
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="desc">Description</Label>
					<Input
						id="desc"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Optional"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="goal">Goal (USD, optional)</Label>
					<Input
						id="goal"
						type="number"
						min={0}
						step="0.01"
						value={goalDollars}
						onChange={(e) => setGoalDollars(e.target.value)}
						placeholder="0.00"
					/>
				</div>
				<SheetFooter className="mt-auto flex gap-2 pt-4 sm:justify-between">
					<Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="animate-spin" /> Saving
							</>
						) : (
							"Save"
						)}
					</Button>
				</SheetFooter>
			</form>
		</>
	)
}

export function CampaignSheet({ open, onOpenChange, campaign, onSaved }: Props) {
	const formKey = campaign?.id ?? "new"

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex w-full flex-col overflow-y-auto border-border sm:max-w-lg"
			>
				{open && (
					<CampaignSheetForm
						key={formKey}
						campaign={campaign}
						onOpenChange={onOpenChange}
						onSaved={onSaved}
					/>
				)}
			</SheetContent>
		</Sheet>
	)
}
