"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function slugFromEmail(email: string): string {
	const local = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9-]/g, "") || "creator"
	return local.slice(0, 24).replace(/^-+|-+$/g, "") || "creator"
}

async function uniqueSlug(base: string): Promise<string> {
	let candidate = base
	let n = 0
	while (await prisma.creatorProfile.findUnique({ where: { slug: candidate } })) {
		n += 1
		candidate = `${base}-${n}`
	}
	return candidate
}

export async function ensureCreatorProfile() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") {
		return { ok: false as const, error: "Not a creator" }
	}

	const existing = await prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})
	if (existing) return { ok: true as const, profile: existing }

	const slug = await uniqueSlug(slugFromEmail(session.user.email ?? "creator"))
	const profile = await prisma.creatorProfile.create({
		data: {
			userId: session.user.id,
			slug,
			displayName: session.user.name ?? session.user.email?.split("@")[0] ?? "Creator",
		},
	})
	revalidatePath("/home")
	revalidatePath("/settings")
	return { ok: true as const, profile }
}

export async function getCreatorProfileForUser() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return null
	return prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})
}

export type UpdateCreatorProfileInput = {
	displayName?: string
	bio?: string
	avatarUrl?: string
	slug?: string
	solanaWallet?: string | null
}

export async function updateCreatorProfile(input: UpdateCreatorProfileInput) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") {
		return { ok: false as const, error: "Unauthorized" }
	}

	const ensured = await ensureCreatorProfile()
	if (!ensured.ok || !("profile" in ensured) || !ensured.profile) {
		return { ok: false as const, error: "Could not load profile" }
	}

	if (input.slug && input.slug.length >= 3) {
		const taken = await prisma.creatorProfile.findFirst({
			where: {
				slug: input.slug,
				NOT: { userId: session.user.id },
			},
		})
		if (taken) return { ok: false as const, error: "That URL is already taken." }
	}

	const profile = await prisma.creatorProfile.update({
		where: { userId: session.user.id },
		data: {
			...(input.displayName !== undefined && { displayName: input.displayName }),
			...(input.bio !== undefined && { bio: input.bio }),
			...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
			...(input.slug !== undefined && input.slug.length >= 3 && { slug: input.slug }),
			...(input.solanaWallet !== undefined && { solanaWallet: input.solanaWallet }),
		},
	})
	revalidatePath("/settings")
	revalidatePath("/home")
	revalidatePath(`/u/${profile.slug}`)
	return { ok: true as const, profile }
}

export async function getPublicCreatorBySlug(slug: string) {
	return prisma.creatorProfile.findUnique({
		where: { slug },
		include: {
			campaigns: {
				where: { status: "ACTIVE" },
				orderBy: { createdAt: "desc" },
			},
		},
	})
}
