"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TipRail, TipStatus } from "@/generated/prisma/client"
import { serializeTip, type SerializedTip } from "@/lib/serialize-tip"

export type CreatorDashboardPayload = {
	profile: {
		id: string
		slug: string
		displayName: string | null
		stripeChargesEnabled: boolean
		solanaWallet: string | null
	} | null
	stats: {
		totalTips: number
		succeededTips: number
		solTipsCount: number
		cardTipsCount: number
		totalCardCents: number
		activeCampaigns: number
	}
	recentTips: SerializedTip[]
	campaigns: { id: string; title: string; status: string; goalAmountCents: number | null }[]
}

export async function getCreatorDashboardData(): Promise<CreatorDashboardPayload | null> {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "CREATOR") return null

	const profile = await prisma.creatorProfile.findUnique({
		where: { userId: session.user.id },
	})

	if (!profile) {
		return {
			profile: null,
			stats: {
				totalTips: 0,
				succeededTips: 0,
				solTipsCount: 0,
				cardTipsCount: 0,
				totalCardCents: 0,
				activeCampaigns: 0,
			},
			recentTips: [],
			campaigns: [],
		}
	}

	const [totalTips, succeededTips, solCount, cardCount, recent, campaigns, activeCampCount] =
		await Promise.all([
			prisma.tip.count({ where: { creatorProfileId: profile.id } }),
			prisma.tip.count({
				where: { creatorProfileId: profile.id, status: TipStatus.SUCCEEDED },
			}),
			prisma.tip.count({
				where: {
					creatorProfileId: profile.id,
					rail: TipRail.SOLANA,
					status: TipStatus.SUCCEEDED,
				},
			}),
			prisma.tip.count({
				where: {
					creatorProfileId: profile.id,
					rail: TipRail.STRIPE,
					status: TipStatus.SUCCEEDED,
				},
			}),
			prisma.tip.findMany({
				where: { creatorProfileId: profile.id },
				orderBy: { createdAt: "desc" },
				take: 8,
				include: { supporter: true, campaign: true },
			}),
			prisma.campaign.findMany({
				where: { creatorProfileId: profile.id },
				orderBy: { createdAt: "desc" },
				take: 6,
				select: { id: true, title: true, status: true, goalAmountCents: true },
			}),
			prisma.campaign.count({
				where: { creatorProfileId: profile.id, status: "ACTIVE" },
			}),
		])

	const cardSum = await prisma.tip.aggregate({
		where: {
			creatorProfileId: profile.id,
			rail: TipRail.STRIPE,
			status: TipStatus.SUCCEEDED,
		},
		_sum: { amountCents: true },
	})

	return {
		profile: {
			id: profile.id,
			slug: profile.slug,
			displayName: profile.displayName,
			stripeChargesEnabled: profile.stripeChargesEnabled,
			solanaWallet: profile.solanaWallet,
		},
		stats: {
			totalTips,
			succeededTips,
			solTipsCount: solCount,
			cardTipsCount: cardCount,
			totalCardCents: cardSum._sum.amountCents ?? 0,
			activeCampaigns: activeCampCount,
		},
		recentTips: recent.map(serializeTip),
		campaigns,
	}
}

export type SupporterDashboardPayload = {
	stats: {
		tipsSent: number
		solTips: number
		cardTips: number
		totalCardCents: number
	}
	recentTips: SerializedTip[]
}

export async function getSupporterDashboardData(): Promise<SupporterDashboardPayload | null> {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "SUPPORTER") return null

	const uid = session.user.id

	const [tipsSent, solTips, cardTips, cardSum, recent] = await Promise.all([
		prisma.tip.count({ where: { supporterUserId: uid } }),
		prisma.tip.count({
			where: { supporterUserId: uid, rail: TipRail.SOLANA, status: TipStatus.SUCCEEDED },
		}),
		prisma.tip.count({
			where: { supporterUserId: uid, rail: TipRail.STRIPE, status: TipStatus.SUCCEEDED },
		}),
		prisma.tip.aggregate({
			where: {
				supporterUserId: uid,
				rail: TipRail.STRIPE,
				status: TipStatus.SUCCEEDED,
			},
			_sum: { amountCents: true },
		}),
		prisma.tip.findMany({
			where: { supporterUserId: uid },
			orderBy: { createdAt: "desc" },
			take: 8,
			include: {
				campaign: true,
				creatorProfile: true,
				supporter: true,
			},
		}),
	])

	// serializeTip expects supporter on tip - for supporter view we need creator name from creatorProfile
	return {
		stats: {
			tipsSent,
			solTips,
			cardTips,
			totalCardCents: cardSum._sum.amountCents ?? 0,
		},
		recentTips: recent.map((t) => serializeTip(t)),
	}
}
