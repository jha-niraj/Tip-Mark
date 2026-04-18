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
	/** Last 30 days, card tips only (USD cents per calendar day, UTC). */
	raisedByDay: { day: string; cents: number }[]
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
			raisedByDay: [],
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
				include: { supporter: true, campaign: true, creatorBadge: true },
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

	const thirtyDaysAgo = new Date()
	thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

	const cardTipsSeries = await prisma.tip.findMany({
		where: {
			creatorProfileId: profile.id,
			rail: TipRail.STRIPE,
			status: TipStatus.SUCCEEDED,
			createdAt: { gte: thirtyDaysAgo },
			amountCents: { not: null },
		},
		select: { amountCents: true, createdAt: true },
	})

	const byDay = new Map<string, number>()
	for (const t of cardTipsSeries) {
		const d = t.createdAt.toISOString().slice(0, 10)
		byDay.set(d, (byDay.get(d) ?? 0) + (t.amountCents ?? 0))
	}
	const raisedByDay: { day: string; cents: number }[] = []
	for (let i = 29; i >= 0; i--) {
		const d = new Date()
		d.setUTCDate(d.getUTCDate() - i)
		const key = d.toISOString().slice(0, 10)
		raisedByDay.push({ day: key, cents: byDay.get(key) ?? 0 })
	}

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
		raisedByDay,
		recentTips: recent.map(serializeTip),
		campaigns,
	}
}

export type SupporterBadgeEarned = {
	tipId: string
	earnedAt: string
	badgeName: string
	badgeEmoji: string | null
	amountCents: number
	creatorSlug: string
	creatorDisplayName: string | null
}

export type SupporterDashboardPayload = {
	stats: {
		tipsSent: number
		solTips: number
		cardTips: number
		totalCardCents: number
	}
	badgeEarned: SupporterBadgeEarned[]
	recentTips: SerializedTip[]
}

export async function getSupporterDashboardData(): Promise<SupporterDashboardPayload | null> {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id || session.user.role !== "SUPPORTER") return null

	const uid = session.user.id

	const [tipsSent, solTips, cardTips, cardSum, recent, badgeTips] = await Promise.all([
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
				creatorBadge: true,
			},
		}),
		prisma.tip.findMany({
			where: {
				supporterUserId: uid,
				status: TipStatus.SUCCEEDED,
				rail: TipRail.STRIPE,
				creatorBadgeId: { not: null },
			},
			orderBy: { createdAt: "desc" },
			take: 24,
			include: {
				creatorBadge: true,
				creatorProfile: true,
			},
		}),
	])

	const badgeEarned: SupporterBadgeEarned[] = badgeTips
		.filter((t) => t.creatorBadge && t.creatorProfile)
		.map((t) => ({
			tipId: t.id,
			earnedAt: t.createdAt.toISOString(),
			badgeName: t.creatorBadge!.name,
			badgeEmoji: t.creatorBadge!.emoji,
			amountCents: t.amountCents ?? t.creatorBadge!.amountCents,
			creatorSlug: t.creatorProfile!.slug,
			creatorDisplayName: t.creatorProfile!.displayName,
		}))

	return {
		stats: {
			tipsSent,
			solTips,
			cardTips,
			totalCardCents: cardSum._sum.amountCents ?? 0,
		},
		badgeEarned,
		recentTips: recent.map((t) => serializeTip(t)),
	}
}
