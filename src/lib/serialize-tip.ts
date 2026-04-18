import type {
	Tip,
	User,
	Campaign,
	CreatorProfile,
	CreatorBadge,
} from "@/generated/prisma/client"

export type SerializedTip = {
	id: string
	rail: string
	amountCents: number | null
	currency: string | null
	amountSol: string | null
	status: string
	message: string | null
	createdAt: string
	tipperWallet: string | null
	campaign: { id: string; title: string } | null
	supporter: { id: string; name: string | null; email: string } | null
	creatorSlug?: string | null
	creatorDisplayName?: string | null
	badge: {
		id: string
		name: string
		emoji: string | null
		amountCents: number
	} | null
}

export function serializeTip(
	tip: Tip & {
		supporter?: User | null
		campaign?: Campaign | null
		creatorProfile?: Pick<CreatorProfile, "slug" | "displayName"> | null
		creatorBadge?: CreatorBadge | null
	},
): SerializedTip {
	return {
		id: tip.id,
		rail: tip.rail,
		amountCents: tip.amountCents,
		currency: tip.currency,
		amountSol: tip.amountSol != null ? tip.amountSol.toString() : null,
		status: tip.status,
		message: tip.message,
		createdAt: tip.createdAt.toISOString(),
		tipperWallet: tip.tipperWallet,
		campaign: tip.campaign
			? { id: tip.campaign.id, title: tip.campaign.title }
			: null,
		supporter: tip.supporter
			? {
					id: tip.supporter.id,
					name: tip.supporter.name,
					email: tip.supporter.email,
				}
			: null,
		creatorSlug: tip.creatorProfile?.slug ?? null,
		creatorDisplayName: tip.creatorProfile?.displayName ?? null,
		badge: tip.creatorBadge
			? {
					id: tip.creatorBadge.id,
					name: tip.creatorBadge.name,
					emoji: tip.creatorBadge.emoji,
					amountCents: tip.creatorBadge.amountCents,
				}
			: null,
	}
}
