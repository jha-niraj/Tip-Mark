"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureCreatorProfile } from "@/actions/creator-profile"

export async function listMyCampaigns() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") return []

	const profile = await prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})
	if (!profile) return []

	return prisma.campaign.findMany({
		where: { creatorProfileId: profile.id },
		orderBy: { createdAt: "desc" },
	})
}

export type CampaignInput = {
	id?: string
	title: string
	description?: string
	goalAmountCents?: number | null
	status?: "ACTIVE" | "PAUSED" | "ENDED"
	endsAt?: Date | null
}

export async function upsertCampaign(input: CampaignInput) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") {
		return { ok: false as const, error: "Unauthorized" }
	}

	const ensured = await ensureCreatorProfile()
	if (!ensured.ok || !("profile" in ensured) || !ensured.profile) {
		return { ok: false as const, error: "Create your creator profile first." }
	}
	const profile = ensured.profile

	if (input.id) {
		const existing = await prisma.campaign.findFirst({
			where: { id: input.id, creatorProfileId: profile.id },
		})
		if (!existing) return { ok: false as const, error: "Campaign not found." }

		const campaign = await prisma.campaign.update({
			where: { id: input.id },
			data: {
				title: input.title,
				description: input.description ?? null,
				goalAmountCents: input.goalAmountCents ?? null,
				status: input.status ?? existing.status,
				endsAt: input.endsAt ?? null,
			},
		})
		revalidatePath("/campaigns")
		revalidatePath("/home")
		revalidatePath(`/u/${profile.slug}`)
		return { ok: true as const, campaign }
	}

	const campaign = await prisma.campaign.create({
		data: {
			creatorProfileId: profile.id,
			title: input.title,
			description: input.description ?? null,
			goalAmountCents: input.goalAmountCents ?? null,
			status: "ACTIVE",
			endsAt: input.endsAt ?? null,
		},
	})
	revalidatePath("/campaigns")
	revalidatePath("/home")
	revalidatePath(`/u/${profile.slug}`)
	return { ok: true as const, campaign }
}

export async function deleteCampaign(id: string) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") {
		return { ok: false as const, error: "Unauthorized" }
	}
	const profile = await prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})
	if (!profile) return { ok: false as const, error: "No profile" }

	const row = await prisma.campaign.findFirst({
		where: { id, creatorProfileId: profile.id },
	})
	if (!row) return { ok: false as const, error: "Not found" }

	await prisma.campaign.delete({ where: { id } })
	revalidatePath("/campaigns")
	revalidatePath("/home")
	revalidatePath(`/u/${profile.slug}`)
	return { ok: true as const }
}
