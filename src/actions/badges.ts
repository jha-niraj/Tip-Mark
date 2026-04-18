"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureCreatorProfile } from "@/actions/creator-profile"

export async function listCreatorBadges() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") return []

	const profile = await prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})
	if (!profile) return []

	return prisma.creatorBadge.findMany({
		where: { creatorProfileId: profile.id },
		orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
	})
}

export async function createCreatorBadge(input: {
	name: string
	description?: string | null
	amountCents: number
	emoji?: string | null
}) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") {
		return { ok: false as const, error: "Unauthorized" }
	}

	const ensured = await ensureCreatorProfile()
	if (!ensured.ok || !("profile" in ensured) || !ensured.profile) {
		return { ok: false as const, error: "Could not load profile" }
	}

	const name = input.name.trim()
	if (!name) return { ok: false as const, error: "Name is required." }

	const amountCents = Math.round(input.amountCents)
	if (!Number.isFinite(amountCents) || amountCents < 50) {
		return { ok: false as const, error: "Amount must be at least $0.50." }
	}

	const maxOrder = await prisma.creatorBadge.aggregate({
		where: { creatorProfileId: ensured.profile.id },
		_max: { sortOrder: true },
	})

	const badge = await prisma.creatorBadge.create({
		data: {
			creatorProfileId: ensured.profile.id,
			name,
			description: input.description?.trim() || null,
			amountCents,
			emoji: input.emoji?.trim() || null,
			sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
		},
	})

	revalidatePath("/badges")
	revalidatePath("/studio")
	revalidatePath("/home")
	revalidatePath(`/u/${ensured.profile.slug}`)
	return { ok: true as const, badge }
}

export async function deleteCreatorBadge(id: string) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") {
		return { ok: false as const, error: "Unauthorized" }
	}

	const profile = await prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})
	if (!profile) return { ok: false as const, error: "No profile" }

	const existing = await prisma.creatorBadge.findFirst({
		where: { id, creatorProfileId: profile.id },
	})
	if (!existing) return { ok: false as const, error: "Not found" }

	await prisma.creatorBadge.delete({ where: { id } })

	revalidatePath("/badges")
	revalidatePath("/studio")
	revalidatePath("/home")
	revalidatePath(`/u/${profile.slug}`)
	return { ok: true as const }
}

export async function updateCreatorBadge(
	id: string,
	input: {
		name?: string
		description?: string | null
		amountCents?: number
		emoji?: string | null
		sortOrder?: number
	},
) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") {
		return { ok: false as const, error: "Unauthorized" }
	}

	const profile = await prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})
	if (!profile) return { ok: false as const, error: "No profile" }

	const existing = await prisma.creatorBadge.findFirst({
		where: { id, creatorProfileId: profile.id },
	})
	if (!existing) return { ok: false as const, error: "Not found" }

	if (input.amountCents !== undefined) {
		const ac = Math.round(input.amountCents)
		if (!Number.isFinite(ac) || ac < 50) {
			return { ok: false as const, error: "Amount must be at least $0.50." }
		}
	}

	const badge = await prisma.creatorBadge.update({
		where: { id },
		data: {
			...(input.name !== undefined && { name: input.name.trim() }),
			...(input.description !== undefined && {
				description: input.description?.trim() || null,
			}),
			...(input.amountCents !== undefined && {
				amountCents: Math.round(input.amountCents),
			}),
			...(input.emoji !== undefined && { emoji: input.emoji?.trim() || null }),
			...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
		},
	})

	revalidatePath("/badges")
	revalidatePath("/studio")
	revalidatePath("/home")
	revalidatePath(`/u/${profile.slug}`)
	return { ok: true as const, badge }
}
